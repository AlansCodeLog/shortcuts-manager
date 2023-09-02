<template>
<div>
	<div :class="`
		rounded
		border
		border-neutral-600
		px-2
		py-1
		grid
		grid-cols-[repeat(1,minmax(0,1fr)),min-content]
	`"
	>
		<!-- new command -->
		<LibInput
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
			<LibInput
				:model-value="command.name"
				@update:model-value="notifyIfError(command.safeSet('name', $event))"
			/>
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
const newCommand = ref(new Command(""))

function addCommand(command: Command): void {
	const res = props.manager.commands.safeAdd(command)
	notifyIfError(res)
	if (res.isOk) {
		newCommand.value = new Command("")
	}
}
</script>
