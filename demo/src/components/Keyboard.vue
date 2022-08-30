<template>
	<div class="keyboard" :style="`height:${height}px; width:100%;`" ref="keyboard">
		<div class="keyboard-width">
			<template v-for="key of layout" :key="key">
				<div :class="['key-container', ...key.classes, key.pressed ? 'pressed' : '']"
					:style="`
					width:${key.width * keyW}px;
					height:${key.height * keyW}px;
					top:${key.y * keyW}px;
					left:${key.x * keyW}px;
				`"
				>
					<div class="key" :title="key.id">
						<div class="label">
							{{ key.label }}
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Key, Keys, Manager } from "@lib/classes"
import { ManagerListener } from "@lib/types"
import { castType } from "@utils/utils"
import { computed, onMounted, onUnmounted, reactive, Ref, ref } from "vue"


const props = defineProps<{
	layout: Key<any>[]
	manager: Manager
}>()

const keyboard = ref<HTMLElement | null>(null)
const recorder = ref<HTMLInputElement | null>(null)

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
		// console.log(val);
	}
})
props.manager.keys.addHook("set", (prop: string, val: any) => {
	if (prop === "layout") {
		castType<Keys["layout"]>(val)
		m.rows = val.rows
		m.columns = val.columns
		// console.log(val);
	}
})

const updateSize = (): void => {
	castType<Ref<HTMLElement>>(keyboard)
	// const rounded = (Math.round(keyboard.value.offsetWidth / m.columns) * m.columns) - m.columns
	width.value = keyboard.value.offsetWidth
}
let observer: ResizeObserver | undefined
const eventListener: ManagerListener = ({ event/* , isKeydown, keys */ }) => {
	if (
		(props.manager.isRecording && event.target === recorder.value) ||
		(event.target !== recorder.value && !props.manager.isRecording &&
			(
				m.chain.length > 1 ||
				(props.manager.pressedModifierKeys().length > 0 && props.manager.pressedNonModifierKeys().length > 0)
			)
		)
	) {
		event.preventDefault()
	}
}
onMounted(() => {
	castType<Ref<HTMLElement>>(keyboard)
	observer = new ResizeObserver(updateSize)
	// observer = new ResizeObserver(throttle(updateSize, 50))
	observer.observe(keyboard.value)
	props.manager.attach(document)
	props.manager.eventListener = eventListener
})
onUnmounted(() => {
	observer!.disconnect()
	props.manager.eventListener = undefined
	props.manager.detach(document)
})

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
	.key-container {
		position: absolute;
		word-break: break-all;
		padding: var(--padding);
		overflow: hidden;

		&.center-label {
			.key {
				align-items: center;
				justify-content: center;
			}
		}

		&.pressed .key {
			background: gray;

			&::before {
				background: gray !important;
			}
		}

		.key {
			display: flex;
			border: 1px solid black;
			box-shadow: 0 var(--shadow) var(--padding) rgb(0 0 0 / 50%);
			border-radius: var(--padding);
			height: 100%;
			white-space: pre;

			.label {
				overflow: hidden;
				padding-left: calc(var(--padding) * 2);
				padding-top: calc(var(--padding) * 1.5);
			}
		}

		&.iso-enter {
			.key {
				box-shadow: none;
				border: none;
				position: relative;

				.label {
					position: absolute;
				}

				display:flex;
				flex-direction: column;

				&::before {
					height: calc(1px * v-bind(keyW) - var(--padding) * 2 - 2px);
					border: 1px solid black;
					content: "";
					border-radius: var(--padding) var(--padding) 0 var(--padding);
					box-shadow: 0 var(--shadow) var(--padding) rgb(0 0 0 / 50%);

				}

				&::after {
					content: "";
					flex: 1 1 auto;
					z-index: 1;
					background: white;
					border: 1px solid black;
					width: calc(83.3% - var(--padding));
					align-self: flex-end;
					margin-top: -1px;
					border-top: 0 solid white; //width must be 0 or we get artifact
					border-radius: 0 0 var(--padding) var(--padding);
					box-shadow: 0 var(--shadow) var(--padding) rgb(0 0 0 / 50%);
				}
			}
		}
	}
}
</style>
