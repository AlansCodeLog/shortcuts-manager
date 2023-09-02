<template>
<div>
	<!-- [&>div:first-of-type]:rounded-tl -->
	<!-- [&>div:nth-of-type(4)]:rounded-tr -->

	<div :class="`
		rounded-tl
		rounded-tr
		border-x
		border-t
		border-neutral-600
		px-2
		py-1
		flex
		flex-wrap
		justify-end
		gap-2
	`"
	>
		<div>Filters:</div>
		<div class="flex-1"/>
		<div v-for="action in ObjectKeys(filters)" :key="action">
			<LibCheckbox class="whitespace-nowrap"
				:label="filterNames[action]"
				:model-value="filters[action]"
				@update:model-value="filters[action]=$event"
			/>
		</div>
	</div>
	<div :class="`
			grid
			grid-cols-[min-content,repeat(2,minmax(0,1fr)),min-content]
			items-stretch

			[&>div:nth-last-of-type(1)]:rounded-br
			[&>div:nth-last-of-type(4)]:rounded-bl
			[&>div]:border-neutral-400
			[&>div:nth-of-type(-n+4)]:bg-neutral-200
			[&>div:nth-of-type(-n+4)]:border-t-neutral-600
			[&>div:nth-last-of-type(-n+4)]:border-b-neutral-600
			[&>div:nth-of-type(-n+4)]:border-t
			[&>div]:border-b
			[&>div:nth-of-type(4n+1)]:border-l
			[&>div:nth-of-type(4n+1)]:border-l-neutral-600
			[&>div:nth-of-type(4n+4)]:border-r-neutral-600
			[&>div]:border-r
			relative
		`"
		v-resizable-cols="{selector:'div',enable:true}"
	>
		<!-- headers -->
		<div class="" title="Enabled" aria-label="Enabled"/>
		<div class="px-2">Shortcut</div>
		<div class="px-2">Command</div>
		<div class="" title="Add/Remove" aria-label="Add/Remove"/>

		<!-- add new -->
		<div class="flex items-center px-2">
			<LibCheckbox
				:model-value="newShortcut.enabled"
				@update:model-value="updateShortcutEnabled(-1, $event)"
			/>
		</div>
		<div class="">
			<LibRecorder
				:border="false"
				:binders="binders"
				:recording-value="isRecordingKey === -1 ? recordingValue : undefined"
				:recording="isRecording && isRecordingKey === -1"
				:model-value="stringify(newShortcut.chain as Key[][])"
				@update:recording="toggleRecording(-1, $event)"
				@recorder:click="toggleRecording(-1, !isRecording)"
				@recorder:blur="toggleRecording(-1 , false, {reset:true})"
			/>
		</div>
		<div class="">
			<LibInput
				:placeholder="'(None)'"
				:border="false"
				:model-value="newShortcut.command?.name ?? ''"
				:suggestions="commandsSuggestions"
				@submit="updateShortcutCommand(-1, $event as any as string)"
			/>
		</div>
		<div class="items-center px-1">
			<LibButton :border="false"
				icon="solid plus"
				aria-label="Add Shortcut"
				auto-title-from-aria
				@click="addShortcut"
			/>
		</div>
		<!-- existing -->
		<template v-for="item,i of filteredShortcuts" :key="shortcutToId(item)">
			<div class="flex items-center px-2">
				<LibCheckbox
					:model-value="item.enabled"
					@update:model-value="updateShortcutEnabled(i, $event)"
				/>
			</div>
			<div class="">
				<LibRecorder
					:border="false"
					:binders="binders"
					:recording-value="isRecordingKey === i ? recordingValue : undefined"
					:recording="isRecording && isRecordingKey === i"
					:model-value="stringify(item.chain)"
					@update:recording="toggleRecording(i, $event )"
					@recorder:click="toggleRecording(i, !isRecording)"
					@recorder:blur="toggleRecording(i, false, {reset:true})"
				/>
			</div>
			<div class="">
				<LibInput
					:placeholder="'(None)'"
					:border="false"
					:model-value="item.command?.name ?? ''"
					:suggestions="commandsSuggestions"
					@submit="updateShortcutCommand(i,$event as any as string)"
				/>
			</div>
			<div class="items-center px-1">
				<LibButton :border="false"
					icon="solid trash"
					aria-label="Delete Shortcut"
					auto-title-from-aria
					@click="notifyIfError(manager.shortcuts.safeRemove(item))"
				/>
			</div>
		</template>
	</div>
</div>
</template>
<script setup lang="ts">
import { keys as ObjectKeys } from "@alanscodelog/utils"
import { resizableCols as vResizableCols } from "@alanscodelog/vue-components/directives/index.js"
import { computed, reactive, type Ref, ref, toRaw } from "vue"

import { Command, type Key, Manager, Shortcut } from "shortcuts-manager/classes/index.js"

import { notifyIfError } from "../common/notifyIfError.js"
import { useManagerChain } from "../composables/useManagerChain.js"


const props = defineProps<{
	manager: Manager
	shortcuts: Ref<Shortcut>[]
	commands: Ref<Command>[]
}>()
type Filters <T> = {
	onlyExecutable: T
	showPressable: T
	showPressableModOrChords: T
	showUnpressable: T
}
const filterNames: Filters<string> = {
	onlyExecutable: "Executable",
	showPressable: "Pressable",
	showPressableModOrChords: "Pressable Mods/Chords",
	showUnpressable: "Unpressable",
}

const filters = reactive<Filters<boolean>>({
	onlyExecutable: true,
	showPressable: true,
	showPressableModOrChords: true,
	showUnpressable: false,
})

const chain = useManagerChain(props.manager)
const filteredShortcuts = computed(() => {
	const list = []
	for (const { value: shortcut } of props.shortcuts) {
		const executable = shortcut.canExecuteIn(props.manager.context, { allowEmptyCommand: true })
		const pressable = shortcut.containsSubset(chain.value, { onlySubset: true, onlyPressable: true })
		const pressableModOrChord = shortcut.containsSubset(chain.value, { onlySubset: true, onlyPressable: false }) && !pressable
		if (
			(!filters.onlyExecutable || executable) && (
				(filters.showUnpressable && !pressable && !pressableModOrChord) ||
				(filters.showPressable && pressable) ||
				(filters.showPressableModOrChords && pressableModOrChord)
			)
		) {
			list.push(shortcut)
		}
	}
	return list
})
const stringify = props.manager.stringifier.stringify.bind(props.manager.stringifier)
const binders = {
	bind: () => props.manager.attach(document),
	unbind: () => props.manager.detach(document),
}
const isRecording = ref(false)
const recordingValue = computed(() => isRecording.value ? stringify(chain.value) : undefined)
const isRecordingKey = ref<number | undefined>(undefined)
const newShortcut = ref(new Shortcut([]))


function escapeRecordingHook(prop, val): void {
	if (prop === "pressed" && val === true) {
		toggleRecording(isRecordingKey.value!, false, { reset: true })
		props.manager.keys.entries.Escape.removeHook("set", escapeRecordingHook)
		// it stays pressed because we remove the event listener before it can register the keyup
		props.manager.keys.entries.Escape.set("pressed", false)
	}
}
function saveRecordingHook(prop, val): void {
	if (prop === "pressed" && val === true) {
		props.manager.keys.entries.Enter.removeHook("set", saveRecordingHook)
		toggleRecording(isRecordingKey.value!, false)
	}
}


function toggleRecording(i: number, val: boolean, { reset = false }: { reset?: boolean } = {}): void {
	if (val) {
		if (isRecording.value) return
		props.manager.startRecording()
		props.manager.keys.entries.Escape.addHook("set", escapeRecordingHook)
		props.manager.keys.entries.Enter.addHook("set", saveRecordingHook)
		isRecording.value = true
		isRecordingKey.value = i
	} else {
		if (i !== isRecordingKey.value) return
		if (!reset) {
			updateShortcutChain(i, Manager.cloneChain(props.manager.chain))
		}
		props.manager.stopRecording()
		props.manager.clearChain()
		isRecording.value = false
		isRecordingKey.value = undefined
	}
}


function addShortcut(): void {
	const res = props.manager.shortcuts.safeAdd(toRaw(newShortcut.value) as Shortcut)
	notifyIfError(res)
	if (res.isOk) {
		newShortcut.value = new Shortcut([])
	}
}
function updateShortcutChain(i: number, value: Key[][]): void {
	if (i === -1) {
		notifyIfError(newShortcut.value.safeSet("chain", value))
	} else {
		const shortcut = filteredShortcuts.value[i]
		notifyIfError(shortcut.safeSet("chain", value))
	}
}

function updateShortcutEnabled(i: number, val: boolean): void {
	const shortcut: Shortcut = i === -1 ? newShortcut.value : filteredShortcuts.value[i]
	if (val) {
		notifyIfError(shortcut.safeSet("enabled", val))
	} else {
		// todo setting to false should be possible with safeSet even if there are conflicting shortcuts
		shortcut.set("enabled", val)
	}
}
function updateShortcutCommand(i: number, value: string): void {
	const existing = props.manager.commands.query(_ => _.name === value, false)
	if (i === -1) {
		notifyIfError(newShortcut.value.safeSet("command", existing ?? new Command(value)))
	} else {
		const shortcut = filteredShortcuts.value[i]
		let command = existing
		if (!existing) {
			command = new Command(value)
			const res = props.manager.commands.safeAdd(command)
			notifyIfError(res)
			if (res.isError) return
		}
		notifyIfError(shortcut.value.safeSet("command", command))
	}
}
const commandsSuggestions = computed(() => props.commands.map(_ => _.value.name))

</script>
