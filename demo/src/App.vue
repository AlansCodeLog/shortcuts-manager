<template>
	<div id="settings-area" :class="classes" ref="el" @mouseenter="mouseenter()" >
		<!-- <contexts :contexts="contexts" @add-context="contexts.push($event)"/> -->
		<keyboard :keys="keys" :manager="manager" :shortcuts="shortcuts"/>
		<lib-group>
			<lib-input v-model:modelValue="commandToAdd" @submit="addCommand()"/>
			<lib-button :label="'Add Command'" @click="addCommand()"/>
		</lib-group>
		<lib-group>
			<lib-input
				:suggestions="commands"
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
		<list :manager="manager" :shortcuts="shortcuts" :commands="commands"/>
		<lib-notifications :handler="notificationHandler"/>
	</div>
	<div if="test-area" @mouseenter="mouseleave()">
	Test Trigger
	{{triggerState}}
	</div>
</template>

<script setup lang="ts">
/* eslint-disable no-alert */
import { castType, isWhitespace, keys as objectKeys, unreachable } from "@alanscodelog/utils"
import { helpers, LibNotifications, mixins } from "@alanscodelog/vue-components"
import keyboard from "@demo/components/Keyboard.vue"
import list from "@demo/components/List.vue"
import { Command, Commands, Context, Key, Keys, Manager, Shortcut, Shortcuts } from "@lib/classes"
import { KnownError } from "@lib/helpers"
import { createLayout } from "@lib/layouts"
import { ManagerListener } from "@lib/types"
import { computed, onMounted, onUnmounted, provide, ref, Ref, shallowReactive, shallowRef, triggerRef } from "vue"
import { notificationHandlerSymbol } from "./injectionSymbols"


// #region Theme
const { theme, NotificationHandler } = helpers

const notificationHandler = new NotificationHandler()
provide(notificationHandlerSymbol, notificationHandler as any)

const { setupAccesibilityOutline } = mixins
theme()

const el = ref(null)

const { outline } = setupAccesibilityOutline(el)
// #region Theme

// #region Manager
const classes = computed(() => ({
	outline: outline.value,
}))
const manager = new Manager(new Keys([]),
	new Commands([]),
	new Shortcuts([]),
	new Context({}),
	undefined,
	{
		labelStrategy: true,
		labelFilter: (e, key) => {
			if (e?.key?.length === 1) {
				key.safeSet("label", e.key.toUpperCase())
				return false
			}
			if (["ScrollLock", "NumLock", "Pause", "PageDown", "PageUp", "PrintScreen", "ContextMenu"].includes(e.key!)) {
				return false
			}
			return true
		},
	},
)
const mouseenter = () => {
	if (manager.checkStateOnAllEvents) {
		manager.safeSet("checkStateOnAllEvents", false)
		manager.enabled = false
	}
}
const mouseleave = () => {
	if (!manager.checkStateOnAllEvents) {
		manager.set("checkStateOnAllEvents", true)
		manager.enabled = true
	}
}
/*
One could use a reactive instance of the manager, but it's a bit of a pain (requires toRaw every time you want to use a method, etc), it's also a large performance overhead with many shortcuts, etc.

So instead we can use a shallow reactive array with shallow refs to the entries to sync only the parts of the manager's state that we need with vue's.

For shortcuts, we need to trigger on any updates to it's properties, plus any of it's properties' properties that is shown in the ui (key label changes, command name changes). You can see this in the keySet and commandSet hooks registered.

While the manager could provide, or we could implement a shortcut hook that adds a hook to any keys/commands it uses, this can result in a lot of listeners registered (think of keys, where one key might be in use by hundreds of shortcuts), that would be hundreds of listeners added.
*/
const keys: Ref<Key>[] = shallowReactive([])
const commands: Ref<Command>[] = shallowReactive([])
const shortcuts: Ref<Shortcut>[] = shallowReactive([])
// #region Keys

/**
 * Manage the adding and removing of entries as shallowRefs from a reactive array and add/remove any hooks to the entries automatically.
 */
