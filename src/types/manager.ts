import type { AnyFunction } from "@alanscodelog/utils/types"

import type {
	CanHookCommandProps,
	CanHookCommandsProps,
	CanHookKeyProps,
	CanHookKeysProps,
	CanHookShortcutProps,
	CanHookShortcutsProps,
	ChainErrors,
	Command,
	Commands,
	CommandSetEntries,
	CommandsSetEntries,
	ConditionComparer,
	ConditionEvaluator,
	Context,
	ERROR,
	IKeysSorter,
	IStringifier,
	Key,
	KeyboardLayoutMap,
	Keys,
	KeySetEntries,
	KeysSetEntries,
	MultipleErrors,
	OnHookCommandProps,
	OnHookCommandsProps,
	OnHookKeyProps,
	OnHookKeysProps,
	OnHookShortcutProps,
	OnHookShortcutsProps,
	Shortcut,
	Shortcuts,
	ShortcutSetEntries,
	ShortcutsSetEntries,
	TriggerableShortcut,
} from "./index.js"

import type { EmulatedEvent } from "../EmulatedEvent.js"
import type { KnownError } from "../helpers/index.js"


export type AnyInputEvent =
	| KeyboardEvent
	| MouseEvent
	| WheelEvent
	| EmulatedEvent
export type MinimalInputEvent =
	| { button: number }
	| { code?: string, key: string }
	| { deltaY: number }


export type ManagerReplaceValue = Partial<Pick<Manager, "shortcuts" | "keys" | "commands">>
export type ManagerReplaceErrors = KnownError<ERROR.UNKNOWN_KEY | ERROR.UNKNOWN_COMMAND>


export type ManagerListener = ({ event, keys, isKeydown, manager }: { event?: AnyInputEvent, keys: string[], isKeydown: boolean, manager: Manager }) => void

export type ExportedManager = {
	shortcuts?: Shortcuts
	keys?: Keys
	commands?: Commands
}


export type OnHook <
	TBase,
T extends Record<string, { val: any }>,
	TKey extends keyof T = keyof T,
	TVal extends T[TKey]["val"] = T[TKey]["val"],
> =
(obj: TBase, key: TKey, val: TVal) => void


export type CanHook<
	TBase,
	T extends Record<string, { val: any }>,
	TKey extends keyof T = keyof T,
	TVal extends T[TKey]["val"] = T[TKey]["val"],
	TError extends Error = Error,
> =
	(obj: TBase, key: TKey, val: TVal) => TError | true

type GetManagerHooks<T extends OnHookManagerProps> =
T extends CanHookManagerProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetManagerProp" | "onSetManagerProp">>
: Partial<Pick<NonNullable<Manager["hooks"]>, "onSetManagerProp">>

export type OnHookManagerProps = "state.chain" | "shortcuts" | "keys" | "commands" | `state.${keyof Manager["state"]}`
export type CanHookManagerProps = "state.chain" | "shortcuts" | "keys" | "commands" | `state.${keyof Pick<Manager["state"], "isRecording">}`
type ManagerStateHook<T extends keyof Manager["state"]> = {
	val: Manager["state"][T]
	manager: Manager
	hooks: GetManagerHooks< `state.${T}` >
	error: never
}
export type ManagerSetEntries = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"state.chain": {
		val: string[][]
		manager: Manager
		hooks: GetManagerHooks<"state.chain">
		error: ERROR.UNKNOWN_KEY
	}
	shortcuts: {
		val: Shortcuts
		manager: Manager
		hooks: GetManagerHooks<"shortcuts">
		error: ERROR.UNKNOWN_COMMAND | ChainErrors
	}
	commands: {
		val: Commands
		manager: Manager
		hooks: GetManagerHooks<"commands">
		error: ERROR.UNKNOWN_COMMAND
	}
	keys: {
		val: Keys
		manager: Manager
		hooks: GetManagerHooks<"keys">
		error: ChainErrors
	}
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"state.isRecording": ManagerStateHook<"isRecording">
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"state.isAwaitingKeyup": ManagerStateHook<"isAwaitingKeyup">
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"state.nextIsChord": ManagerStateHook<"nextIsChord">
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"state.untrigger": ManagerStateHook<"untrigger">
}


