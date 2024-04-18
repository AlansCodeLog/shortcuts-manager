<template>
<div>
	<div :class="`
		rounded
		border
		border-neutral-600
		grid
		grid-cols-[repeat(1,minmax(0,1fr)),min-content]
		items-center

		[&>div]:border-neutral-400

		[&>div:nth-of-type(2n+1)]:border-r
		[&>div:nth-last-of-type(n+3)]:border-b
	`"
	>
		<!-- new command -->
		<LibInput
			:border="false"
			:model-value="newCommand.name"
			@update:model-value="notifyIfError(setCommandProp(newCommand, 'name', $event, manager))"
			@submit="addCommand(newCommand)"
		/>
		<div class="items-center px-1">
			<LibButton :border="false"
				icon="solid plus"
				aria-label="Add Command"
				auto-title-from-aria
				@click="addCommand(newCommand)"
			/>
		</div>

		<!-- existing -->
		<template v-for="command of commands" :key="command.name">
			<div class="grid grid-cols-[minmax(0,1fr),min-content]">
				<LibInput
					:border="false"
					:model-value="temporaryCommand.command === command ? temporaryCommand.name : command.name"
					
					@focus="setTemporary(command)"
					@blur="handleBlur(command)"
					@update:model-value="updateCommandName(command, $event)"
					@submit="notifyIfError(setCommandProp(command, 'name', $event, manager))"
				/>
				<LibButton v-if="temporaryCommand.command === command && temporaryCommand.name !== command.name"
					:border="false"
					icon="solid save"
					aria-label="Save Command"
					auto-title-from-aria
					@mousedown="saveOnBlur = true"
					@mouseup="saveOnBlur = false"
				
					@click="saveCommandName(command)"
				/>
			</div>
			<div class="items-center px-1">
				<LibButton :border="false"
					icon="solid trash"
					aria-label="Delete Command"
					auto-title-from-aria
					@click="notifyIfError(managerRemoveCommand(command, manager))"
				/>
			</div>
		</template>
	</div>
</div>
</template>
<script setup lang="ts">
import { addCommand as managerAddCommand, createCommand, removeCommand as managerRemoveCommand, setCommandProp } from "shortcuts-manager"
import type { Command, Manager } from "shortcuts-manager/types"
import { computed, ref } from "vue"

import { notifyIfError } from "../common/notifyIfError.js"


const props = defineProps<{
	manager: Manager
}>()
const commands = computed(() => Object.values(props.manager.commands.entries))

const saveOnBlur = ref(false)
const newCommand = ref(createCommand(""))
const temporaryCommand = ref<{
	command: Command | undefined
	name: string
}>({
	command: undefined,
	name: "",
})

function addCommand(command: Command): void {
	const res = notifyIfError(managerAddCommand(command, props.manager))
	if (res.isOk) {
		newCommand.value = createCommand("")
	}
}
function clearTemporary() {
	temporaryCommand.value = {
		command: undefined,
		name: "",
	}
}
function setTemporary(command: Command) {
	temporaryCommand.value = {
		command,
		name: command.name,
	}
}
function updateCommandName(command: Command, val: string) {
	if (temporaryCommand.value.command === command) {
		temporaryCommand.value.name = val
	} else {
		notifyIfError(setCommandProp(command, "name", val, props.manager))
	}
}
function saveCommandName(command: Command) {
	notifyIfError(setCommandProp(command, "name", temporaryCommand.value.name, props.manager))
	clearTemporary()
}
function handleBlur(command: Command) {
	if (saveOnBlur.value) {
		saveCommandName(command)
		saveOnBlur.value = false
	}
	clearTemporary()
}
</script>

