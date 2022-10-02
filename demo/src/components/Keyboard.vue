<template>
	<div :class="classes" :style="`height:${height}px; width:100%;`" ref="keyboard" @mousedown="keyboardMousedown">
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
					@mouseenter="isDragging ? '' : keyHovered=key.value.id"
					@mouseleave="keyHovered=''"
					:key_id="key.value.id"
				>
					<div class="key" :title="key.value.id">
						<div class="label">
							{{ key.value.label }}
							<!-- {{key.value.pressed ? "T":"F"}}
							{{key.value.on?.pressed ? "T":"F"}} -->
						</div>
						<div :class="['shortcuts', shortcutsList[key.value.id].length > 0 && key.value.id === keyHovered ? 'hovered' : '']">
							<div
								class="shortcut"
								v-for="shortcut,i in shortcutsList[key.value.id]"
								:keyID="key.value.id"
								:shortcutIndex="i"
							>
							{{shortcut.value?.command?.name ?? "(None)"}}
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
		<div
			v-if="shortcutDragging"
			class="shortcut shortcut-dragging"
			:style="`left:${coords.x}px; top:${coords.y}px;`"
		>
			{{shortcutDragging?.command?.name ?? "(None)"}}
		</div>
	</div>
</template>

<script setup lang="ts">
import { Key, Keys, Manager, Shortcut } from "@lib/classes";
import { isToggleKey, isToggleRootKey } from "@lib/helpers";
import { castType, last } from "@utils/utils";
import { computed, onMounted, onUnmounted, reactive, Ref, ref } from "vue";


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
	return Object.fromEntries(props.keys.map( key => {
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

const toggleKey = (key:Key) => {
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

const keyHovered = ref<string>()
const shortcutDragging = ref<Shortcut>()
const isDragging = ref<boolean>()
const elCoords = ref<{x:number, y:number}>({x:0, y:0})
const offsetCoords = ref<{x:number, y:number}>({x:0, y:0})

const coords = computed(() => {
	return {x: elCoords.value.x - offsetCoords.value.x, y: elCoords.value.y - offsetCoords.value.y}
})

const keyboardMousedown = (e:MouseEvent):void => {
	const key = (e.target as HTMLElement).closest(".key-container")
	document.addEventListener("mouseup", globalMouseup)
	document.addEventListener("mousemove", globalMousemove)
	isDragging.value = true
	if (e.target instanceof HTMLElement) {
		const el = e.target.closest(".shortcut")
		if (el) {
			const id = el.getAttribute("keyId")
			const i = el.getAttribute("shortcutIndex")
			if (id && i) {
				const shortcut = shortcutsList.value[id][parseInt(i)]
				shortcutDragging.value = shortcut.value
				elCoords.value.x = e.pageX
				elCoords.value.y = e.pageY
				const clientRect = el.getBoundingClientRect()
				offsetCoords.value.x = e.pageX - clientRect.x
				offsetCoords.value.y = e.pageY - clientRect.y
			}
		}
	}
}
const globalMouseup = (e:MouseEvent):void => {
	document.removeEventListener("mouseup", globalMouseup)
	document.removeEventListener("mousemove", globalMousemove)
	isDragging.value = false
	shortcutDragging.value = undefined
}
const globalMousemove = (e:MouseEvent):void => {
	elCoords.value.x = e.pageX
	elCoords.value.y = e.pageY
}
// const globalMousemove = debounce((e:MouseEvent) :void => {

// 	if (key) {
// 		keyHovered.value = key.getAttribute("key_id") as string
// 	} else {
// 		keyHovered.value = ""
// 	}
// }, 100)
</script>

<style scoped lang="scss">
.keyboard {
	--padding: calc(v-bind(keyW) * 0.05px);
	--shadow: calc(var(--padding) - 1px);
	overflow: hidden;
	font-size: calc(v-bind(keyW) * 0.25px);
	// margin: 3px;
	width: 100%;
	// display:flex;
	// justify-content: center;
	position: relative;

	// .keyboard-width {
	// }
	.isDragging & {
		user-select: none;
	}
}
.key-container {
	position: absolute;
	word-break: break-all;
	padding: var(--padding);
}
.key {
	border: 1px solid black;
	border-radius: var(--padding);
	height: 100%;
	white-space: pre;
	box-shadow: 0 var(--shadow) var(--shadow) rgb(0 0 0 / 50%);
	@include flex-col(nowrap);
	.label {
		padding-left: var(--padding);
		z-index:1;
		overflow: hidden;
		width: 100%;
		flex-shrink: 0;
		// padding-left: calc(var(--padding) * 2);
		// padding-top: calc(var(--padding) * 1.5);
	}
	// .center-label & {
	// 	align-items: center;
	// 	justify-content: center;
	// }
	.pressed & {
		background: gray;

		&::before {
			background: gray !important;
		}
	}
	.iso-enter  & {
		box-shadow: none;
		border: none;
		position: relative;

		.label {
			position: absolute;
		}
		display:flex;
		flex-direction: column;
		// filter: drop-shadow(0 var(--shadow) calc(var(--padding)/2) rgb(0 0 0 / 50%));

		&::before {
			position: unset;
			height: calc(1px * v-bind(keyW) - var(--padding) * 2 - 0px);
			border: 1px solid black;
			content: "";
			border-radius: var(--padding) var(--padding) 0 var(--padding);
			margin-left: calc(-1 * var(--padding));
			background: white;
			box-shadow: 0 var(--shadow) var(--shadow) rgb(0 0 0 / 50%);

		}

		&::after {
			content: "";
			flex: 1 1 auto;
			z-index: 1;
			background: white;
			border: 1px solid black;
			width: calc(83.3%);
			align-self: flex-end;
			margin-top: -1px;
			border-top: 0 solid white; //width must be 0 or we get artifact
			border-radius: 0 0 var(--padding) var(--padding);
			box-shadow: 0 var(--shadow) var(--shadow) rgb(0 0 0 / 50%);
		}
	}
}

.shortcuts {
	flex-shrink:1;
	width: 100%;
	// hide overflowing shortcuts
	@include flex-row(wrap);
	overflow:hidden;
	&.hovered {
		// position: absolute;
		background:var(--bg);
		z-index:2;
		// padding: var(--paddingXS);
		// min-height: 100%;
		overflow:unset;
		width: min-content;
		@include border();
		border-radius: var(--padding);
		// margin-left: calc(-1 * var(--paddingXS));
		// margin-top: calc(-1 * var(--paddingXS));
		box-shadow: 0 0 var(--shadowWidth) var(--shadowRegular);
	}
}

.shortcut {
	@include flex(1, 0, calc(100% - var(--paddingXS) * 2));
	border-radius: var(--paddingXS);
	background: var(--cGray2);
	margin: var(--paddingXS);
	padding: 0 var(--paddingXS);
	user-select:none;
	.hovered & {
		cursor: pointer;
	}
}

.shortcut-dragging {
	position:fixed;
	z-index:2;
}

</style>