export type CanHooks = {
	canSetKeyProp?: CanHook<Key, Pick<KeySetEntries, CanHookKeyProps>>
	canSetKeysProp?: CanHook<Keys, Pick<KeysSetEntries, CanHookKeysProps>>
	
	canSetCommandProp?: CanHook<Command, Pick<CommandSetEntries, CanHookCommandProps>>
	canSetCommandsProp?: CanHook<Commands, Pick<CommandsSetEntries, CanHookCommandsProps>>

	canSetShortcutProp?: CanHook<Shortcut, Pick<ShortcutSetEntries, CanHookShortcutProps>>
	canSetShortcutsProp?: CanHook<Shortcuts, Pick<ShortcutsSetEntries, CanHookShortcutsProps>>

	canSetManagerProp?: CanHook<Manager, Pick<ManagerSetEntries, CanHookManagerProps>>
}
export type OnHooks = {
	onSetKeyProp?: OnHook<Key, Pick<KeySetEntries, OnHookKeyProps>>
	onSetKeysProp?: OnHook<Keys, Pick<KeysSetEntries, OnHookKeysProps>>

	onSetCommandProp?: OnHook<Command, Pick<CommandSetEntries, OnHookCommandProps>>
	onSetCommandsProp?: OnHook<Commands, Pick<CommandsSetEntries, OnHookCommandsProps>>

	onSetShortcutProp?: OnHook<Shortcut, Pick<ShortcutSetEntries, OnHookShortcutProps>>
	onSetShortcutsProp?: OnHook<Shortcuts, Pick<ShortcutsSetEntries, OnHookShortcutsProps>>

	onSetManagerProp?: OnHook<Manager, Pick<ManagerSetEntries, OnHookManagerProps>>
}
export type Hooks = OnHooks & CanHooks

export type CanHookErrors<T extends CanHooks | any, TKey extends keyof T | string> =
	T extends CanHooks
	? TKey extends keyof T
	? Extract<ReturnType<Extract<T[TKey], AnyFunction>>, Error>
	: never
	: never
export type Manager<

	THooks extends Partial<Hooks> = Partial<Hooks>,
	TKeys extends Keys= Keys,
	TShortcuts extends Shortcuts = Shortcuts,
	TCommands extends Commands = Commands,
	TContext extends Context = Context,
	TListener extends ManagerListener= ManagerListener,
