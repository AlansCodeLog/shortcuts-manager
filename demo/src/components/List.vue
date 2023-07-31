<template>
<div id="list-component">
	<lib-table>
		<tr>
			<td class="col-command">
				<lib-input :border="false"
					:model-value="newShortcut?.command?.name ?? ''"
					:suggestions="existingCommandsList"
					:restrict-to-suggestions="true"
					@update:model-value="updateNewShortcutCommand($event)"
				>
					<template #item="{ item }">
						{{ item }}
					</template>
				</lib-input>
			</td>
			<td class="col-shortcut">
				<lib-input
					:border="false"
					:recording="recordingIndex === -1 ? true : false"
					:recorder="recordingIndex === -1 ? recorder : {}"
					:recording-value="recordingIndex === -1 ? recordingValue : ''"
					:model-value="newShortcut ? props.manager.stringifier.stringify(newShortcut.chain) : ''"
					@recorder:click="recorderClick($event, -1)"
					@recorder:blur="recorderBlur($event, -1)"
				/>
			</td>
			<td class="col-add-remove no-resize">
				<lib-button
					:disabled="newShortcutIsValid !== true"
					:title="newShortcutIsValid === true ? 'Add Shortcut' : newShortcutIsValid"
					@click="addShortcut()"
				>
					<fa icon="plus"/>
				</lib-button>
			</td>
		</tr>
		<!-- <thead> -->
		<tr>
			<th>
				<div>Command</div>
			</th>
			<th>
				<div>Shortcut</div>
			</th>
			<th>
				<div/>
			</th>
		</tr>
		<!-- </thead> -->
		<tr v-for="(shortcut, i) of shortcuts" :key="i">
			<td>
				<lib-input :border="false"
					:model-value="shortcut.value.command?.name ?? ''"
					@update:model-value="change('name', shortcut.value, $event)"
				/>
			</td>
			<td>
				<lib-input
					:border="false"
					:recording="recordingIndex === i ? true : false"
					:recorder="recordingIndex === i ? recorder : {}"
					:recording-value="recordingIndex === i ? recordingValue : ''"
					:model-value="shortcut.value.stringifier.stringify(shortcut.value.chain)"
					@recorder:click="recorderClick($event, i)"
					@recorder:blur="recorderBlur($event, i)"
				/>
			</td>
			<td>
				<lib-button
					title="Remove Shortcut"
					@click="removeShortcut(i)"
				>
					<fa icon="trash"/>
				</lib-button>
			</td>
		</tr>
	</lib-table>
</div>
</template>

<script setup lang="ts">
import { unreachable } from "@alanscodelog/utils"
import { type Command, type Key, type Manager, Shortcut } from "shortcuts-manager/classes"
import { KnownError } from "shortcuts-manager/helpers"
import { computed, inject, type Ref, ref } from "vue"

import { notificationHandlerSymbol } from "../injectionSymbols.js"


const notificationHandler = inject(notificationHandlerSymbol)
if (notificationHandler === undefined) unreachable()

const props = defineProps<{
	manager: Manager
	shortcuts: Ref<Shortcut>[]
	commands: Ref<Command>[]
}>()

const existingCommandsList = computed(() => props.commands.map(command => command.value.name))
// const newShortcutCommand = ref("")
const recordingValue = ref("")
const recordingIndex = ref(-2)
const newShortcut = ref<Shortcut | null>(null)
const newShortcutIsValid = ref<true | string>("Cannot add shortcut, no shortcut chain or command is set.")

const change = (_prop: string, shortcut: Partial<Shortcut>, name: string): void => {
	shortcut.command?.set("name", name)
}

const updateNewShortcutCommand = (val: string) => {
	newShortcut.value = newShortcut.value ?? new Shortcut([[]])
	newShortcut.value.set("command", props.manager.commands.get(val))

	if (newShortcut.value.chain.length > 0 && newShortcut.value.command) {
		const allowed = props.manager.shortcuts.allows("add", newShortcut.value as any)
		newShortcutIsValid.value = allowed.isOk ? true : allowed.error.message
	} else {
		newShortcutIsValid.value = newShortcut.value.chain.length === 0 ? "Cannot add shortcut, shortcut chain is not set." : "Cannot add shortcut, shortcut command is not set."
	}
}
// props.manager.startRecording

const recorder = {
	// 	keydown
}


const cancelRecordingHook: Parameters<Key["addHook"]>[1] = (prop, val) => {
	if (prop === "pressed" && val === true) {
		cancelRecording()
	}
}
const saveRecordingHook: Parameters<Key["addHook"]>[1] = (prop, val) => {
	if (prop === "pressed" && val === true) {
		saveRecording(recordingIndex.value)
	}
}

const updateRecordingValueHook: Parameters<Manager["addHook"]>[1] = (key, val) => {
	if (key === "chain") {
		console.log(recordingValue.value)

		recordingValue.value = props.manager.stringifier.stringify(val as any)
	}
}

