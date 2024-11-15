import type { Command } from "./commands.js"
import type { Condition } from "./condition.js"
import type { Manager } from "./index.js"
import type { Key } from "./keys.js"
import type { Shortcut } from "./shortcuts.js"


// eslint-disable-next-line @typescript-eslint/naming-convention
export type NavigatorWKeyboard = {
	keyboard?: {
		/**
			* {@link https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/getLayoutMap getLayoutMap}
			*/
		getLayoutMap(): Promise<KeyboardLayoutMap>
	}
}
export type KeyCode = string
export type KeyLabel = string
export type KeyboardLayoutMap = Map<KeyCode, KeyLabel>
export type AttachTarget = {
	addEventListener: HTMLElement["addEventListener"]
	removeEventListener: HTMLElement["removeEventListener"]
}

export type DefaultStringifierOptions = {
	/**
	 * The key parameter will be undefined for unknown keys.
	 * Also careful with toggle keys, you will need to check which toggle it is by checking against the toggle ids.
	 */
	key?: (id: string, key?: Key) => string
	chord?: (key: readonly string[]) => string
	chain?: (key: readonly string[]) => string
	shortcut?: (shortcut: Shortcut) => string
	command?: (command?: Command) => string
	condition?: (condition?: Condition) => string
	propertyValue?: (propertyValue?: any) => string
	list?: (items: string[], type: "keys" | "commands" | "shortcuts") => string
}

export type StringifyCommandList = { type: "command", list: string[] }
export type StringifyKeyList = { type: "key", list: string[] }
// eslint-disable-next-line @typescript-eslint/naming-convention
export type IStringifier = {
	stringify(
		entry: Shortcut,
		manager: Pick<Manager, "keys" | "commands">
	): string
	/**
	 * Stringifies single keys in string or {@link Key} from, as well as chords, chains, full shortcuts, and commands.
	 *
	 * In the case of string key ids and Shortcuts, some additional information is required to be able to convert the keys and commands back into the full commands and consistently stringify them.
	 *
	 */
	stringify(
		entry: string | string[] | string[][],
		manager: Pick<Manager, "keys">
	): string


	stringify(
		entry: Key | Key[] | Command | Condition,
	): string

	stringify(
		entry: string | string[] | string[][] | Key | Key[] | Shortcut | Command | Condition,
		manager: Pick<Manager, "keys" | "commands"> | Pick<Manager, "keys"> | never

	): string
	/** Stringifies the property values of items when there is an error (e.g. "You cannot change prop x from a to b because of y." a and b here being the property values). */
	stringifyPropertyValue(entry: any): string
	/**
	 * Stringifies lists of keys, shortcuts, or commands.
	 *
	 * The type must be specified because we can't magically tell what type something is for string lists and/or empty lists.
	 */
	stringifyList(type: "keys", entries: Key[]): string
	stringifyList(type: "commands", entries: Command[]): string
	stringifyList(type: "keys", entries: string[], manager: Pick<Manager, "keys">): string
	stringifyList(type: "commands", entries: string[], manager: Pick<Manager, "commands">): string
	stringifyList(type: "shortcuts", entries: Shortcut[], manager: Pick<Manager, "keys" | "commands">): string
	/**
		* Stringifies commands by name (`stringify` interprets single strings as key ids.).
		*/
	stringifyCommand(name: string | undefined, manager: Pick<Manager, "commands">): string
}


export type PickManager<
	TType extends "options" | "state" | "hooks",
	TKeys extends keyof TManager[TType],
	TManager extends Manager = Manager,
> =
	Record<TType, Pick<TManager[TType], TKeys>>
	
export type PickManagerHooks<T extends Manager["hooks"]> = {
	hooks?: T
}

export type ShortcutInfo = {
	shortcut: Shortcut
	isPressableChain: boolean
	isPressable: boolean
	isPressed: boolean
	/** If a shortcut contains unpressed modifiers, it will not be considered pressable or a pressable chain, but you will likely want to show a hint on the modifier anyways. */
	hasUnpressedModifiers: boolean
}

export type KeyInfo = {
	/** All shortcuts that contain this key and are either pressable, pressable chains, or pressed. */
	pressableEntries: ShortcutInfo[]
	/** All shortcuts that contain this key and are not pressable but have unpressed modifiers (see {@link ShortcutInfo.hasUnpressedModifiers}).*/
	modifierEntries: ShortcutInfo[]
	/** Depending on the shortcut's list passed, or how conditions and contexts are implemented, it's possible for their to be conflicting shortcuts in certain contexts.*/
	containsConflicting: boolean
	/** Indicates there are shortcuts in the modifierEntries, i.e. there are shortcuts that have unpressedModifiers (see {@link ShortcutInfo.hasUnpressedModifiers}). You will usually want to have some visual hint the modifier key can be pressed to show more shortcuts. */
	isModifierHint: boolean
}