const manageHooks = <T extends Key | Command | Shortcut> ( manager:Manager, type: "keys"|"commands"|"shortcuts", reactiveArray:Ref<T>[], hooks:Record<string, any>): void => {
	;(manager[type] as any).addHook("add", (self:any, entries:any, entry:T) => {
		const isToggle = type === "keys" && (entry as any).is.toggle
		for (let key of objectKeys(hooks)) {
			(entry as any).addHook(key, hooks[key])
			if (isToggle) {
				(entry as any).on.addHook(key, hooks[key])
			}
		}
		reactiveArray.push(shallowRef(entry))
		if (isToggle) {
			reactiveArray.push(shallowRef((entry as any).on))
		}
	})
	;(manager[type] as any).addHook("remove", (self:any, entries:any, entry:T) => {
		const isToggle = type === "keys" && (entry as any).is.toggle
		for (let key of objectKeys(hooks)) {
			(entry as any).removeHook(key, hooks[key])
			if (isToggle) {
				(entry as any).on.removeHook(key, hooks[key])
			}
		}
		reactiveArray.splice(reactiveArray.findIndex(existing => existing.value === entry), 1)
		if (isToggle) {
			reactiveArray.splice(reactiveArray.findIndex(existing => existing.value === (entry as any).on), 1)
		}
	})
}


const keySet: Parameters<Key["addHook"]>[1]  = (key, value, old, self)=> {
	triggerRef(keys[keys.findIndex(existing => existing.value.id === self.id)])
	if (key === "label") {
		for (const shortcut of shortcuts.filter(shortcut => shortcut.value.containsKey(self))) triggerRef(shortcut)
	}
}
manageHooks(manager, "keys", keys, {"set":keySet})

for (const raw of createLayout("ansi")) {
	manager.keys.add(Key.create(raw))
}

manager.keys.recalculateLayout()

// #endregion

// #region Commands
const commandSet: Parameters<Command["addHook"]>[1]  = (key, value, olf, self)=> {
	triggerRef(commands[commands.findIndex(existing => existing.value === self)])
	if (key === "name") {
		for (const shortcut of shortcuts.filter(shortcut => shortcut.value.command === self)) triggerRef(shortcut)
	}
}
manageHooks(manager, "commands", commands, {set: commandSet})

const commandToAdd = ref("")
const commandToRemove = ref("")

const triggerState = ref(false)
const defaultCommandExec = () => {
	console.log("Test");

	triggerState.value = true
	setTimeout(() => {
		triggerState.value = false
	}, 500);
}
const addCommand = (): void => {
	const name = commandToAdd.value
	if (isWhitespace(name)) return
	// const exists = manager.commands.query(command => command.name === name, false)
	const command = new Command(name, {execute: defaultCommandExec})
	const canAdd = manager.commands.allows("add", command)
	if (canAdd.isOk) {
		commandToAdd.value = ""
		manager.commands.add(command)
	} else {
		notificationHandler.notify({message:canAdd.error.message, code: canAdd.error instanceof KnownError ? canAdd.error.code : "Unknown"})
	}
}
const removeCommand = (): void => {
	const name = commandToRemove.value
	if (isWhitespace(name)) unreachable()
	const command = manager.commands.entries[name]
	const canRemove = manager.commands.allows("remove", command)
	if (canRemove.isOk) {
		commandToAdd.value = ""
		manager.commands.remove(command)
	} else {
		notificationHandler.notify({message:canRemove.error.message, code: canRemove.error instanceof KnownError ? canRemove.error.code : "Unknown"})
	}
}

// #endregion
// #region Shortcuts

const shortcutSet: Parameters<Shortcut["addHook"]>[1]  = (shortcut, value, olf, self)=> {
	triggerRef(shortcuts[shortcuts.findIndex(existing => existing.value === self)])
}
manageHooks(manager, "shortcuts", shortcuts, {set: shortcutSet})
// #endregion


const k = manager.keys.entries

manager.commands.add(new Command("Test", {execute: defaultCommandExec}))
manager.commands.add(new Command("Test2", {execute: defaultCommandExec}))
manager.commands.add(new Command("Test3", {execute: defaultCommandExec}))
manager.commands.add(new Command("Test4 Very Long Name", {execute: defaultCommandExec}))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test }))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test2 }))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test3 }))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries["Test4 Very Long Name"] }))

const eventListener: ManagerListener = ({ event, isKeydown, keys }) => {
	if (
		(manager.isRecording && !(event instanceof MouseEvent)) //||
		// (
		// 	!manager.isRecording &&
		// 	// (
		// 	// 	manager.chain.length > 1
		// 	// )
		// 	// && !["INPUT"].includes((event.target as any)?.tagName)
		// )
	) {
		event.preventDefault()
	}
}
// #endregion

// #endregion

onMounted(() => {
	castType<Ref<HTMLElement>>(keyboard)
	manager.attach(document)
	manager.addEventListener(eventListener)
})
onUnmounted(() => {
	manager.removeEventListener(eventListener)
	manager.detach(document)
})



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
	display:flex;
	// @include flex-col(nowrap);
}
// #test-area {
// }
</style>
