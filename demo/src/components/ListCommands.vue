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
			@update:model-value="notifyIfError(newCommand.safeSet('name', $event))"
			@submit="addCommand(toRaw(newCommand as Command))"
		/>
		<div class="items-center px-1">
			<LibButton :border="false"
				icon="solid plus"
				aria-label="Add Command"
				auto-title-from-aria
				@click="addCommand(toRaw(newCommand as Command))"
			/>
		</div>

		<!-- existing -->
		<template v-for="({value:command }) of commands" :key="command.name">
			<div class="grid grid-cols-[minmax(0,1fr),min-content]">
				<LibInput
					:border="false"
					:model-value="toRaw(temporaryCommand.command) === toRaw(command) ? temporaryCommand.name : command.name"
					
					@focus="setTemporary(command)"
					@blur="handleBlur(command)"
					@update:model-value="updateCommandName(command, $event)"
					@submit="notifyIfError(command.safeSet('name', $event))"
				/>
				<LibButton v-if="toRaw(temporaryCommand.command) === toRaw(command) && temporaryCommand.name !== command.name"
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
					@click="notifyIfError(manager.commands.safeRemove(toRaw(command)))"
				/>
			</div>
		</template>
	</div>
</div>
</template>
<script setup lang="ts">
import { type Ref, ref, toRaw } from "vue"

import { Command, type Manager } from "shortcuts-manager/classes/index.js"

import { notifyIfError } from "../common/notifyIfError.js"


const props = defineProps<{
	manager: Manager
	commands: Ref<Command>[]
}>()
const saveOnBlur = ref(false)
const newCommand = ref(new Command(""))
const temporaryCommand = ref<{
	command: Command | undefined
	name: string
}>({
	command: undefined,
	name: "",
})

function addCommand(command: Command): void {
	const res = props.manager.commands.safeAdd(command)
	notifyIfError(res)
	if (res.isOk) {
		newCommand.value = new Command("")
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
	if (toRaw(temporaryCommand.value.command) === toRaw(command)) {
		temporaryCommand.value.name = val
	} else {
		notifyIfError(command.safeSet("name", val))
	}
}
function saveCommandName(command: Command) {
	notifyIfError(command.safeSet("name", temporaryCommand.value.name))
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
