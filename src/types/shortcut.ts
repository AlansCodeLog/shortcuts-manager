import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { OnlyRequire, Optional } from "./utils"

import type { Command, Condition, Key, KeysSorter, Shortcut } from "@/classes"
import type { KeysStringifier } from "@/classes/KeysStringifier"
import type { KnownError } from "@/helpers"


/**
 * Same as [[ShortcutOptions]] except you're allowed to only pass the keys property.
 */
export type RawShortcut =
Omit<OnlyRequire<Shortcut, "keys">, "opts"> &
{
	opts?: Partial<ShortcutOptions>
}

export type ShortcutOptions = {
	/** See {@link Shortcut.command} */
	command?: Optional<Command>
	/**
	 * See {@link Shortcut.condition}
	 *
	 * If the shortcut is created without a condition, it is assigned a blank condition. If you are using plugins on your conditions you should pass a blank condition made with your plugins.
	 */
	condition: Optional<Condition>
	/** See {@link Shortcut.enabled} */
	enabled: boolean
	/** See {@link KeysSorter} */
	sorter: KeysSorter
	/** See {@link KeysStringifier} */
	stringifier: KeysStringifier
}

export type ShortcutsOptions = {
	/** See {@link KeysSorter} */
	sorter: KeysSorter
	/** See {@link KeysStringifier} */
	stringifier: KeysStringifier
}

export type KeysErrors =
	| ERROR.CHORD_W_ONLY_MODIFIERS
	| ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS
	| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
	| ERROR.CHORD_W_DUPLICATE_KEY
	| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE

export type ShortcutHooks = {
	"active": BaseHookType<Shortcut, boolean, never>
	"keys": BaseHookType<Shortcut, Key[][], KnownError<KeysErrors>>
	"command": BaseHookType<Shortcut, Command | undefined, never>
	"condition": BaseHookType<Shortcut, Condition, never>
}

export type ShortcutsHook = CollectionHookType<
	Shortcut,
	RawShortcut | Shortcut,
	Shortcut[],
	KnownError<ERROR.DUPLICATE_SHORTCUT | ERROR.CONFLICTING_ENTRY_PLUGINS>,
	KnownError<ERROR.MISSING>
>
