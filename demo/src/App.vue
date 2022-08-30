<template>
	<div id="root" :classes="classes" ref="el">
		<!-- <contexts :contexts="contexts" @add-context="contexts.push($event)"/> -->
		<keyboard :layout="layout" :manager="manager"/>
		<lib-group>
			<lib-input v-model:modelValue="commandToAdd" @submit="addCommand()"/>
			<lib-button :label="'Add Command'" @click="addCommand()"/>
		</lib-group>
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
		<list :manager="manager" :existingCommands="existingCommands"/>
	</div>
</template>

<script setup lang="ts">
/* eslint-disable no-alert */
import { castType, unreachable } from "@alanscodelog/utils"
import { helpers, mixins } from "@alanscodelog/vue-components"
import keyboard from "@demo/components/Keyboard.vue"
import list from "@demo/components/List.vue"
import { Command, Commands, Context, Key, Keys, Manager, Shortcut, Shortcuts } from "@lib/classes"
import { createLayout } from "@lib/layouts"
import { ManagerListener } from "@lib/types"
import { computed, onMounted, onUnmounted, reactive, ref, Ref } from "vue"


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
		const command =new Command(name)
		manager.commands.add(command)
		command.addHook("set", commandSet)
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
const commandSet: Parameters<Command["addHook"]>[1]  = (key, value)=> {
	console.log(key, value, Object.keys(manager.commands.entries));

	if (key == "name") {
		existingCommands.value = Object.keys(manager.commands.entries)
	}
}

for (const existing of existingCommands.value){
	manager.commands.entries[existing].addHook("set", commandSet)
}

const eventListener: ManagerListener = ({ event, isKeydown, keys }) => {
	if (
		(manager.isRecording && !(event instanceof MouseEvent)) ||
		(!manager.isRecording &&
			(
				manager.chain.length > 1 ||
				manager.pressedNonModifierKeys().length > 0
			)
		)
	) {
		event.preventDefault()
	}
}
onMounted(() => {
	castType<Ref<HTMLElement>>(keyboard)
	manager.attach(document)
	manager.addEventListener(eventListener)
})
onUnmounted(() => {
	manager.removeEventListener(eventListener)
	manager.detach(document)
})


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
