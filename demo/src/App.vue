<template>
<div
	id="shortcuts-manager"
	:class="twMerge(`
		p-4
		dark:bg-neutral-900
		dark:text-white
		min-h-screen
		min-h-100dvh
		flex
		flex-col
		gap-2
	`,
		outline ? 'group outlined outlined-visible' : '[&_*]:outline-none',
		darkMode && `dark`
	)"
	@mouseenter="mouseenter()"
	@mouseleave="mouseleave()"
>
	<div>
		<a :href="githubLink"
			class="
		hover:text-accent-600
		focus:text-accent-600
	"
		>
			<div class="text-xl text-center">Shortcut Manager Demo</div>
		</a>
		<div class="text-xs text-center">* Please note the library is still very alpha and there is no way to save on this demo yet.</div>
	</div>
	<GithubCorner :href="githubLink"/>
	<!-- <k-context -->
	<!-- 	class="" -->
	<!-- 	:contexts="contexts" -->
	<!-- 	@add="(contexts.has($event) ? undefined : contexts.set($event, false))" -->
	<!-- 	@remove="contexts.delete($event)" -->
	<!-- 	@activate="contexts.has($event) && contexts.set($event, true)" -->
	<!-- 	@deactivate="contexts.set($event, false)" -->
	<!-- /> -->
	<div class="active-area "
		tabindex="0"
		ref="el"
		@click="el?.focus()"
	>
		<k-keyboard
			:keys="keys"
			:manager="manager"
			:shortcuts="shortcuts"
		/>
	</div>
	<div class="
		
		gap-2
		flex
		justify-start
		items-center
	"
	>
		<LibButton :disabled="listContextActive === type"
			v-for="type of ['Shortcuts', 'Commands']"
			:key="type"
			@click="listContextActive = type"
		>
			{{ type }}
		</LibButton>
	</div>
	<list-shortcuts v-show="listContextActive === 'Shortcuts'"
		class=""
		:keys="keys"
		:manager="manager"
		:commands="commands"
		:shortcuts="shortcuts"
	/>
	<list-commands
		v-show="listContextActive === 'Commands'"
		class=""
		:manager="manager"
		:commands="commands"
	/>
	<div class=" flex">
		<LibButton
			v-if="commands.length ===0 && shortcuts.length === 0"
			class="flex-1"
		
			@click="addExampleData()"
		>
			Add Example Data
		</LibButton>
	</div>
	<lib-notifications :handler="notificationHandler"/>
</div>
</template>

<script setup lang="ts">
import { castType, keys as objectKeys } from "@alanscodelog/utils"
import { useAccesibilityOutline, useDarkMode } from "@alanscodelog/vue-components/composables"
import { twMerge } from "tailwind-merge"
import { onMounted, onUnmounted, provide, reactive, type Ref, ref, shallowRef, triggerRef } from "vue"

import { notificationHandler } from "./common/notificationHandler.js"
// import KContext from "./components/Contexts.vue"
import GithubCorner from "./components/GithubCorner.vue"
// import {theme} from "@alanscodelog/vue-components/theme.js"
import KKeyboard from "./components/Keyboard.vue"
import ListCommands from "./components/ListCommands.vue"
import ListShortcuts from "./components/ListShortcuts.vue"
import { notificationHandlerSymbol } from "./injectionSymbols.js"

import { Command, Commands, Context, Key, Keys, Manager, Shortcut, Shortcuts } from "shortcuts-manager/classes"
import { createLayout } from "shortcuts-manager/layouts/index.js"
import type { ManagerListener } from "shortcuts-manager/types/manager.js"


provide(notificationHandlerSymbol, notificationHandler)

const el = ref<HTMLElement | null>(null)

const { outline } = useAccesibilityOutline(el)
const { darkMode } = useDarkMode()
const listContextActive = ref<"Shortcuts" | "Commands">("Shortcuts")

const githubLink = "https://alanscodelog.github.io/shortcuts-manager/demo"

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
const keys: Ref<Key>[] = reactive([])
const commands: Ref<Command>[] = reactive([])
const shortcuts: Ref<Shortcut>[] = reactive([])
// const contexts = ref<Map<string, boolean>>(new Map())
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
const defaultCommandExec = (...args: any[]) => {
	// eslint-disable-next-line no-console
	console.log(args)
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
const m = {
	ctrl: k.VirtualControlLeft,
	alt: k.VirtualAltLeft,
	shift: k.VirtualShiftLeft,
}
function addExampleData() {
	const c1 = new Command("Command", { execute: defaultCommandExec })
	const c2 = new Command("Command w Mod", { execute: defaultCommandExec })
	const c3 = new Command("Command in Chain", { execute: defaultCommandExec })
	for (const c of [c1, c2, c3]) { manager.commands.add(c) }
	const s1 = new Shortcut([[k.KeyB]], { command: c1 })
	const s2 = new Shortcut([[m.ctrl, k.KeyB]], { command: c2 })
	const s3 = new Shortcut([[k.KeyV], [k.KeyB]], { command: c3 })
	for (const s of [s1, s2, s3]) {manager.shortcuts.add(s)}
}

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
