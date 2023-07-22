<template>
<div>
</div>
	<div :class="classes" :style="`height:${height}px; width:100%;`" ref="keyboard" @mousedown="mousedownHandler" @touchstart.disablePassive="mousedownHandler">
		<div class="keyboard-width">
			<template v-for="key of displayedKeys" :key="key">
				<div :class="['key-container', ...key.value.classes, key.value.pressed || key.value.on?.pressed ? 'pressed' : '']"
					:style="`
						width:${key.value.width * keyW}px;
						height:${key.value.height * keyW}px;
						top:${key.value.y * keyW}px;
						left:${key.value.x * keyW}px;
					`"
					@click="toggleKey(key.value)"
					@mouseenter="openKey(key.value.id)"
					@mouseleave="closeKey()"
					:keyId="key.value.id"
				>
					<div class="key" :title="key.value.id">
						<div class="label">
							{{ key.value.label }}
							<!-- {{key.value.pressed ? "T":"F"}}
							{{key.value.on?.pressed ? "T":"F"}} -->
						</div>
						<div :class="['shortcuts', shortcutsList[key.value.id].length > 0 && key.value.id === openedKey ? 'hovered' : '']">
							<div
								class="shortcut"
								v-for="shortcut, i in shortcutsList[key.value.id]"
								:shortcutIndex="i"
							>
							{{ shortcut.value?.command?.name ?? "(None)" }}
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
		<div
			v-if="candidateShortcut && isDragging"
			class="shortcut shortcut-dragging"
			:style="`left:${coords.x}px; top:${coords.y}px;`"
		>
			{{ candidateShortcut?.command?.name ?? "(None)" }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { Key, Keys, Manager, Shortcut } from "shortcuts-manager/classes";
import { isToggleKey, isToggleRootKey } from "shortcuts-manager/helpers";
import { castType, last } from "@alanscodelog/utils";
import { computed, onMounted, onUnmounted, reactive, type Ref, ref } from "vue";


const props = defineProps<{
	keys: Ref<Key<any>>[]
	shortcuts: Ref<Shortcut>[]
	manager: Manager
}>()

const classes = computed(() => {
	return {
		keyboard: true,
		isDragging: isDragging.value,
	}
})
const displayedKeys = computed(() => {
	return props.keys.filter(key => !isToggleKey(key.value) || isToggleRootKey(key.value))
})

const keyboard = ref<HTMLElement | null>(null)

const m = reactive({
	chain: props.manager.chain,
	rows: props.manager.keys.layout.rows,
	columns: props.manager.keys.layout.columns,
})

const width = ref(0)
const keyW = computed(() => {
	const val = width.value / m.columns
	return Number.isNaN(val) ? 1 : val
})
const ratio = computed(() => m.columns / m.rows)
const height = computed(() => width.value / ratio.value)

props.manager.addHook("set", (prop: any, val: any) => {
	if (prop === "chain") {
		m.chain = props.manager.chain
	}
})
props.manager.keys.addHook("set", (prop: string, val: any) => {
	if (prop === "layout") {
		castType<Keys["layout"]>(val)
		m.rows = val.rows
		m.columns = val.columns
	}
})


const shortcutsList = computed(() => {
	return Object.fromEntries(props.keys.map(key => {
		const psuedoChain = [...props.manager.chain]
		const lastChord = [...last(psuedoChain) ?? []].filter(key => !key.is.modifier)
		if (!lastChord.includes(key.value)) lastChord.push(key.value)
		psuedoChain[psuedoChain.length] = lastChord

		const filtered = props.shortcuts.filter(_shortcut => {
			const shortcut = _shortcut.value
			return shortcut.enabled &&
				psuedoChain.length <= shortcut.chain.length &&
				shortcut.equalsKeys(psuedoChain, psuedoChain.length) &&
				shortcut.condition.eval(props.manager.context) &&
				(shortcut.command === undefined || shortcut.command.condition.eval(props.manager.context))
		})

		return [key.value.id, filtered]
	}))
})

const toggleKey = (key: Key) => {
	if (key.is.modifier || key.is.toggle) {
		if (key.is.toggle) {
			key.toggleToggle()
		} else {
			key.set("pressed", !key.pressed)
		}
	}
}
const updateSize = (): void => {
	castType<Ref<HTMLElement>>(keyboard)
	width.value = keyboard.value.offsetWidth
}
let observer: ResizeObserver | undefined
onMounted(() => {
	castType<Ref<HTMLElement>>(keyboard)
	observer = new ResizeObserver(updateSize)
	// observer = new ResizeObserver(throttle(updateSize, 50))
	observer.observe(keyboard.value)
})
onUnmounted(() => {
	observer!.disconnect()
})

const openedKey = ref<string>()
const candidateKey = ref<Key>()
const candidateShortcut = ref<Shortcut>()
const isDragging = ref<boolean>()
const canDrag = ref<boolean>()

const pointerCoords = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const offsetCoords = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const coords = computed(() => {
	return { x: pointerCoords.value.x - offsetCoords.value.x, y: pointerCoords.value.y - offsetCoords.value.y }
})

const setCoords = (e: MouseEvent | TouchEvent): void => {
	const isMouseEvent = e instanceof MouseEvent
	pointerCoords.value.x = (isMouseEvent ? e.pageX : e.touches[0].pageX) - window.scrollX
	pointerCoords.value.y = (isMouseEvent ? e.pageY : e.touches[0].pageY) - window.scrollY
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
const setOffset = (e: MouseEvent | TouchEvent, el: HTMLElement): void => {
	setCoords(e)
	const clientRect = el.getBoundingClientRect()
	offsetCoords.value.x = pointerCoords.value.x - clientRect.x
	offsetCoords.value.y = pointerCoords.value.y - clientRect.y
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

const mousedownHandler = (e: MouseEvent | TouchEvent): void => {
	if (e.target instanceof HTMLElement) {
		e.preventDefault()
		const keyEl = e.target.closest(".key-container")
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
		if (isDragging.value) return

		document.addEventListener("mouseup", mouseupHandler)
		document.addEventListener("touchend", mouseupHandler)
		document.addEventListener("mousemove", mousemoveHandler, { passive: false })
		document.addEventListener("touchmove", mousemoveHandler, { passive: false })
	}
}
const mousemoveHandler = (e: MouseEvent | TouchEvent): void => {
	if (canDrag.value) {
		isDragging.value = true
		setCoords(e)
		e.preventDefault()
	}
}
const mouseupHandler = (e: MouseEvent | TouchEvent): void => {
	if (!isDragging.value) {
		openKey()
	} else {
		draggingEnd()
	}
	document.removeEventListener("mouseup", mouseupHandler)
	document.removeEventListener("touchend", mouseupHandler)
	document.removeEventListener("mousemove", mousemoveHandler)
	document.removeEventListener("touchmove", mousemoveHandler)
}
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
<!-- .key-container { -->
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
