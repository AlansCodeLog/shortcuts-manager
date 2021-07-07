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
	command?: Optional<Command>
	sorter: KeysSorter
	active: boolean
}

export type ShortcutsOptions = {
	// on: {
	// 	before: {
	// 		/** Should throw if the entry should not be allowed to be added. */
	// 		add?: (shortcut: Key[][]) => void
	// 	}
	// }

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
	"command": BaseHookType<Command | false, KnownError<ERROR.INVALIDATES_SHORTCUT_CONDITION>>
	"condition": BaseHookType<Condition, KnownError<ERROR.INVALID_SHORTCUT_CONDITION>>
}

export type ShortcutsHook = CollectionHookType<
	OnlyRequire<Shortcut, "keys">,
	Shortcut[],
	KnownError<ERROR.DUPLICATE_SHORTCUT>
>
