<template>
<!--
This is a container to allow styling.
This should not have any overscroll hidden or it will hide the scrolling indicators which are allowed to go slightly outside the div (hence the margins set) for easier draggin.
All css variables are set here for maximum flexibility.
-->
<div
	:class="twMerge(`
		p-2
		container-styles
		relative
		border
		border-neutral-500
		rounded
		after:absolute
		after:border-transparent
		after:rounded
		after:pointer-events-none
		after:inset-[-2px]
		after:border-4
		transition-colors
		ease-[cubic-bezier(0,1,1,0)]
	`,
		/* after:inset-[calc(-1*var(--outerScrollMargin))]
		after:[border-width:var(--scrollBorder)] */
		isDragging && ` border-accent-500 `,
		scrollIndicator.right && `after:border-r-accent-500/60`,
		scrollIndicator.down && `after:border-b-accent-500/60`,
		scrollIndicator.left && `after:border-l-accent-500/60`,
		scrollIndicator.up && `after:border-t-accent-500/60`,
		triggerState && `border-blue-400`

	)"
	:style="`
		--keyW: ${keyW};
		--padding: calc(var(--keyW)*0.05px);
		--shadow: calc(var(--padding) - 1px);
		--fontSize: calc(var(--keyW)*0.24px);
		--scrollMargin: ${scrollMargin}px;
		--outerScrollMargin: ${outerScrollMargin}px;
		--scrollBorder: ${scrollMargin + outerScrollMargin}px;
		--height:${height}px;
	`"
>
	<div class="flex justify-between after:content-vertical-holder" @mouseenter="isDragging ? setManagerProp(manager, 'state.chain' , []) : undefined">
		<div
			class="flex-1"
			tabindex="0"
			@click="safeSetManagerChain(manager,[]);clearVirtuallyPressed(virtuallyPressedKeys, manager)"
			@keydown.space.prevent="safeSetManagerChain(manager,[]);clearVirtuallyPressed(virtuallyPressedKeys, manager)"
		>
			{{ manager.options.stringifier.stringify(manager.state.chain, manager) }}
			{{
				isDragging && chain.length > 0
					? "(Hover over to clear.)"
					: !newChainText && chain.length > 0
						? "(Click to clear.)"
						: ""
			}}
		</div>
		<div>
			{{
				newChainText
			}}
		</div>
		<div v-if="manager.state.untrigger">
			Triggers: {{ manager.options.stringifier.stringify(manager.state.untrigger, manager) }}
		</div>
	</div>
	<!--
	This is a container to allow scrolling.
	It should not have any margins or borders since the drag calculations do not include them.
	It can allow any overscroll and be set to any size.
	-->
	<div :class="twMerge(`
		container-scroll
		overscroll-contain
		overflow-scroll
		scrollbar-hidden
		text-[max(0.7rem,_var(--fontSize))]
		relative
		`)"
		ref="containerEl"
	>
		<!--
		This is the container that is hooked up to the manager which sets it's height (using the var set in the upper most container).
		It can set a min width to force it's parent to scroll.
		-->
		<div :class="twMerge( `
		container-keyboard-size
		min-w-[1200px]
		h-[var(--height)]
	` )"
			ref="keyboardEl"
		>
			<div
				:class="twMerge(
					keyClass,
					`
					absolute
					break-all
					p-[var(--padding)]
				`,
					(key.pressed || key.toggleOnPressed) && `
					pressed
				`,
					...key.classes,
				)"
				:style="`
				width:${key.width * keyW}px;
				height:${key.height * keyW}px;
				top:${key.y * keyW}px;
				left:${key.x * keyW}px;
			`"
				:key-id="key.id"
				tabindex="0"
				v-for="key of displayedKeys"
				:key="key.id"
				@click="toggleKeyState(key)"
				@mouseenter="openKey(key.id)"
				@mouseleave="closeKey"
				@keydown.space="toggleKeyState(key); $event.preventDefault(); $event.stopImmediatePropagation()"
			>
				<div :id="'key-'+key.id"
					:class="twMerge(`
						key
						no-touch-action
						border
						border-neutral-500
						h-full
						whitespace-pre
						shadow-[0_var(--shadow)_var(--shadow)_rgb(0_0_0/50%)]
						rounded-[var(--padding)]
						relative
						bg-bg
						grid
						grid-rows-[min-content,1fr]
						grid-cols-1
						before:border-[3px]
						before:border-transparent
						before:inset-[-3px]
						before:absolute
						before:rounded
						before:z-[-1]
						ease-[cubic-bezier(0,1,1,0)]
						`,
						triggerState && `
						border-blue-400
						`,
						key.pressed && `
						border-accent-600
						bg-accent-100
						before:bg-neutral-300
						`,
						!key.enabled && `
							border-neutral-600
							bg-neutral-200
						`,
						key.toggleOnPressed && `border-accent-600`,
						keyShortcutMap[key.id]?.isModifierHint && `
							before:border-neutral-300
						`,
						candidateKey && equalsKey(candidateKey.id, key.id, manager.keys) && canDrop === true && `
							border-accent-600
							bg-accent-200
						`,
						candidateKey && equalsKey(candidateKey.id,key.id, manager.keys) && canDrop !== true && `
							border-red-600
							bg-red-200
						`
					)"
					:title="key.label"
				>
					<div :class="twMerge(`
						label
						px-1
					`)"
					>
						<div class="truncate whitespace-pre-wrap">
							{{ key.label }}
						</div>
					</div>
					<!-- The padding needs to be on the shortcuts container and not the parent so that on hover we can still have the background with padding. -->
					<div :class="twMerge(`
							shortcuts
							truncate
							flex flex-col
							w-full
							overflow-hidden
							gap-[3px]
							px-[1px]
							pb-[1px]
						`,

						canOpen[key.id] && !isDragging && `
							z-[2]
							m-[-3px]
							mt-[-3.5px]
							min-w-[calc(100%+6px)]
							p-[3px]
							[overflow:unset]
							w-[min-content]
							rounded
							bg-bg
							border-[1px]
							border-neutral-300
						`,
						)"
						:data-contains-conflicting="keyShortcutMap[key.id]?.containsConflicting"
					>
						<div
							:class="twMerge(`
									${shortcutClass}
									truncate
									rounded-sm
									px-1
									flex-1
									border-2
									border-neutral-300
									hover:cursor-pointer
									flex
									items-center
									user-select-none
									xl:text-sm
								`,
								!isDragging && `
									hover:border-accent-500
								`,
								!canOpen[key.id] && `
									[&:not(:first-of-type)]:hidden
								`,
								keyShortcutMap[key.id]?.containsConflicting && `
									border-red-400
								`,
								isPressableChain && `
									border-transparent
									justify-center items-center
								`,
								isPressed && `
									border-accent-700
									bg-accent-200
								`,

							)

							"
							:data-is-pressable="isPressable"
							:data-is-pressable-chain="isPressableChain"
							:title="getTitle(keyShortcutMap[key.id]?.pressableEntries, i)"
							:shortcut-index="i"
							v-for="{shortcut, isPressed, isPressable, isPressableChain }, i in keyShortcutMap[key.id]?.pressableEntries"
							:key="manager.options.stringifier.stringify(shortcut, manager)"
						>
							<template v-if="!isPressableChain">
								{{ shortcut?.command ?? "(None)" }}
							</template>
							<!-- <lib-debug :value="{isPressable, isPressableChain}"/> -->
							<fa v-else icon="fa link" class="pointer-events-none"/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div
		v-if="grabbedShortcut && isDragging"
		class="
			fixed
			no-touch-action
			pointer-events-none
			z-[4]
			cursor-grab
			"
		:style="`left:${coords.x}px; top:${coords.y}px;`"
	>
		<div class="relative">
			<div v-if="typeof canDrop === 'string' && grabbedShortcut"
				class="
					whitespace-pre-wrap
					translate-y-[calc(-100%-4px)]
					absolute
					w-[300px]
					text-sm
					bg-bg
					border-2
					rounded
					border-neutral-300
					px-2
				"
			>
				{{ canDrop }}
			</div>
			<div
				class="
					border-2
					border-neutral-300
					bg-bg
					px-2
					rounded
					xl:text-sm
				"
			>
				<template v-if="!grabbedShortcut.isPressableChain">
					{{ grabbedShortcut?.shortcut.command ?? "(None)" }}
				</template>
				<fa v-else icon="fa link" class="pointer-events-none"/>
			</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { castType } from "@alanscodelog/utils/castType.js"
import { useScrollNearContainerEdges } from "@alanscodelog/vue-components/composables/useScrollNearContainerEdges.js"
import {
	attach,
	type createManagerEventListeners,
	detach,
	setManagerProp,
	setShortcutProp,
} from "shortcuts-manager"
import {
	generateKeyShortcutMap,
	getKeyFromIdOrVariant,
	safeSetManagerChain,
	shortcutSwapChords,
	virtualPress,
	virtualRelease,
} from "shortcuts-manager/helpers"
import type {
	Key,
	Manager,
	ShortcutInfo,
} from "shortcuts-manager/types"
import {
	cloneChain,
	equalsKey,
} from "shortcuts-manager/utils"
import { equalsKeys } from "shortcuts-manager/utils/equalsKeys.js"
import { twMerge } from "tailwind-merge"
import { computed, defineModel,inject,onBeforeUnmount,onMounted, onUnmounted, type Ref, ref, shallowRef, toRefs } from "vue"

import { clearVirtuallyPressed } from "../common/clearVirtuallyPressed.js"
import { createDropChain } from "../common/createDropChain.js"
import { transformShortcutAllowsChainRes } from "../common/transformShortcutAllowsChainRes.js"
import { type Filters, useFilterableShortcutsList } from "../composables/useFilterableShortcutsList.js"
import { useKeysLayout } from "../composables/useKeysLayout.js"
import * as usePointerCoordsJs from "../composables/usePointerCoords.js"
import { notificationHandlerSymbol } from "../injectionSymbols.js"


const props = defineProps<{
	manager: Manager
	listeners: ReturnType<typeof createManagerEventListeners>
	virtuallyPressedKeys: Record<string, boolean>
	triggerState: boolean
}>()
const { manager } = toRefs(props)
const chain = computed(() => manager.value.state.chain)

const shortcuts = computed(() => props.manager.shortcuts)
const filters = ref<Filters<boolean>>({
	onlyExecutable: true,
	onlyEnabled: true,
	showPressable: true,
	showPressableModOrChords: true,
	showUnpressable: false,
	showExactMatches: true,
})
const shortcutsList = useFilterableShortcutsList(manager, chain, filters)
const keyShortcutMap = computed(() => generateKeyShortcutMap(chain.value, shortcutsList.value, manager.value))
const keysList = computed(() => Object.values(props.manager.keys.entries))


const notificationHandler = inject(notificationHandlerSymbol)

const keyClass = "container-key"
const shortcutClass = "shortcut"


const displayedKeys = computed(() => keysList.value.filter(key => key.render))

const keyboardEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)

const { height, keyWidth: keyW } = useKeysLayout(props.manager.keys, keyboardEl)

const openedKey = shallowRef<string | undefined>()
const grabbedKey = shallowRef<{ key: Key, id: string } | undefined>()
const grabbedShortcut = shallowRef<ShortcutInfo | undefined>()
const candidateKey = shallowRef<{ key: Key, id: string } | undefined>()
const isDragging = defineModel<boolean>("isDragging",{ default: false })
const chainBeforeDrag = shallowRef<string[][]>([])

const getKeyEl = (e: PointerEvent): HTMLElement | undefined => (e?.target as HTMLElement).closest(`.${keyClass}`) as HTMLElement | undefined

const getShortcutEl = (e: PointerEvent): HTMLElement | undefined => (e?.target as HTMLElement).closest(`.${shortcutClass}`) as HTMLElement | undefined


const getKeyByElIdProp = (el?: HTMLElement): { key: Key, id: string } | undefined => {
	if (!el) return
	const id = el.getAttribute("key-id")
	if (!id) return undefined
	const res = getKeyFromIdOrVariant(id, manager.value.keys)
	if (res.isError) return undefined
	return { key: res.value[0], id }
}

const getShortcutByElIndexProp = (
	el?: HTMLElement,
	keyId?: string,
): ShortcutInfo | undefined => {
	if (!el || !keyId) return
	let i: string | number | null = el.getAttribute("shortcut-index")
	i = typeof i === "string" ? parseInt(i, 10) : i
	return i !== null && i > -1 ? keyShortcutMap.value[keyId].pressableEntries[i] : undefined
}


const openKey = (id: string): void => { openedKey.value = id }

const closeKey = (): void => { openedKey.value = undefined }

const draggingClear = (): void => {
	isDragging.value = false
	grabbedKey.value = undefined
	grabbedShortcut.value = undefined
	candidateKey.value = undefined
}

const canOpen = computed(() => {
	const obj: Record<string, boolean> = {}
	for (const key of displayedKeys.value) {
		obj[key.id] = (keyShortcutMap.value[key.id]?.pressableEntries.length) > 0 && openedKey.value === key.id
	}
	return obj
})

const newDragChain = computed(() => createDropChain(
	manager.value,
	chain.value,
	candidateKey.value?.id,
	// grabbedShortcut.value?.isPressableChain ? chainBeforeDrag.value.length : undefined
))
const getOldChainBase = () => {
	if (chainBeforeDrag.value && grabbedKey.value) {
		return [...chainBeforeDrag.value, [grabbedKey.value.id]]
	}
	return undefined
}

const canDrop = computed(() => {
	if (isDragging.value && newDragChain.value && grabbedShortcut.value) {
		const isSame = equalsKeys(grabbedShortcut.value.shortcut.chain, newDragChain.value, props.manager.keys)
		if (isSame) return "Cannot move shortcut to self."
		if (!grabbedKey.value?.key?.enabled) return false
		if (!grabbedShortcut.value?.isPressableChain) {
			const res = setShortcutProp(grabbedShortcut.value.shortcut, "chain", newDragChain.value!, props.manager, { check: "only" })
			return transformShortcutAllowsChainRes(res, grabbedShortcut.value.shortcut.chain, newDragChain.value, manager.value)
		}
		if (grabbedShortcut.value?.isPressableChain && newDragChain.value) {
			const oldChain = getOldChainBase()
			if (!oldChain) return "Cannot get old chain."
			const res = shortcutSwapChords(manager.value.shortcuts, oldChain, newDragChain.value, manager.value, { check: "only" })
			return transformShortcutAllowsChainRes(res, oldChain, newDragChain.value, manager.value)
		}
	}
	// this can happen right at drag start when we've still not moved over any other keys
	return "Cannot move shortcut to self."
})


const newChainText = computed(() => {
	if (newDragChain.value && canDrop.value === true) {
		const chainText = manager.value.options.stringifier.stringify(newDragChain.value, manager.value)
		if (grabbedShortcut.value?.isPressableChain) {
			return `(New chain base: ${chainText})`
		} else {
			return `(New shortcut: ${chainText})`
		}
	}
	return ""
})


const getTitle = (entries: ShortcutInfo[] | undefined, i: number): string => {
	if (!entries) return ""
	const name = entries[i]?.shortcut.command ?? "(None)"
	const isChain = entries[i].isPressableChain
	if (entries.length === 1) return isChain ? "Chain" : name
	if (entries.length > 1) return isChain ? "Conflicting Chain" : `Conflicting Shortcut: ${name}`
	return ""
}

const toggleKeyState = (key: Key): void => {
	if (!key.enabled) return
	// key will be pressed
	if (!key.pressed) {
		virtualPress(manager.value, key.id)
		// prevent the key from getting unpressed until it's released again
		key.updateStateOnAllEvents = false
	} else { // key will be released
		key.updateStateOnAllEvents = true
		virtualRelease(manager.value, key.id)
	}
}

const ignoreClick = (e: MouseEvent): void => {
	// prevent the click from propagating to children
	// requires the listener be attached in capture mode
	e.stopPropagation()
}
const capture = true

const {
	coords,
	setPointerCoords,
	setInitialPointerOffset,
} = usePointerCoordsJs.usePointerCoords()

const scrollMargin = 20
const outerScrollMargin = 15
const {
	scrollEdges,
	isScrolling,
	scrollIndicator,
	endScroll,
} = useScrollNearContainerEdges({
	containerEl,
	scrollMargin,
	outerScrollMargin,
})

function onDragStart(e: PointerEvent): void {
	if (e.target instanceof HTMLElement && !isDragging.value) {
		e.preventDefault()

		const key = getKeyByElIdProp(getKeyEl(e))
		if (!key) return
		grabbedKey.value = key

		const shortcutEl = getShortcutEl(e)
		const shortcutInfo = getShortcutByElIndexProp(shortcutEl, key.id)
		if (!shortcutEl || !shortcutInfo) return

		grabbedShortcut.value = shortcutInfo
		setInitialPointerOffset(e, shortcutEl)

		isDragging.value = true
		chainBeforeDrag.value = cloneChain(chain.value)
		// we purposely DON'T clear the chain before
		setManagerProp(manager.value, "state.isRecording", true).unwrap()
		// while dragging allow the manager to listen to key events on the document to change the chain
		attach(document, props.listeners)

		// todo try pointer capture
		window.addEventListener("pointermove", onDragMove)
		window.addEventListener("pointerup", onDragEnd)
		window.addEventListener("click", ignoreClick, capture)
	}
}


function onDragMove(e: PointerEvent): void {
	scrollEdges(e.clientX, e.clientY)
	if (isScrolling.value) {
		e.preventDefault()
		return
	}

	if (isDragging.value) {
		setPointerCoords(e)
		const key = getKeyByElIdProp(getKeyEl(e))
		if (key) {
			candidateKey.value = key
		} else {
			candidateKey.value = undefined
		}
		e.preventDefault()
	}
}

function onDragEnd(e: PointerEvent): void {
	endScroll()
	if (isDragging.value) {
		if (grabbedShortcut.value && newDragChain.value && canDrop.value === true) {
			let message: string | undefined
			if (!grabbedShortcut.value.isPressableChain) {
				const res = setShortcutProp(grabbedShortcut.value.shortcut, "chain", newDragChain.value, props.manager)
				const transformedRes = transformShortcutAllowsChainRes(res, grabbedShortcut.value.shortcut.chain, newDragChain.value, props.manager) as string | boolean
				if (typeof transformedRes === "string") {message = transformedRes}
			} else {
				const oldChain = getOldChainBase()
				if (oldChain) {
					const res = shortcutSwapChords(shortcuts.value, oldChain, newDragChain.value, props.manager)
					const transformedRes = transformShortcutAllowsChainRes(res, oldChain, newDragChain.value, props.manager)
					if (typeof transformedRes === "string") {message = transformedRes}
				}
			}

			if (message) { void notificationHandler?.notify({ message }) }
		}
		draggingClear()
		closeKey()
		// note we DON'T clear the chain before on purpose
		setManagerProp(manager.value, "state.isRecording", false)
		safeSetManagerChain(manager.value, chainBeforeDrag.value)
		detach(document, props.listeners)
		e.preventDefault()
	}
	chainBeforeDrag.value = []
	window.removeEventListener("pointermove", onDragMove)
	window.removeEventListener("pointerup", onDragEnd)
	window.removeEventListener("click", ignoreClick, capture)
}


onMounted(() => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	keyboardEl.value.addEventListener("pointerdown", onDragStart, { passive: false })
})


onBeforeUnmount(() => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	if (keyboardEl.value) {
		keyboardEl.value!.removeEventListener("pointerdown", onDragStart)
	}
	window.removeEventListener("pointermove", onDragMove)
	window.removeEventListener("pointerup", onDragEnd)
})

</script>

<!-- 	.iso-enter & { -->
<!-- 		box-shadow: none; -->
<!-- 		border: none; -->
<!-- 		position: relative; -->
<!---->
<!-- 		.label { -->
<!-- 			position: absolute; -->
<!-- 		} -->
<!---->
<!-- 		display:flex; -->
<!-- 		flex-direction: column; -->
<!-- 		// filter: drop-shadow(0 var(--shadow) calc(var(--padding)/2) rgb(0 0 0 / 50%)); -->
<!---->
<!-- 		&::before { -->
<!-- 			position: unset; -->
<!-- 			height: calc(1px * v-bind(keyW) - var(--padding) * 2 - 0px); -->
<!-- 			border: 1px solid black; -->
<!-- 			content: ""; -->
<!-- 			border-radius: var(--padding) var(--padding) 0 var(--padding); -->
<!-- 			margin-left: calc(-1 * var(--padding)); -->
<!-- 			background: white; -->
<!-- 			box-shadow: 0 var(--shadow) var(--shadow) rgb(0 0 0 / 50%); -->
<!---->
<!-- 		} -->
<!---->
<!-- 		&::after { -->
<!-- 			content: ""; -->
<!-- 			flex: 1 1 auto; -->
<!-- 			z-index: 1; -->
<!-- 			background: white; -->
<!-- 			border: 1px solid black; -->
<!-- 			width: calc(83.3%); -->
<!-- 			align-self: flex-end; -->
<!-- 			margin-top: -1px; -->
<!-- 			border-top: 0 solid white; //width must be 0 or we get artifact -->
<!-- 			border-radius: 0 0 var(--padding) var(--padding); -->
<!-- 			box-shadow: 0 var(--shadow) var(--shadow) rgb(0 0 0 / 50%); -->
<!-- 		} -->
<!-- 	} -->
<!-- } -->