> = {
	/** A name for the manager. */
	name: string
	type: "manager"
	context: TContext
	keys: TKeys
	shortcuts: TShortcuts
	commands: TCommands
	/** Most options can be set directly, except any readonly options which must go through {@link setManagerProperties} to ensure state remains consistent. */
	options: {
		sorter: IKeysSorter
		stringifier: IStringifier

		/**
		 * The error callback for recoverable errors such as multiple shortcuts matching, no shortcut matching once a chord chain has been "started", or an unknown key event because no matching key was found (only for keyboard events).
		 *
		 * Usually you will want to clear the manager's chain when this happens and display the error to the user. The default callback logs the error and clears the chain.
		 *
		 * In the case of multiple valid shortcuts, if you trigger any of the shortcuts "manually" note that you will need to simulate both the keydown/keyup calls if you differentiate between them.
		 *
		 * Also the input event can be undefined if you set the manager chain directly since it will check if it should trigger shortcuts.
		 */

		cb: (
			manager: Manager,
			error: MultipleErrors<
			| ERROR.MULTIPLE_MATCHING_SHORTCUTS
			| ERROR.NO_MATCHING_SHORTCUT
			| ERROR.UNKNOWN_KEY_EVENT
			| ERROR.UNKNOWN_KEY // for chain
			>
			, e?: AnyInputEvent) => void

		/**
		 * Determines if two conditions are equal.
		 *
		 * This is actually not a good idea to implement if you use boolean conditions. See {@link ConditionComparer} for why.
		 */
		conditionEquals: ConditionComparer
		/** Determines how conditions are evaluated. */
		evaluateCondition: ConditionEvaluator<TContext>
		/** Enable/disable triggering of shortcuts. The manager otherwise works as normal. */
		enableShortcuts: boolean
		/** Enable/disable listeners. Listeners will remain attached but do nothing. */
		enableListeners: boolean
		/**
		 * Whether to check the state of modifier or toggle keys using `event.getModifierState`.
		 *
		 * This is set to true by default when using `createManager` because it is usually what you want. It tracks the state with the most accuracy when, for example, the user focuses out, toggles a key, then focuses back.
		 *
		 * But, if you are allowing the user to change key states in some way (e.g. clicking on keys in the settings to visualize shortcuts), you will want to disable this temporarily so that they can click modifier keys. Otherwise they'd be immediately toggled off again (by the state check during the click) and nothing would happen.
		 *
		 * Keys also have their own individual {@link Key.updateStateOnAllEvents} in case you need more fine grained control.
		 *
		 * When this is set to false, the default mouseenter handler will ignore the event.
		 *
		 * If you will always have this set to false, you can forego the mouseenter event listener.
		 */
		updateStateOnAllEvents: boolean

	}
	/**
	 * An event listener for all events the manager handles including {@link virtualPress}/{@link virtualRelease}.
	 *
	 * The listener is called right after keys are found so you can have access to the keys as the manager understood them, but before everything else (setting the state, labeling, adding/removing from the chain). Note that `isKeydown` is always true for wheel events since their keyup is emulated within the same event handler.
	 *
	 * This exists because not all events trigger shortcuts (which can access only the event that triggered them) but there are many times when you might still want access to the event to do things like `e.preventdefault()`:
	 *
	 * - When recording, we usually always need to do `e.preventDefault()` except in some rare cases:
	 * 	- For example say you have a div which records while focused, if the manager is attached to a parent element, you will have to allow clicks to the parent so losing focus stops the recording. You do not generally need to allow keys through as you can set all shortcut conditions to only trigger when not recording, temporily swap out the shortcuts while recording, or use the onSetKeyProp hook (note this would mean hardcoding keys, but might be acceptable for a case such as this).
	 * 	 - We also need to `e.preventDefault()` for any chords that are also browser shortcuts (though note not all browser shortcuts can be overriden). If you really need to there is the [Keyboard API](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API) which allows requesting some keyboard shortcuts be locked (see [Keyboard Locking](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API#keyboard_locking)).
	 *
	 *
	 * The following should give you a good starting point:
	 *
	 * ```ts
	 * manager.listener = (({event, isKeydown, keys}) => {
	 * 	if (
	 * 		(manager.isRecording && !(event instanceof MouseEvent))
	 * 		// || TODO browser shortcuts filter
	 * 	) {
	 * 		event.preventDefault()
	 * 	}
	 * })
	 * ```
	 */
	listener?: TListener
	/**
	 * Hooks provide a way to set further limits on what can be changed (can hooks), and provide listeners for when something *is* about to change (on* hooks).
	 *
	 * on* hooks allow hooking into changes for certain properties (such as key size/pos changed) to trigger recalculations (e.g. of layouts).
	 *
	 * They could also technically be used as an escape hatch for frameworks that don't support working mutable data, but I would advice against it. Instead I would recommend using a proxy based state management solution like valtio that allows for mutations and optimized rendering.
	 */
	hooks: THooks
	
	/**
	 * The manager requires some state to function and be a little bit more efficient. All properties are readonly because they should not be modified unless they are allowed to be by {@link setManagerProp}.
	 */
	state: {
		/**
		 * The current chain of chords.
		 *
		 * Note that the manager's chain is not neccesarily valid and should be checked before assigning to a shortcut.
		 *
		 * @RequiresSet @OnHookable @Managed
		 */
		readonly chain: string[][]
		/**
		 * Whether the manager is waiting for non-modifier keys to be release.
		 *
		 *@RequiresSet @OnHookable @Managed
		 */
		readonly isAwaitingKeyup: boolean
		/**
		 * Whether the manager is in recording mode.
		 *
		 * When enabling/disabling this property, you should clear the chain first with {@link safeSetSetManagerChain}.
		 *
		 * ```
		 * safeSetManagerChain(manager, [])
		 * setManagerProp(manager, "state.isRecording", true)
		 * //...
		 * safeSetManagerChain(manager, [])
		 * setManagerProp(manager, "state.isRecording", false)
		 * ```
		 *
		 * To allow users to record shortcuts, you can do something like have an input element that on focus starts recording and stops when focused is blurred (this has the advantage of working with keyboard navigation). In such a case, you can use the {@link Manager.listener} to `e.preventDefault()` all events except clicks outside the input. See it for more details.
		 *
		 * @RequiresSet @OnHookable @CanHookable
		 */
		readonly isRecording: boolean
		/**
		 * There are times, such as after a keydown event, that a shortcut command will trigger, but we also need to "untrigger" it later on key up. If there is a triggerable shortcut it is saved here. See {@link Manager.state.chain}.
		 *
		 * @RequiresSet @OnHookable @Managed
		 */
		readonly untrigger: false | TriggerableShortcut
		/**
		 * The manager keeps track of whether the next key press should start a new chord or not.
		 *
		 * @RequiresSet @OnHookable @Managed
		 */
		readonly nextIsChord: boolean
	}
}


export type LabelOptions = {
	/**
	 * See {@link labelWithKeyboardMap}. This is required for label strategies that use the navigator. You can get the map using [navigator.keyboard.getLayoutMap()](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/getLayoutMap).
	 */
	map: KeyboardLayoutMap
	
	/**
	 * Filters the auto labeling.
	 *
	 * If the filter returns true, the key is not labeled.
	 *
	 * You can also use this to label the key yourself.
	 *
	 * Common filter actions:
	 * - Capitalize all single character keys to match what they look like on real keyboard.
	 * - Prevent keys with multi-line labels (e.g. `Num\nLock`, `Scroll\nLock` from getting changed).
	 *
	 * Note the event is not always a real event because if it's the navigator labeling the key or you're using the {@link Emulator} class, there isn't a real event.
	 */
	labelFilter?: (
		e: AnyInputEvent | MinimalInputEvent,
		keyId: string,
		label: string,
		keys: Keys
	) => boolean

}

export type EventTypes = "keydown" | "keyup" | "wheel" | "mousedown" | "mouseup" | "mouseenter"

export type EventListenerTypes<T extends EventTypes = EventTypes> = {
	[key in T]: (
		e: key extends "keydown" | "keyup"
		? KeyboardEvent
	: key extends "wheel"
	? WheelEvent
	: MouseEvent
	) => boolean | void
}

