<template>
	<div id="list-component">
		<lib-table>
			<!-- {{newShortcutIsValid}} -->
			<tr>
				<td>
					<lib-input :border="false"
						:model-value="newShortcut?.command?.name ?? ''"
						@update:modelValue="updateNewShortcutCommand($event)"
						:suggestions="existingCommands"
						:restrict-to-suggestions="true"
					>
						<template #item="{item}">
							{{ item }}
						</template>
					</lib-input>
				</td>
				<td>
					<lib-input
						:border="false"
						:recording="recordingIndex === -1 ? true : false"
						:recorder="recordingIndex === -1 ? recorder : {}"
						:recordingValue="recordingIndex === -1 ? recordingValue : ''"
						:model-value="newShortcut ? props.manager.stringifier.stringify(newShortcut.chain) : ''"
						@recorder:click="recorderClick($event, -1)"
						@recorder:blur="recorderBlur($event, -1)"
					/>
				</td>
				<td>
					<lib-button
					:disabled="newShortcutIsValid !== true"
					:title="newShortcutIsValid === true ? '' : newShortcutIsValid"
					:label="'Add Shortcut'"
					@click="addShortcut()"/>
				</td>
			</tr>
			<thead>
				<th>
					<div>Command</div>
				</th>
				<th>
					<div>Shortcut</div>
				</th>
			</thead>
			<tr v-for="(shortcut, i) of shortcuts" :key="i">
				<td>
					<lib-input :border="false"
						:model-value="shortcut.command?.name"
						@update:model-value="change('name', shortcut, $event)"
					/>
				</td>
				<td>
					<lib-input
						:border="false"
						:recording="recordingIndex === i ? true : false"
						:recorder="recordingIndex === i ? recorder : {}"
						:recordingValue="recordingIndex === i ? recordingValue : ''"
						:model-value="shortcut.stringifier.stringify(shortcut.chain)"
						@recorder:click="recorderClick($event, i)"
						@recorder:blur="recorderBlur($event, i)"
					/>
				</td>
			</tr>
		</lib-table>
	</div>
</template>

<script setup lang="ts">
import { unreachable } from "@alanscodelog/utils";
import { Key, Manager, Shortcut } from "@lib/classes";
import { ref, shallowRef, triggerRef } from "vue";

console.log(Manager.dedupeChain);

const props = defineProps<{
	manager: Manager
	existingCommands: string[]
}>()

// const newShortcutCommand = ref("")
const shortcuts = shallowRef([...props.manager.shortcuts.entries])
const recordingValue = ref("")
const recordingIndex = ref(-2)
const newShortcut = ref<Shortcut|null>(null)
const newShortcutIsValid = ref<true | string>("Cannot add shortcut, no shortcut chain or command is set.")

props.manager.shortcuts.addHook("add", (self, _, entry) => {
	shortcuts.value.push(entry)
})
props.manager.shortcuts.addHook("remove", (self, _, entry) => {
	shortcuts.value.splice(shortcuts.value.indexOf(entry), 1)
})

const change = (prop: string, shortcut: Partial<Shortcut>, name: string): void => {
	shortcut.command?.set("name", name)
	triggerRef(shortcuts)
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


const cancelRecordingHook:Parameters<Key["addHook"]>[1] = (prop, val) => {
	if (prop === "pressed" && val === true) {
		cancelRecording()
	}
}
const saveRecordingHook:Parameters<Key["addHook"]>[1] = (prop, val) => {
	if (prop === "pressed" && val === true) {
		saveRecording(recordingIndex.value)
	}
}

const updateRecordingValueHook:Parameters<Manager["addHook"]>[1] = (key, val)=> {
	if (key === "chain") {
		console.log(recordingValue.value);

		recordingValue.value = props.manager.stringifier.stringify(val as any)
	}
}

const startRecording = (index:number) => {
	recordingIndex.value = index
	props.manager.startRecording()
	props.manager.addHook("set",updateRecordingValueHook)
	props.manager.keys.entries.Escape.addHook("set", cancelRecordingHook)
	props.manager.keys.entries.Enter.addHook("set", saveRecordingHook)
}
const saveRecording = (index:number) => {
	if (recordingIndex.value >  -2) {
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
			const shortcut =props.manager.shortcuts.entries[index]
			const allowed = shortcut.allows("chain", chain)
			if (allowed.isOk) {
				shortcut.set("chain", chain)
			} else {
				console.log("Now Allowed", allowed.error);
			}
		}
		props.manager.stopRecording()
		props.manager.keys.entries.Escape.removeHook("set", cancelRecordingHook)
		props.manager.keys.entries.Enter.removeHook("set", saveRecordingHook)
		props.manager.removeHook("set",updateRecordingValueHook)
		recordingValue.value = ""
		recordingIndex.value = -2
	}
}

const addShortcut = () => {
	props.manager.shortcuts.add(newShortcut.value! as Shortcut)
	newShortcut.value = null
	newShortcutIsValid.value = "Cannot add shortcut, no shortcut chain or command is set."
}
const cancelRecording = () => {
	if (recordingIndex.value > -2) {
		props.manager.stopRecording()
		props.manager.keys.entries.Escape.removeHook("set", cancelRecordingHook)
		props.manager.keys.entries.Enter.removeHook("set", saveRecordingHook)
		props.manager.removeHook("set",updateRecordingValueHook)
		recordingValue.value = ""
		recordingIndex.value = -2
	}
}

const recorderClick = ({event, indicator, input}:{event: MouseEvent, indicator: HTMLElement, input: HTMLElement}, index: number) => {
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
const recorderBlur = (event:FocusEvent, index: number) => {
	cancelRecording()
}


</script>

<style lang="scss" scoped>
</style>

//#list-componen {
//	--varName: v-bind(value);
//}
