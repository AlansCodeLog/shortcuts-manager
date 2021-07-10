import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { OnlyRequire, Optional } from "./utils"

import type { Command, Condition, Key, KeysSorter, Shortcut } from "@/classes"
import type { KnownError } from "@/helpers"


/**
 * Same as [[ShortcutOptions]] except you're allowed to only pass the keys property.
 */
export type RawShortcut = Pick<Shortcut, "keys"> & {
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
	/** See {@link KeysSorter} */
	sorter: KeysSorter
	/** See {@link Shortcut.enabled} */
	enabled: boolean
}

export type KeysErrors =
	| ERROR.CHORD_W_ONLY_MODIFIERS
	| ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS
	| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
	| ERROR.CHORD_W_DUPLICATE_KEY
	| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE

export type ShortcutHooks = {
	"active": BaseHookType<boolean, never>
	"keys": BaseHookType<Key[][], KnownError<KeysErrors>>
	"command": BaseHookType<Command | undefined, KnownError<ERROR.INVALIDATES_SHORTCUT_CONDITION>>
	"condition": BaseHookType<Condition, KnownError<ERROR.INVALID_SHORTCUT_CONDITION>>
}

export type ShortcutsHook = CollectionHookType<
	OnlyRequire<Shortcut, "keys">,
	Shortcut[],
	KnownError<ERROR.DUPLICATE_SHORTCUT>
>
