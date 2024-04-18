import { castType } from "@alanscodelog/utils/castType.js"
import { isArray } from "@alanscodelog/utils/isArray.js"
import { Result } from "@alanscodelog/utils/Result.js"
import type { RecordFromArray } from "@alanscodelog/utils/types"

import { createCommand } from "./createCommand.js"
import { createCommands } from "./createCommands.js"
import { createKey } from "./createKey.js"
import { createKeys } from "./createKeys.js"
import { createManagerOptions } from "./createManagerOptions.js"
import { createShortcut } from "./createShortcut.js"
import { createShortcuts } from "./createShortcuts.js"
import { type CanHookErrors, type CanHooks, type Command, type Commands, type CommandsSetEntries, type Context, type ERROR, type Hooks, type Key, type Keys, type KeysSetEntries, type Manager, type ManagerListener, type MultipleErrors, type RawCommand, type RawKey, type RawShortcut, type Shortcut, type Shortcuts, type ShortcutsSetEntries } from "./types/index.js"

/**
 * Create a manager which can track key states, layouts, and trigger shortcuts. Basically the brains of the operation.
 *
 * First, all the elements of a manager need to be created.
 * Then you can create the listeners for the manager with {@link createManagerEventListeners}.
 *
 * Then these listeners can be attached/removed from elements (or the {@link Emulator})
 *
 * You could make several managers for different areas of your application or use single manager and different contexts to differ between them.
 *
 * It is easiest to build a manager like so, but the manager also takes in full {@link Keys}/{@link Commands}/{@link Shortcuts} instances, though it's a bit harder to build those first then pass to the manager:
 * ```ts
 *
 * const manager = createManager(
 * {
 * 	keys: [
 * 		createKey("a", ),
 *			// or using a raw key
 * 		{id: "b"}
 * 	],
 * 	commands: [
 * 		createCommand("a"),
 * 		{name: "b", execute() {....}}
 * 	],
 * 	shortcuts: [
 * 		{ chain: [["a"]], command: "a" }
 * 	]
 * 	context: createContext({...}),
 * 	options: {
 *		// required
 * 		evaluateCondition() {
 * 				...
 * 		}
 * 	}
 * }, {
 * 	// if constructing from raw entries like above, createKeys/Shortcuts can take additional options
 * 	...,
 * 		keys: {...},
 * 		shortcuts:{...}
 * }).unwrap()
 *
 * const listeners = createManagerEventListeners(manager)
 * attach(document, listeners)
 * // to remove:
 * dettach(document, listeners)
 * ```
 *
 * You will then not need to do much else. It will take care of setting the pressed state of keys, the state of the current chord chain (see {@link Manager._chain}), finding a matching shortcut if it exists, and triggering it's command.
 *
 * The way this works is that when a key is pressed it's added to the current chord in the chain. If the chain matches a shortcut's chain that can be triggered (it must be enabled, it must have a command and a function to execute, and it's condition and it's command's condition must evaluate to true), the command's execute function is triggered with `isKeydown = true`, see {@link Command.execute}.
 *
 * If there are no shortcuts to trigger but there are "potential shortcuts" that start with the current chain and could trigger and current chord contains any non-modifier keys (see {@link Manager.pressedNonModifierKeys}), an empty chord will be added to the chain on the next key pressed and the process repeats.
 *
 * If there are no shortcuts and no potential shortcuts, the callback will be called with {@link ERROR.NO_MATCHING_SHORTCUT} and you will probably want to clear the chain. When the chain is cleared (see {@link Manager._chain}), the manager will not add/remove keys from the chain until all non-modifier keys are unpressed. Pressed state is still set/tracked though.
 *
 * The moment a key is released after a shortcut is triggered, the command's execute function is fired again with `isKeydown = false`.
 *
 * If {@link Manager.options.updateStateOnAllEvents} is not disabled and a mouseeneter listener was created, the manager is able to keep the most accurate state of the modifier keys. See {@link Manager.options.updateStateOnAllEvents} for more info.
 *
 * For a detailed usage example, see the demo.
 *
 * ### Other
 *
 * - If you need to emulate keypresses for testing see {@link Emulator}.
 */


