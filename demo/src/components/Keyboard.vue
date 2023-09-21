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
	`,
		/* after:inset-[calc(-1*var(--outerScrollMargin))]
		after:[border-width:var(--scrollBorder)] */
		isDragging && ` border-accent-500 `,
		scrollIndicator.right && `after:border-r-accent-500/60`,
		scrollIndicator.down && `after:border-b-accent-500/60`,
		scrollIndicator.left && `after:border-l-accent-500/60`,
		scrollIndicator.up && `after:border-t-accent-500/60`,
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
	<div class="flex justify-between after:content-vertical-holder" @mouseenter="isDragging ? manager.clearChain() : undefined">
		<div class="flex-1">
			{{ manager.stringifier.stringify(chain) }}
			{{ isDragging && chain.length > 0 ? "(Hover over to clear chain.)" : "" }}
		</div>
		<div class="">
			{{
				newChainText
			}}
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
					(key.value.pressed || key.value.on?.pressed) && `
					pressed
				`,
					...key.value.classes,
				)"
				:style="`
				width:${key.value.width * keyW}px;
				height:${key.value.height * keyW}px;
				top:${key.value.y * keyW}px;
				left:${key.value.x * keyW}px;
			`"
				:key-id="key.value.id"
				v-for="key of displayedKeys"
				:key="key.value.id"
				@click="toggleKeyState(key.value)"
				@mouseenter="openKey(key.value.id)"
				@mouseleave="closeKey"
			>
				<div :id="'key-'+key.value.id"
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
					`,
						key.value.pressed && `
						border-accent-600
						bg-accent-100
						before:bg-neutral-300
					`,
						key.value.on?.pressed && `border-accent-600`,
						shortcutsList[key.value.id]?.isModifierHint && `
							before:border-neutral-300
						`,
						candidateKey && key.value.equals(candidateKey) && canDrop === true && `
							border-accent-600
							bg-accent-200
						`,
						candidateKey && key.value.equals(candidateKey) && canDrop !== true && `
							border-red-600
							bg-red-200
						`
					)"
					:title="key.value.label"
				>
					<div :class="twMerge(`
						label
						px-1
					`)"
					>
						<div class="truncate">
							{{ key.value.label }}
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

						canOpen[key.value.id] && !isDragging && `
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
						:data-contains-conflicting="shortcutsList[key.value.id]?.containsConflicting"
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
								`,
								!isDragging && `
									hover:border-accent-500
								`,
								!canOpen[key.value.id] && `
									[&:not(:first-of-type)]:hidden
								`,
								shortcutsList[key.value.id]?.containsConflicting && `
									border-red-400
								`,
								isPressableChain && `
									border-transparent
									justify-center items-center
								`,
								isPressable && `
													`,

							)

							"
							:data-is-pressable="isPressable"
							:data-is-pressable-chain="isPressableChain"
							:title="getTitle(shortcutsList[key.value.id]?.entries, i)"
							:shortcut-index="i"
							v-for="{entry:shortcut, isPressable, isPressableChain }, i in shortcutsList[key.value.id]?.entries"
							:key="shortcut.toString()"
						>
							<template v-if="isPressable && !isPressableChain">
								{{ shortcut?.command?.name ?? "(None)" }}
							</template>
							<!-- <lib-debug :value="{isPressable, isPressableChain}"/> -->
							<fa v-if="isPressableChain" icon="fa link" class="pointer-events-none"/>
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
				"
			>
				<!-- {{ grabbedShortcut.entry?.command?.name ?? "(None)" }} -->
				<template v-if="grabbedShortcut.isPressable && !grabbedShortcut.isPressableChain">
					{{ grabbedShortcut?.entry.command?.name ?? "(None)" }}
				</template>
				<fa v-if="grabbedShortcut.isPressableChain" icon="fa link" class="pointer-events-none"/>
			</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { castType, last } from "@alanscodelog/utils"
import { twMerge } from "tailwind-merge"
import { computed, onMounted, onUnmounted, type Ref, ref, shallowRef, toRefs } from "vue"
import { inject } from "vue"

import { type Key, Manager } from "shortcuts-manager/classes/index.js"
import { isToggleKey, isToggleRootKey, isTriggerKey } from "shortcuts-manager/helpers/index.js"

import { createDropChain } from "../common/createDropChain.js"
import { transformShortcutAllowsChainRes } from "../common/transformShortcutAllowsChainRes.js"
import { useKeysLayout } from "../composables/useKeysLayout.js"
import { useManagerChain } from "../composables/useManagerChain.js"
import { usePointerCoords } from "../composables/usePointerCoords.js"
import { useScrollNearContainerEdges } from "../composables/useScrollNearContainerEdges.js"
import { type ShortcutInfo, useShortcutsList } from "../composables/useShortcutsList.js"
import { notificationHandlerSymbol } from "../injectionSymbols.js"


const props = defineProps<{
	keys: Ref<Key<any>>[]
	shortcuts: Ref<Shortcut>[]
	manager: Manager
}>()

const notificationHandler = inject(notificationHandlerSymbol)

const keyClass = "container-key"
const shortcutClass = "shortcut"


const chain = useManagerChain(props.manager)
const displayedKeys = computed(() => props.keys.filter(key => !isToggleKey(key.value) || isToggleRootKey(key.value)))

const keyboardEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)

const { height, keyWidth: keyW } = useKeysLayout(props.manager.keys, keyboardEl)

const openedKey = shallowRef<string | undefined>()
const grabbedKey = shallowRef<Key | undefined>()
const grabbedShortcut = shallowRef<ShortcutInfo | undefined>()
const candidateKey = shallowRef<Key | undefined>()
const isDragging = ref<boolean>(false)
const chainBeforeDrag = shallowRef<Key[][]>([])
const { manager, keys, shortcuts } = toRefs(props)
const shortcutsList = useShortcutsList(manager, keys, shortcuts, chain)

const getKeyEl = (e: PointerEvent): HTMLElement | undefined => (e?.target as HTMLElement).closest(`.${keyClass}`) as HTMLElement | undefined

const getShortcutEl = (e: PointerEvent): HTMLElement | undefined => (e?.target as HTMLElement).closest(`.${shortcutClass}`) as HTMLElement | undefined


const getKeyByElIdProp = (el?: HTMLElement): Key | undefined => {
	if (!el) return
	const id = el.getAttribute("key-id")
	return id ? props.manager.keys.entries[id] : undefined
}

const getShortcutByElIndexProp = (
	el?: HTMLElement,
	keyId?: string,
): ShortcutInfo | undefined => {
	if (!el || !keyId) return
	let i: string | number | null = el.getAttribute("shortcut-index")
	i = typeof i === "string" ? parseInt(i, 10) : i
	return i !== null && i > -1 ? shortcutsList.value[keyId].entries[i] : undefined
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
	for (const { value: key } of props.keys) {
		obj[key.id] = (shortcutsList.value[key.id]?.entries.length) > 0 && openedKey.value === key.id
	}
	return obj
})

const newDragChain = computed(() => createDropChain(
	manager.value,
	chain.value,
	candidateKey.value,
	// grabbedShortcut.value?.isPressableChain ? chainBeforeDrag.value.length : undefined
))
const getOldChainBase = () => {
	if (chainBeforeDrag.value && grabbedKey.value) {
		return [...chainBeforeDrag.value, [grabbedKey.value]]
	}
	return undefined
}

const canDrop = computed(() => {
	if (isDragging.value && newDragChain.value) {
		if (grabbedShortcut.value?.isPressable) {
			const res = grabbedShortcut.value.entry.allows("chain", newDragChain.value)

			return transformShortcutAllowsChainRes(res, grabbedShortcut.value.entry.chain, newDragChain.value, props.manager.stringifier)
		}
		if (grabbedShortcut.value?.isPressableChain && newDragChain.value) {
			const oldChain = getOldChainBase()
			if (!oldChain) return false
			const res = props.manager.shortcuts.canSwapChords(oldChain, newDragChain.value)
			return transformShortcutAllowsChainRes(res, oldChain, newDragChain.value, props.manager.stringifier)
		}
	}
	return false
})


const newChainText = computed(() => {
	if (newDragChain.value && canDrop.value === true) {
		const chainText = props.manager.stringifier.stringify(newDragChain.value)
		if (grabbedShortcut.value?.isPressableChain) {
			return `(New chain base: ${chainText})`
		} else if (grabbedShortcut.value?.isPressable) {
			return `(New shortcut: ${chainText})`
		}
	}
	return ""
})


// const debugShortcutsList = computed(() => process.env.NODE_ENV === "development" && Object.fromEntries(keys(shortcutsList.value).map(key => [key, shortcutsList.value[key].entries.map(_ => ({ ..._, entry: _.entry.toString() }))])))

const getTitle = (entries: ShortcutInfo[] | undefined, i: number): string => {
	if (!entries) return ""
	const name = entries[i]?.entry.command?.name ?? "(None)"
	const isChain = entries[i].isPressableChain
	if (entries.length === 1) return isChain ? "Chain" : name
	if (entries.length > 1) return isChain ? "Conflicting Chain" : `Conflicting Shortcut: ${name}`
	return ""
}

const toggleKeyState = (key: Key): void => {
	// key will be pressed
	if (!key.pressed) {
		// only allow one trigger key to be pressed at a time
		const pressedTriggerKeys = (last(chain.value) ?? []).filter(_ => _.pressed && isTriggerKey(_))
		for (const pressedConflicting of pressedTriggerKeys) {
			props.manager.release(pressedConflicting)
		}
		// prevent the key from getting unpressed until it's released again
		key.checkStateOnAllEvents = false
	} else { // key will be released
		key.checkStateOnAllEvents = true
	}
	props.manager.toggle(key)
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
} = usePointerCoords()

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
	if (e.target instanceof HTMLElement) {
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
		chainBeforeDrag.value = Manager.cloneChain(chain.value)
		props.manager.startRecording({ clearChain: false })
		// while dragging allow the manager to listen to key events on the document to change the chain
		props.manager.attach(document)

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
			if (grabbedShortcut.value.isPressable) {
				const res = grabbedShortcut.value.entry.safeSet("chain", newDragChain.value)
				const transformedRes = transformShortcutAllowsChainRes(res, grabbedShortcut.value.entry.chain, newDragChain.value, props.manager.stringifier) as string | boolean
				if (typeof transformedRes === "string") {message = transformedRes}
			} else if (grabbedShortcut.value.isPressableChain) {
				const oldChain = getOldChainBase()
				if (oldChain) {
					const res = props.manager.shortcuts.swapChords(oldChain, newDragChain.value)
					const transformedRes = transformShortcutAllowsChainRes(res, oldChain, newDragChain.value, props.manager.stringifier)
					if (typeof transformedRes === "string") {message = transformedRes}
				}
			}

			if (message) { void notificationHandler?.notify({ message }) }
		}
		draggingClear()
		closeKey()
		props.manager.stopRecording({ clearChain: false })
		props.manager.safeSet("chain", chainBeforeDrag.value)
		props.manager.detach(document)
		e.preventDefault()
	}
	chainBeforeDrag.value = []
	window.removeEventListener("pointermove", onDragMove)
	window.removeEventListener("pointerup", onDragEnd)
	window.removeEventListener("click", ignoreClick)
}


onMounted(() => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	keyboardEl.value.addEventListener("pointerdown", onDragStart, { passive: false })
})


onUnmounted(() => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	keyboardEl.value!.removeEventListener("pointerdown", onDragStart)
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

