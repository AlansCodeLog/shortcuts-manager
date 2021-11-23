import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { OnlyRequire, Optional } from "./utils"

import type { Command, Condition, Key, KeysSorter, Shortcut, Shortcuts } from "@/classes"
import type { KeysStringifier } from "@/classes/KeysStringifier"
import type { KnownError } from "@/helpers"


/**
 * Same as [[ShortcutOptions]] except you're allowed to only pass the keys property.
 */
export type RawShortcut =
Omit<OnlyRequire<Shortcut, "chain">, "opts"> &
{
	opts?: Partial<ShortcutOptions>
}

export type ShortcutOptions = {
	/** The {@link Command} to associate with the shortcut. */
	command?: Optional<Command>
	/**
	 * The {@link Condition} a shortcut is allowed to be triggered on. If both the command and the shortcut have a condition, both must be met.
	 *
	 * If the shortcut is created without a condition, it is assigned a blank condition. If you are using a custom condition class, you should probably always pass a blank condition.
	 */
	condition: Optional<Condition>
	/** Whether the shortcut is enabled. Defaults to true. */
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

export type TriggerableShortcut = Shortcut & { command: Command & { execute: NonNullable<Command["execute"]> } }

export type KeysErrors =
	| ERROR.CHORD_W_ONLY_MODIFIERS
	| ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS
	| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
	| ERROR.CHORD_W_DUPLICATE_KEY
	| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE

export type ShortcutHooks = {
	"active": BaseHookType<Shortcut, boolean, never>
	"chain": BaseHookType<Shortcut, Key[][], KnownError<KeysErrors>>
	"command": BaseHookType<Shortcut, Command | undefined, never>
	"condition": BaseHookType<Shortcut, Condition, never>
}

export type ShortcutsHooks = CollectionHookType<
	Shortcuts,
	[Shortcut],
	[RawShortcut | Shortcut],
	Shortcut[],
	KnownError<ERROR.DUPLICATE_SHORTCUT>,
	KnownError<ERROR.MISSING>
>