export function createManager<
	THooks extends Hooks,
	TKeys extends Keys | RawKey[],
	TShortcuts extends Shortcuts | RawShortcut[],
	TCommands extends Commands | RawCommand[],
	TContext extends Context,
	TListener extends ManagerListener,
>(
	rawManager: {
		name?: string
		options: Partial<Omit<Manager["options"], "evaluateCondition">>
		& Pick<Manager<any, any, any, any, TContext>["options"], "evaluateCondition">
		context?: TContext
		keys?: TKeys
		shortcuts?: TShortcuts
		commands?: TCommands
		hooks?: Partial<THooks>
		listener?: TListener
	},
	additionalOpts: Partial< {
		keys?: Partial<Pick<Keys, "autoManageLayout" | "layout">>
		shortcuts?:	Partial<Pick<Shortcuts, "ignoreModifierConflicts" | "ignoreChainConflicts" >>
	}
	> = {}
): Result<
		Manager<
			THooks,
			TKeys extends Keys
			? Extract<TKeys, Keys>
			: TKeys extends RawKey[]
			? Keys<RecordFromArray<TKeys, "id", Key>>
			: never,
			Shortcuts,
			TCommands extends Commands
			? Extract<TCommands, Commands>
			: TCommands extends RawCommand[]
			? Commands<RecordFromArray<TCommands, "name", Command>>
			: never,
			TContext
		>,
		MultipleErrors<
		| CommandsSetEntries["entries@add"]["error"]
		| KeysSetEntries["entries@add"]["error"]
		| ShortcutsSetEntries["entries@add"]["error"]
		| ERROR.INVALID_VARIANT
		> | CanHookErrors<THooks extends never ? never : THooks, keyof CanHooks>
	>
{
	const options = createManagerOptions(rawManager.options as any)
	const m = { options }
	const state = {
		chain: [],
		isAwaitingKeyup: false,
		isRecording: false,
		untrigger: false,
		nextIsChord: false,
	} satisfies Manager["state"]

	let keys = rawManager.keys

	if (!keys || isArray(keys)) {
		castType<RawKey[]>(keys)
		const keysList: Key[] = []
		if (keys) {
			for (const key of keys) {
				const res = createKey(key.id, key)
				if (res.isError) return res
				keysList.push(res.value)
			}
		}
		const res = createKeys(keysList, m, additionalOpts?.keys)
		if (res.isError) return res
		keys = res.value satisfies Keys as any
	}

	let commands = rawManager.commands

	if (!commands || isArray(commands)) {
		castType<RawCommand[]>(commands)
		const commandsList: Command[] = []
		if (commands) {
			for (const command of commands) {
				const res = createCommand(command.name, command)
				commandsList.push(res)
			}
		}
														
		const res = createCommands(commandsList, { options })
		if (res.isError) return res as any
		commands = res.value satisfies Commands as any
	}

	let shortcuts = rawManager.shortcuts
	if (!shortcuts || isArray(shortcuts)) {
		castType<RawShortcut[]>(shortcuts)
		const shortcutsList: Shortcut[] = []
		const m2 = { ...m, commands: commands as Commands, keys: keys as Keys }
		if (shortcuts) {
			for (const shortcut of shortcuts) {
				const res = createShortcut(shortcut, m2)
				if (res.isError) return res
				shortcutsList.push(res.value)
			}
		}

		const res = createShortcuts(shortcutsList, {
			keys: keys! as Keys,
			commands: commands! as Commands,
			options,
		}, additionalOpts?.shortcuts)
		if (res.isError) return res as any
		shortcuts = res.value satisfies Shortcuts as any
	}

	const manager: Manager = {
		...rawManager,
		name: rawManager.name ?? "manager",
		type: "manager",
		keys: keys! as Keys,
		shortcuts: shortcuts! as Shortcuts,
		commands: commands! as Commands,
		options,
		state,
		context: rawManager.context!,
		hooks: rawManager?.hooks as any as THooks,
	}
	return Result.Ok(manager) as any
}
