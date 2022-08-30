<template>
	<div id="root" :classes="classes" ref="el">
		<!-- <contexts :contexts="contexts" @add-context="contexts.push($event)"/> -->
		<keyboard :layout="layout" :manager="manager"/>
		<lib-group>
			<lib-input v-model:modelValue="commandToAdd" @submit="addCommand()"/>
			<lib-button :label="'Add Command'" @click="addCommand()"/>
		</lib-group>
		{{ existingCommands }}
		<lib-group>
			<lib-input
				:suggestions="existingCommands"
				:restrict-to-suggestions="true"
				v-model="commandToRemove"
				@submit="removeCommand()"
			>
				<template #item="{item}">
					{{ item }}
				</template>
			</lib-input>
			<lib-button :label="'Remove Command'" @click="removeCommand()"/>
		</lib-group>
		<list :manager="manager"/>
	</div>
</template>

<script setup lang="ts">
/* eslint-disable no-alert */
import { unreachable } from "@alanscodelog/utils"
import { helpers, mixins } from "@alanscodelog/vue-components"
import keyboard from "@demo/components/Keyboard.vue"
import list from "@demo/components/List.vue"
import { Command, Commands, Context, Key, Keys, Manager, Shortcut, Shortcuts } from "@lib/classes"
import { createLayout } from "@lib/layouts"
import { computed, reactive, ref } from "vue"


// #region Theme
const { theme } = helpers
const { setupAccesibilityOutline } = mixins
theme()

const el = ref(null)

const { outline } = setupAccesibilityOutline(el)
// #region Theme

// #region Manager
const layout: Key[] = [...createLayout("iso")].map(raw =>
// raw.opts.label = "";
	reactive(Key.create(raw)) as Key,
)

const classes = computed(() => ({
	outline: outline.value,
}))
const manager = new Manager(new Keys(layout),
	new Commands([]),
	new Shortcuts([]),
	new Context({}),
	undefined,
	{
		labelStrategy: true,
		labelFilter: (e, key) => {
			if (e?.key?.length === 1) {
				key.set("label", e.key.toUpperCase())
				return false
			}
			if (["ScrollLock", "NumLock", "Pause", "PageDown", "PageUp", "PrintScreen", "ContextMenu"].includes(e.key)) {
				return false
			}
			return true
		},
	},
)
manager.keys.recalculateLayout()
const k = manager.keys.entries
manager.commands.add(new Command("Test"))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test }))

// #endregion

// #region Commands
const commandToAdd = ref("")
const commandToRemove = ref("")

const existingCommands = ref([...Object.keys(manager.commands.entries)])

manager.commands.addHook("add", (_self, entries) => {
	existingCommands.value = Object.keys(entries)
})
manager.commands.addHook("remove", (_self, entries) => {
	existingCommands.value = Object.keys(entries)
})

const addCommand = (): void => {
	const name = commandToAdd.value
	if (name === "") return
	const exists = manager.commands.query(command => command.name === name, false)
	if (exists) {
		window.alert("Command already exists")
	} else {
		manager.commands.add(new Command(name))
		commandToAdd.value = ""
	}
}
const removeCommand = (): void => {
	const name = commandToRemove.value
	if (name === "") return

	const existing = manager.commands.query(command => command.name === name, false)
	if (!existing) unreachable("Input should guard against non-existant command.")
	const allowsRemoveRes = manager.commands.allows("remove", existing)

	if (allowsRemoveRes.isError) {
		window.alert("Command in use, cannot be removed.")
	} else {
		manager.commands.remove(existing)
	}
}
// #endregion

</script>

<style lang="scss">
* {
	box-sizing: border-box;
}

body {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	margin: 0;
	font-size: 1.1rem;
}

#root {
	overflow: auto-scroll;
	min-height: 100vh;
	margin: 0;
}
</style>
