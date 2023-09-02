<template>
<div
	id="shortcuts-manager"
	:class="twMerge(`
		p-2
		dark:bg-neutral-900
		dark:text-white
		min-h-screen
		min-h-100dvh
		flex
		flex-col
	`,
		outline ? 'group outlined outlined-visible' : '[&_*]:outline-none',
		darkMode && `dark`
	)"
	@mouseenter="mouseenter()"
	@mouseleave="mouseleave()"
>
	<k-context
		class="p-2"
		:contexts="contexts"
		@add="(contexts.has($event) ? undefined : contexts.set($event, false))"
		@remove="contexts.delete($event)"
		@activate="contexts.has($event) && contexts.set($event, true)"
		@deactivate="contexts.set($event, false)"
	/>
	<div class="active-area p-2"
		tabindex="0"
		ref="el"
		@click="el?.focus()"
	>
		<k-keyboard
			:keys="keys"
			:manager="manager"
		/>
	</div>
	<list-shortcuts class="p-2"
		:keys="keys"
		:manager="manager"
		:commands="commands"
		:shortcuts="shortcuts"
	/>
	<list-commands
		class="p-2"
		:manager="manager"
		:commands="commands"
	/>
	<lib-notifications :handler="notificationHandler"/>
</div>
</template>

<script setup lang="ts">
import { castType, keys as objectKeys } from "@alanscodelog/utils"
import { useAccesibilityOutline, useDarkMode } from "@alanscodelog/vue-components/composables"
import { twMerge } from "tailwind-merge"
import { onMounted, onUnmounted, type Ref, ref, shallowReactive, shallowRef, triggerRef } from "vue"

import { notificationHandler } from "./common/notificationHandler.js"
import KContext from "./components/Contexts.vue"
// import {theme} from "@alanscodelog/vue-components/theme.js"
import KKeyboard from "./components/Keyboard.vue"
import ListCommands from "./components/ListCommands.vue"
import ListShortcuts from "./components/ListShortcuts.vue"

// import { notificationHandlerSymbol } from "./injectionSymbols.js"
import { Command, Commands, Context, Key, Keys, Manager, Shortcut, Shortcuts } from "shortcuts-manager/classes"
import { createLayout } from "shortcuts-manager/layouts/index.js"
import type { ManagerListener } from "shortcuts-manager/types/manager.js"

// provide(notificationHandlerSymbol, notificationHandler)

const el = ref<HTMLElement | null>(null)

const { outline } = useAccesibilityOutline(el)
const { darkMode } = useDarkMode()

// #region Manager
const layout = createLayout("ansi")
type LayoutKeys = Key<(typeof layout)[number]["id"]>
const manager = new Manager(new Keys<LayoutKeys>([]),
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
const mouseenter = (): void => {
	if (manager.checkStateOnAllEvents) {
		manager.safeSet("checkStateOnAllEvents", false)
	}
}
const mouseleave = (): void => {
	if (!manager.checkStateOnAllEvents) {
		manager.set("checkStateOnAllEvents", true)
	}
}
/*
One could use a reactive instance of the manager, but it's a bit of a pain (requires toRaw every time you want to use a method, etc), it's also a large performance overhead with many shortcuts, etc.

So instead we can use a shallow reactive array with shallow refs to the entries to sync only the parts of the manager's state that we need with vue's.

For shortcuts, we need to trigger on any updates to it's properties, plus any of it's properties' properties that is shown in the ui (key label changes, command name changes). You aan see this in the keySet and commandSet hooks registered.

While the manager could provide, or we could implement a shortcut hook that adds a hook to any keys/commands it uses, this can result in a lot of listeners registered (think of keys, where one key might be in use by hundreds of shortcuts), that would be hundreds of listeners added.
*/
const keys: Ref<Key>[] = shallowReactive([])
const commands: Ref<Command>[] = shallowReactive([])
const shortcuts: Ref<Shortcut>[] = shallowReactive([])
const contexts = ref<Map<string, boolean>>(new Map())
// #region Keys

/**
 * Manage the adding and removing of entries as shallowRefs from a reactive array and add/remove any hooks to the entries automatically.
 */
const manageHooks = <T extends Key | Command | Shortcut>(
	// eslint-disable-next-line @typescript-eslint/no-shadow
	manager: Manager,
	type: "keys" | "commands" | "shortcuts",
	reactiveArray: Ref<T>[],
	hooks: Record<string, any>,
): void => {
	(manager[type] as any).addHook("add", (_self: any, _entries: any, entry: T) => {
		const isToggle = type === "keys" && (entry as any).is.toggle
		for (const key of objectKeys(hooks)) {
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
	;(manager[type] as any).addHook("remove", (_self: any, _entries: any, entry: T) => {
		const isToggle = type === "keys" && (entry as any).is.toggle
		for (const key of objectKeys(hooks)) {
			(entry as any).removeHook(key, hooks[key])
			if (isToggle) {
				(entry as any).on.removeHook(key, hooks[key])
			}
		}
		const index = reactiveArray
			.findIndex(existing => existing.value === entry)
		reactiveArray.splice(index, 1)

		if (isToggle) {
			const toggleIndex = reactiveArray
				.findIndex(existing => existing.value === (entry as any).on)
			reactiveArray.splice(toggleIndex, 1)
		}
	})
}


const keySet: Parameters<Key["addHook"]>[1] = (key, _value, _old, self) => {
	triggerRef(keys[keys.findIndex(existing => existing.value.id === self.id)])
	if (key === "label") {
		const filtered = shortcuts
			.filter(shortcut => shortcut.value.containsKey(self))
		for (const shortcut of filtered) triggerRef(shortcut)
	}
}
manageHooks(manager, "keys", keys, { set: keySet })

for (const raw of layout) {
	// todo temporary
	if (raw.opts.label === "Meta") {
		raw.opts.enabled = false
	}
	manager.keys.add(Key.create(raw))
}

manager.keys.recalculateLayout()

// #endregion

// #region Commands
const commandSet: Parameters<Command["addHook"]>[1] = (key, _value, _old, self) => {
	triggerRef(commands[commands.findIndex(existing => existing.value === self)])
	if (key === "name") {
		const filtered = shortcuts
			.filter(shortcut => shortcut.value.command === self)
		for (const shortcut of filtered) triggerRef(shortcut)
	}
}
manageHooks(manager, "commands", commands, { set: commandSet })


const triggerState = ref(false)
const defaultCommandExec = () => {
	triggerState.value = true
	setTimeout(() => {
		triggerState.value = false
	}, 500)
}

// #endregion

// #region Shortcuts

const shortcutSet: Parameters<Shortcut["addHook"]>[1] =
(_shortcut, _value, _old, self) => {
	triggerRef(shortcuts[shortcuts.findIndex(existing => existing.value === self)])
}
manageHooks(manager, "shortcuts", shortcuts, { set: shortcutSet })
// #endregion


const k = manager.keys.entries
const K = {
	ctrl: k.VirtualControlLeft,
	alt: k.VirtualAltLeft,
	shift: k.VirtualShiftLeft,
}
//
manager.commands.add(new Command("Test", { execute: defaultCommandExec }))
manager.commands.add(new Command("Test2", { execute: defaultCommandExec }))
manager.commands.add(new Command("Test3", { execute: defaultCommandExec }))
manager.commands.add(new Command("Test4 Very Long Name", { execute: defaultCommandExec }))
manager.commands.add(new Command("Ctrl+A", { execute: defaultCommandExec }))
manager.shortcuts.add(new Shortcut([[k.Digit1]], { command: manager.commands.entries.Test }))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test2 }))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test3 }))
manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries["Test4 Very Long Name"] }))
manager.shortcuts.add(new Shortcut([[K.ctrl, k.KeyA]], { command: manager.commands.entries.Test2 }))
manager.shortcuts.add(new Shortcut([[k.KeyB], [K.ctrl, k.KeyA]], { command: manager.commands.entries.Test }))

manager.shortcuts.add(new Shortcut([[k.KeyC], [K.ctrl, k.KeyA]], { command: manager.commands.entries.Test2 }))
manager.shortcuts.add(new Shortcut([[K.ctrl, k.KeyB], [K.ctrl, k.KeyA]], { command: manager.commands.entries.Test2 }))

const eventListener: ManagerListener = ({ event }: { event: Event }) => {
	if (
		(manager.isRecording && !(event instanceof MouseEvent)) // ||
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
	castType<Ref<HTMLElement>>(KKeyboard)
	manager.attach(el.value!)
	manager.addEventListener(eventListener)
})
onUnmounted(() => {
	manager.removeEventListener(eventListener)
	manager.detach(el.value!)
})

// const chain = useManagerChain(manager)
// todo
// const shortcutsList = useShortcutsList({ value: manager }, { value: keys }, chain)
</script>
<style>
body {
	overscroll-behavior: none;
}
</style>
