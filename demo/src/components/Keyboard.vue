<template>
<!--
This is a container to allow styling.
This should not have any overscroll hidden or it will hide the scrolling indicators which are allowed to go slightly outside the div (hence the margins set) for easier draggin.
All css variables are set here for maximum flexibility.
-->

<div :class="twMerge(`
		m-[var(--scrollMargin)]
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
	isDragging && ` border-red-500 `,
	scrollIndicator.right && `after:border-r-accent-500/60`,
	scrollIndicator.down && `after:border-b-accent-500/60`,
	scrollIndicator.left && `after:border-l-accent-500/60`,
	scrollIndicator.up && `after:border-t-accent-500/60`,
	)"
	:style="`
		--keyW: ${keyW};
		--padding: calc(var(--keyW)*0.05px);
		--shadow: calc(var(--padding) - 1px);
		--fontSize: calc(var(--keyW)*0.25px);
		--scrollMargin: ${scrollMargin}px;
		--outerScrollMargin: ${outerScrollMargin}px;
		--scrollBorder: ${scrollMargin + outerScrollMargin}px;
		--height:${height}px;
	`"
>
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
				@click="toggleKey(key.value)"
				@mouseenter="openKey(key.value.id)"
				@mouseleave="closeKey()"
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
						flex flex-col
						rounded-[var(--padding)]
						relative
						bg-bg
					`,
						key.value.pressed && `
						border-accent-600
						bg-neutral-300
						before:bg-neutral-300
					`,
						key.value.on?.pressed && `border-red-600`,
						key.value.is.modifier &&
							shortcutsList[key.value.id]?.bases !== undefined && `
							before:border-[3px]
							before:inset-[-3px]
							before:absolute
							before:border-neutral-300
							before:rounded
							before:z-[-1]
						`

					)"
					:title="key.value.label"
				>
					<div :class="twMerge(`
						label
						px-1
						z-1
						w-full
						flex
						justify-between
					`)"
					>
						<div class="truncate">
							{{ key.value.label }}
						</div>
						<div

							v-if="!key.value.is.modifier && shortcutsList[key.value.id]?.bases !== undefined"
						>
							<fa class="block" icon="fa link"/>
						</div>
					</div>
					<!-- The padding needs to be on the shortcuts container and not the parent so that on hover we can still have the background with padding. -->
					<div :class="twMerge(`
							shortcuts
							truncate
							shrink-1
							px-1
							ml-[-1px]
							mt-[-1px]
							w-full
							flex
							flex-col
							overflow-hidden
							z-10
						`,
						canOpen[key.value.id] && `
							hovered
							[overflow:unset]
							w-[min-content]
							rounded
							bg-bg
							border
							border-neutral-500
						`,
						/* Small indicator there are more shortcuts */
						!canOpen[key.value.id] &&
							(shortcutsList[key.value.id]?.shortcuts?.length ?? 0) > 1 && `
							after:border-b-2
							after:border-b-neutral-300
							after:content-['...']
							after:translate-y-[-50%]
							after:text-accent-600
						`,
						
					)"
					>
						<div
							:class="twMerge(`
								shortcut
							`,
								!canOpen[key.value.id] && `
								[&:not(:first-of-type)]:hidden
							`,
							)

							"
							v-for="shortcut, i in shortcutsList[key.value.id]?.shortcuts"
							:key="shortcut.toString()"
						>
							{{ shortcut.value?.command?.name ?? "(None)" }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div>
		{{ manager.stringifier.stringify(m.chain) }}
		<div v-for="shortcut in pressableShortcuts" :key="shortcut.value.toString()">
			{{ shortcut.value.toString() }}
		</div>
		---
		<div v-for="shortcut in chainBases" :key="shortcut.value.toString()">
			{{ shortcut.value.toString() }}
		</div>
	</div>
	<lib-debug>{{ shortcutsList }}</lib-debug>
<!-- 	</div> -->
<!-- 	<div -->
<!-- 		v-if="candidateShortcut && isDragging" -->
<!-- 		class="shortcut shortcut-dragging" -->
<!-- 		:style="`left:${coords.x}px; top:${coords.y}px;`" -->
<!-- 	> -->
<!-- 		{{ candidateShortcut?.command?.name ?? "(None)" }} -->
</div>
</template>

<script setup lang="ts">
import { castType, keys, last } from "@alanscodelog/utils"
import { twMerge } from "tailwind-merge"
import { computed, onBeforeUnmount, onMounted, onUnmounted, reactive, type Ref, ref } from "vue"

import { Emulator, type Key, type Keys, type Manager, type Shortcut } from "shortcuts-manager/classes/index.js"
import { chordContainsKey, isToggleKey, isToggleRootKey, removeKeys } from "shortcuts-manager/helpers/index.js"

import { useScrollNearContainerEdges } from "../composables/useScrollNearContainerEdges.js"


const keyClass = "container-key"

const props = defineProps<{
	keys: Ref<Key<any>>[]
	shortcuts: Ref<Shortcut>[]
	manager: Manager
}>()


const displayedKeys = computed(() => props.keys.filter(key => !isToggleKey(key.value) || isToggleRootKey(key.value)))

const keyboardEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)

const m = reactive({
	chain: props.manager.chain,
	rows: props.manager.keys.layout.rows,
	columns: props.manager.keys.layout.columns,
})

props.manager.addHook("set", (prop: any, val: any) => {
	if (prop === "chain") {
		console.log(val)
		m.chain = val
	}
})
props.manager.keys.addHook("set", (prop: string, val: any) => {
	if (prop === "layout") {
		castType<Keys["layout"]>(val)
		m.rows = val.rows
		m.columns = val.columns
	}
})

const width = ref(0)
const keyW = computed(() => {
	const val = width.value / m.columns
	return Number.isNaN(val) ? 1 : val
})
const ratio = computed(() => m.columns / m.rows)
const height = computed(() => width.value / ratio.value)


const openedKey = ref<string>()
const candidateKey = ref<Key>()
const candidateShortcut = ref<Shortcut>()
const isDragging = ref<boolean>()
const canDrag = ref<boolean>()


const pressableShortcuts = computed(() => props.shortcuts.filter(({ value: shortcut }) =>
	shortcut.canExecuteIn(props.manager.context, { allowEmptyCommand: true }) &&
	shortcut.containsSubset(m.chain, { onlySubset: true, onlyPressable: true })),
)

const chainBases = computed(() => props.shortcuts.filter(({ value: shortcut }) => shortcut.canExecuteIn(props.manager.context, { allowEmptyCommand: true }) &&
	shortcut.containsSubset(m.chain, { onlySubset: true, onlyPressable: false }) &&
	!shortcut.containsSubset(m.chain, { onlySubset: true, onlyPressable: true })))


const shortcutsList = computed(() => {
	const obj: Record<string, {
		bases?: Ref<Shortcut>[]
		shortcuts?: Ref<Shortcut>[]
	}> = {}
	for (const { value: key } of props.keys) {
		const index = m.chain.length === 0 ? 0 : m.chain.length - 1
		
		const bases = chainBases.value.filter(({ value: shortcut }: Ref<Shortcut>): boolean =>
			chordContainsKey(shortcut.chain[index], key, { allowVariants: true }) &&
			(key.is.modifier || removeKeys(shortcut.chain[index], m.chain[index] ?? [])[0] === key),
			// (!m.chain[index] || !chordContainsKey(m.chain[index], key, { allowVariants: true }))
		)

		if (bases.length > 0) {
			obj[key.id] ??= {}
			obj[key.id].bases = bases
		}
		const shortcuts = pressableShortcuts.value.filter(({ value: shortcut }: Ref<Shortcut>): boolean =>
			chordContainsKey(shortcut.chain[index], key, { allowVariants: true }) &&
			(!m.chain[index] || !chordContainsKey(m.chain[index], key, { allowVariants: true })))
		if (shortcuts.length > 0) {
			obj[key.id] ??= {}
			obj[key.id].shortcuts = shortcuts
		}
	}
	
	return obj
})

const canOpen = computed(() => {
	const obj: Record<string, boolean> = {}
	for (const { value: key } of props.keys) {
		obj[key.id] = (shortcutsList.value[key.id]?.shortcuts?.length ?? 0) > 0 && openedKey.value === key.id
	}
	return obj
})
const emulator = new Emulator()
// emulator.mouseenter()

const toggleKey = (key: Key): void => {
	if (!key.pressed) {
		key.set("checkStateOnAllEvents", false)
	} else {
		key.set("checkStateOnAllEvents", true)
	}
	props.manager.toggle(key)
}


const pointerCoords = reactive<{ x: number, y: number }>({ x: 0, y: 0 })
const offsetCoords = reactive<{ x: number, y: number }>({ x: 0, y: 0 })
const coords = computed(() => ({ x: pointerCoords.x - offsetCoords.x, y: pointerCoords.y - offsetCoords.y }))

const setCoords = (e: PointerEvent): void => {
	pointerCoords.x = e.clientX
	pointerCoords.y = e.clientY
}

const getKeyByElIdProp = (el: HTMLElement): Key | undefined => {
	const id = el.getAttribute("keyId")

	return id ? props.manager.keys.entries[id] : undefined
}
const getShortcutByElIndexProp = (el: HTMLElement, keyId: string): [shortcut: Shortcut, index: number] | [shortcut: undefined, index: undefined] => {
	let i: string | number | null = el.getAttribute("shortcutIndex")
	i = typeof i === "string" ? parseInt(i) : i
	return [i !== null && i > -1 ? shortcutsList.value[keyId][i].value : undefined, i ?? undefined] as [Shortcut, number] | [undefined, undefined]
}
const setOffset = (e: PointerEvent, el: HTMLElement): void => {
	setCoords(e)
	const clientRect = el.getBoundingClientRect()
	offsetCoords.x = pointerCoords.x - clientRect.x
	offsetCoords.y = pointerCoords.y - clientRect.y
}
const openKey = (id?: string): void => {
	const keyId = id ?? candidateKey.value?.id
	if (!isDragging.value && keyId) {
		canDrag.value = true
		openedKey.value = keyId
	}
}
const closeKey = (): void => {
	openedKey.value = undefined
}
const draggingEnd = (): void => {
	isDragging.value = false
	candidateKey.value = undefined
	candidateShortcut.value = undefined
	closeKey()
}

const onDragStart = (e: PointerEvent): void => {
	if (e.target instanceof HTMLElement) {
		e.target.releasePointerCapture(e.pointerId)
		e.preventDefault()
		const keyEl = e.target.closest(`.${keyClass}`)
		const shortcutEl = e.target.closest(".shortcut")
		if (!(keyEl instanceof HTMLElement)) return
		const key = getKeyByElIdProp(keyEl)
		candidateKey.value = key
		if (!openedKey.value) {
			openKey()
		}

		if (key && shortcutEl instanceof HTMLElement) {
			const [shortcut] = getShortcutByElIndexProp(shortcutEl, key.id)
			candidateShortcut.value = shortcut
			setOffset(e, shortcutEl)
		}

		window.addEventListener("pointermove", onDragMove)
		window.addEventListener("pointerup", onDragEnd)
	}
}
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

const onDragMove = (e: PointerEvent): void => {
	scrollEdges(e.clientX, e.clientY)
	if (isScrolling.value) {
		e.preventDefault()
		return
	}

	// console.log(coords.y, rightLimit)
	if (canDrag.value) {
		setCoords(e)
		isDragging.value = true
		e.preventDefault()
	}
}

const onDragEnd = (_e: PointerEvent): void => {
	endScroll()
	if (!isDragging.value) {
		openKey()
	} else {
		draggingEnd()
	}
	window.removeEventListener("pointermove", onDragMove)
	window.removeEventListener("pointerup", onDragEnd)
}


const updateSize = (): void => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	width.value = Math.max(keyboardEl.value.offsetWidth, 1000)
}
let observer: ResizeObserver | undefined
onMounted(() => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	observer = new ResizeObserver(updateSize)
	// observer = new ResizeObserver(throttle(updateSize, 50))
	observer.observe(keyboardEl.value)
	keyboardEl.value.addEventListener("pointerdown", onDragStart, { passive: false })
})


onUnmounted(() => {
	castType<Ref<HTMLElement>>(keyboardEl.value)
	observer!.disconnect()
	keyboardEl.value!.removeEventListener("pointerdown", onDragStart)
	window.removeEventListener("pointermove", onDragMove)
	window.removeEventListener("pointerup", onDragEnd)
})

</script>

<!-- <style scoped lang="scss"> -->
<!-- .keyboard { -->
<!-- 	--padding: calc(v-bind(keyW) * 0.05px); -->
<!-- 	--shadow: calc(var(--padding) - 1px); -->
<!-- 	overflow: hidden; -->
<!-- 	font-size: calc(v-bind(keyW) * 0.25px); -->
<!-- 	// margin: 3px; -->
<!-- 	width: 100%; -->
<!-- 	// display:flex; -->
<!-- 	// justify-content: center; -->
<!-- 	position: relative; -->
<!---->
<!-- 	// .keyboard-width { -->
<!-- 	// } -->
<!-- 	&.isDragging { -->
<!-- 		border: 1px solid red; -->
<!-- 		user-select: none; -->
<!-- 	} -->
<!---->
<!-- 	overflow:scroll; -->
<!-- 	touch-action:manipulation; -->
<!-- } -->
<!---->
<!-- .key-connertainer { -->
<!-- 	position: absolute; -->
<!-- 	word-break: break-all; -->
<!-- 	padding: var(--padding); -->
<!-- } -->
<!---->
<!-- .key { -->
<!-- 	border: 1px solid black; -->
<!-- 	border-radius: var(--padding); -->
<!-- 	height: 100%; -->
<!-- 	white-space: pre; -->
<!-- 	box-shadow: 0 var(--shadow) var(--shadow) rgb(0 0 0 / 50%); -->
<!-- 	@include flex-col(nowrap); -->
<!---->
<!-- 	.label { -->
<!-- 		padding-left: var(--padding); -->
<!-- 		z-index: 1; -->
<!-- 		overflow: hidden; -->
<!-- 		width: 100%; -->
<!-- 		flex-shrink: 0; -->
<!-- 		// padding-left: calc(var(--padding) * 2); -->
<!-- 		// padding-top: calc(var(--padding) * 1.5); -->
<!-- 	} -->
<!---->
<!-- 	// .center-label & { -->
<!-- 	// 	align-items: center; -->
<!-- 	// 	justify-content: center; -->
<!-- 	// } -->
<!-- 	.pressed & { -->
<!-- 		background: gray; -->
<!---->
<!-- 		&::before { -->
<!-- 			background: gray !important; -->
<!-- 		} -->
<!-- 	} -->
<!---->
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
<!---->
<!-- .shortcuts { -->
<!-- 	flex-shrink: 1; -->
<!-- 	width: 100%; -->
<!-- 	// hide overflowing shortcuts -->
<!-- 	@include flex-row(wrap); -->
<!-- 	overflow: hidden; -->
<!---->
<!-- 	&.hovered { -->
<!---->
<!-- 		// position: absolute; -->
<!-- 		background: var(--bg); -->
<!-- 		z-index: 2; -->
<!-- 		// padding: var(--paddingXS); -->
<!-- 		// min-height: 100%; -->
<!-- 		overflow: unset; -->
<!-- 		width: min-content; -->
<!-- 		@include border(); -->
<!-- 		border-radius: var(--padding); -->
<!-- 		box-shadow: 0 0 var(--shadowWidth) var(--shadowRegular); -->
<!-- 		// margin-left: calc(-1 * var(--paddingXS)); -->
<!-- 		// margin-top: calc(-1 * var(--paddingXS)); -->
<!-- 	} -->
<!-- } -->
<!---->
<!-- .shortcut { -->
<!-- 	@include flex(1, 0, calc(100% - var(--paddingXS) * 2)); -->
<!-- 	border-radius: var(--paddingXS); -->
<!-- 	background: var(--cGray2); -->
<!-- 	margin: var(--paddingXS); -->
<!-- 	padding: 0 var(--paddingXS); -->
<!-- 	user-select: none; -->
<!---->
<!-- 	.hovered & { -->
<!-- 		cursor: pointer; -->
<!-- 	} -->
<!-- } -->
<!---->
<!-- .shortcut-dragging { -->
<!-- 	position: fixed; -->
<!-- 	z-index: 2; -->
<!-- 	@include border(); -->
<!-- 	border-radius: var(--padding); -->
<!-- 	box-shadow: 0 0 var(--shadowWidth) var(--shadowRegular); -->
<!-- 	touch-action: none; -->
<!-- } -->
<!-- </style> -->