const startRecording = (index: number) => {
	recordingIndex.value = index
	props.manager.startRecording()
	props.manager.addHook("set", updateRecordingValueHook)
	props.manager.keys.entries.Escape.addHook("set", cancelRecordingHook)
	props.manager.keys.entries.Enter.addHook("set", saveRecordingHook)
}
const saveRecording = (index: number) => {
	if (recordingIndex.value > -2) {
		const chain = props.manager.chain
		if (index === -2) unreachable()
		if (index === -1) {
			newShortcut.value = newShortcut.value ?? new Shortcut([[]])
			newShortcut.value.set("chain", chain)

			// props.manager.shortcuts.add(newShortcut.value as any)
			if (newShortcut.value.chain.length > 0 && newShortcut.value.command) {
				const allowed = props.manager.shortcuts.allows("add", newShortcut.value as any)
				newShortcutIsValid.value = allowed.isOk ? true : allowed.error.message
			} else {
				newShortcutIsValid.value = newShortcut.value.chain.length === 0 ? "Cannot add shortcut, shortcut chain is not set." : "Cannot add shortcut, shortcut command is not set."
			}
		} else {
			const shortcut = props.manager.shortcuts.entries[index]
			const allowed = shortcut.allows("chain", chain)
			if (allowed.isOk) {
				shortcut.set("chain", chain)
			} else {
				console.log("Now Allowed", allowed.error)
			}
		}
		props.manager.stopRecording()
		props.manager.keys.entries.Escape.removeHook("set", cancelRecordingHook)
		props.manager.keys.entries.Enter.removeHook("set", saveRecordingHook)
		props.manager.removeHook("set", updateRecordingValueHook)
		recordingValue.value = ""
		recordingIndex.value = -2
	}
}

const addShortcut = () => {
	props.manager.shortcuts.add(newShortcut.value! as Shortcut)
	newShortcut.value = null
	newShortcutIsValid.value = "Cannot add shortcut, no shortcut chain or command is set."
}
const removeShortcut = (i: number) => {
	const shortcut = props.manager.shortcuts.entries[i]
	const canRemove = props.manager.shortcuts.allows("remove", shortcut)
	if (canRemove.isOk) {
		props.manager.shortcuts.remove(shortcut)
	} else {
		const code = canRemove.error instanceof KnownError ? canRemove.error.code : "Unknown"
		notificationHandler.notify({ message: canRemove.error.message, code, requiresAction: true, icon: "triangle-exclamation" })
	}
}
const cancelRecording = () => {
	if (recordingIndex.value > -2) {
		props.manager.stopRecording()
		props.manager.keys.entries.Escape.removeHook("set", cancelRecordingHook)
		props.manager.keys.entries.Enter.removeHook("set", saveRecordingHook)
		props.manager.removeHook("set", updateRecordingValueHook)
		recordingValue.value = ""
		recordingIndex.value = -2
	}
}

const recorderClick = ({ event, indicator, input }: { event: MouseEvent, indicator: HTMLElement, input: HTMLElement }, index: number) => {
	if (index === recordingIndex.value) {
		if (event.target === indicator) {
			recordingIndex.value = -2
		}
	} else {
		if (recordingIndex.value === -2) recordingIndex.value = index
		else recordingIndex.value = -2
	}

	if (recordingIndex.value > -2) {
		startRecording(index)
	} else {
		saveRecording(index)
	}
}
const recorderBlur = (_event: FocusEvent, _index: number) => {
	cancelRecording()
}


</script>
<!---->
<!-- <style lang="scss" scoped> -->
<!-- table { -->
<!-- 	// display:flex; -->
<!-- 	// flex-wrap:wrap; -->
<!-- 	width: 100%; -->
<!-- } -->
<!---->
<!-- table:not(.resizable-table-setup) { -->
<!-- 	tr { -->
<!-- 		display: flex; -->
<!-- 		flex-wrap: nowrap; -->
<!-- 		// width: 100%; -->
<!-- 	} -->
<!---->
<!-- 	.col-command { -->
<!-- 		flex-grow: 1; -->
<!-- 	} -->
<!---->
<!-- 	.col-shortcut { -->
<!-- 		flex-grow: 1; -->
<!-- 	} -->
<!---->
<!-- 	.col-add-remove { -->
<!-- 		// min-width: min-content; -->
<!-- 		flex-grow: 0; -->
<!-- 		flex-shrink: 0; -->
<!-- 	} -->
<!-- } -->
<!---->
<!-- // table { -->
<!-- // 	width: calc(100% - var(--borderWidth) * 2); -->
<!-- // 	// @include border; -->
<!-- // 	border-color: var(--opacity0); -->
<!-- // 	:slotted(thead, tbody, tr, td, th) { -->
<!-- // 		// needed for resizing -->
<!-- // 		box-sizing: border-box; -->
<!-- // 	} -->
<!-- // 	:slotted(td, th) { -->
<!-- // 		// needed for resizing -->
<!-- // 		overflow:hidden -->
<!-- // 	} -->
<!-- // } -->
<!-- </style> -->
<!---->
<!-- //#list-componen { -->
<!-- //	--varName: v-bind(value); -->
<!-- //} -->
