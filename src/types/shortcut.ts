import type { RawCondition } from "./condition"
import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { Optional } from "./utils"

import type { Command, Condition, Key, KeysSorter, Shortcut, Shortcuts } from "@/classes"
import type { KeysStringifier } from "@/classes/KeysStringifier"
import type { KnownError } from "@/helpers"


/**
 * Same as [[ShortcutOptions]] except you're allowed to only pass the keys property.
 */
export type RawShortcut = {
	chain: Shortcut["chain"]
	opts?: Partial<ShortcutOptions>
}

export type ExportedShortcut =
	Pick<Shortcut, "chain">
	& Omit<ShortcutOptions, "stringifier" | "sorter">
	& {
		condition: RawCondition
		command: string
	}

export type ShortcutOptions = {
	/**
	 * The {@link Command} to associate with the shortcut.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	command?: Optional<Command>
	/**
	 * The {@link Condition} a shortcut is allowed to be triggered on. If both the command and the shortcut have a condition, both must be met.
	 *
	 * If the shortcut is created without a condition, it is assigned a blank condition. If you are using a custom condition class, you should probably always pass a blank condition.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	condition: Optional<Condition>
	/**
	 * Whether the shortcut is enabled. Defaults to true.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
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

export type TriggerableShortcut = Shortcut & { command: Command & { execute: Command["execute"] } }

export type KeysErrors =
	| ERROR.CHORD_W_ONLY_MODIFIERS
	| ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS
	| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
	| ERROR.CHORD_W_DUPLICATE_KEY
	| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE

export type ShortcutHooks = {
	"enabled": BaseHookType<Shortcut, boolean, never>
	"chain": BaseHookType<Shortcut, Key[][], KnownError<KeysErrors>>
	"command": BaseHookType<Shortcut, Command | undefined, never>
	"condition": BaseHookType<Shortcut, Condition, never>
}

export type ShortcutsHooks = CollectionHookType<
	Shortcuts,
	Shortcut,
	RawShortcut | Shortcut,
	Shortcut[],
	KnownError<ERROR.DUPLICATE_SHORTCUT>,
	KnownError<ERROR.MISSING>
>
