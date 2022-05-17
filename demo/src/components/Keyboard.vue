<template>
	<div ref="keyboard" class="keyboard" :style="`height:${height}px; width:100%;`">
		<div class="keyboard-width">
			<template v-for="key of l">
			<div :class="['key-container',...key.classes, key.pressed ? 'pressed' :'']" :style="`
				width:${key.width * keyW }px;
				height:${key.height * keyW}px;
				top:${key.y * keyW}px;
				left:${key.x * keyW}px;
			`">
			<div class="key" :title="key.id">
				<div class="label">
					{{key.label}}
				</div>
			</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { castType } from "@utils/utils"
import { classes } from "shortcuts-visualizer"
import { Manager,Keys, Key, Commands, Shortcuts, Context, Shortcut, Command} from "shortcuts-visualizer/dist/classes"
import { createLayout } from "shortcuts-visualizer/dist/layouts"
import { defineComponent, reactive,ref, onMounted, Ref, computed, onUnmounted, toRef} from "vue"
import { ManagerListener } from "shortcuts-visualizer/dist/types"


export default defineComponent({
	name: "keyboard",
	components: {
	},
	setup() {
		const layout:Key[]  = [...createLayout("iso")].map(raw => {
			// raw.opts.label = "";
			return reactive(Key.create(raw)) as Key
		})

		const m = reactive({
			chain: [] as Key[][],
			rows:0,
			columns:0
		})

		const manager = new Manager(new Keys(layout),
			new Commands([]),
			new Shortcuts([]),
			new Context({}),
			undefined,
			{
				labelStrategy: true,
				labelFilter: (e, key) => {
					if (e?.key.length === 1) {
						key.set("label", e.key.toUpperCase())
						return false
					}
					if (["ScrollLock", "NumLock", "Pause", "PageDown", "PageUp", "PrintScreen", "ContextMenu"].includes(e.key)) {
						return false
					}
					return true
				}
			}
		)
		;(manager as any).addHook("set", (prop: any) => {
			if (prop === "chain") {
				m.chain = manager.chain
			}
		})
		;(manager.keys).addHook("set", (prop:string, val:any) => {
			if (prop === "layout") {
				castType<Keys["layout"]>(val)
				m.rows = val.rows
				m.columns = val.columns
			}
		})
		manager.keys.recalculateLayout()
		const k = manager.keys.entries
		manager.commands.add(new Command("Test"))
		manager.shortcuts.add(new Shortcut([[k.KeyA]], {command: manager.commands.entries.Test}))


		const keyboard = ref<HTMLElement | null>(null)
		const recorder = ref<HTMLInputElement | null>(null)
		const width = ref(0)
		const height = computed(() => width.value / ratio.value)
		const keyW = computed(() => width.value / m.columns)
		const ratio = computed(() => {
			return m.columns / m.rows
		})

		const updateSize = () => {
			castType<Ref<HTMLElement>>(keyboard)
			// const rounded = (Math.round(keyboard.value.offsetWidth / m.columns) * m.columns) - m.columns
			width.value = keyboard.value.offsetWidth
		}
		let observer: ResizeObserver | undefined = undefined
		const eventListener: ManagerListener =  ({event, isKeydown, keys}) => {
		 	if (
				(manager.isRecording && event.target === recorder.value) ||
				(event.target !== recorder.value && !manager.isRecording &&
					(
	 					m.chain.length > 1 ||
	 					(manager.pressedModifierKeys().length > 0 && manager.pressedNonModifierKeys().length > 0)
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
			manager.attach(document)
			manager.eventListener = eventListener
      })
		onUnmounted(()=> {
			observer!.disconnect()
			manager.eventListener = undefined
			manager.detach(document)
		})

		return {keyboard: keyboard, l: layout, width, height, keyW}
	},
})
</script>

<style scoped lang="scss">
.keyboard {
	--padding: calc(v-bind(keyW) * 0.05px);
	--shadow: calc(var(--padding) - 1px);
	overflow: hidden;
	font-size: calc(v-bind(keyW) * 0.25px);
	// margin: 3px;
	width:100%;
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
					content:"";
					border-radius: var(--padding) var(--padding) 0 var(--padding);
					box-shadow: 0 var(--shadow) var(--padding) rgb(0 0 0 / 50%);

				}
				&::after{
					content:"";
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
