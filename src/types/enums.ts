import type { Command, Commands, Key, Keys, Shortcut, Shortcuts } from "classes/index.js"
import type { Manager } from "classes/Manager.js"
import type { KnownError } from "helpers/index.js"

import type { BaseHook } from "./hooks.js"
import type { ManagerListener } from "./index.js"
import type { AnyInputEvent } from "./manager.js"


/**
 * All possible errors.
 *
 * Normally thrown errors can be avoided by checking if an instance allows setting/adding something, but there is one instance they might still be thrown, when instantiating an instance. And we can't allow callbacks to be passed for errors in constructors since the instance still gets constructed unless an error is thrown.
 *
 */
export enum ERROR {
	// === shortcut init related problems
	CHORD_W_ONLY_MODIFIERS = "CHORD_W_ONLY_MODIFIERS",
	CHORD_W_MULTIPLE_NORMAL_KEYS = "CHORD_W_MULTIPLE_NORMAL_KEYS",
	CHORD_W_MULTIPLE_WHEEL_KEYS = "CHORD_W_MULTIPLE_WHEEL_KEYS",
	CHORD_W_DUPLICATE_KEY = "CHORD_W_DUPLICATE_KEY",
	IMPOSSIBLE_TOGGLE_SEQUENCE = "IMPOSSIBLE_TOGGLE_SEQUENCE",
	INVALID_KEY_OPTIONS = "INVALID_KEY_OPTIONS",
	MISSING = "MISSING", // removing
	INVALID_VARIANT = "VARIANT_EXISTS_AS_KEY",

	// === duplicate "bases"
	DUPLICATE_KEY = "DUPLICATE_KEY",
	DUPLICATE_COMMAND = "DUPLICATE_COMMAND",
	DUPLICATE_SHORTCUT = "DUPLICATE_SHORTCUT",
	KEYS_CANNOT_ADD_TOGGLE = "KEYS_CANNOT_ADD_TOGGLE",

	// === other
	INVALID_SWAP_CHORDS = "INCORRECT_SWAP_PARAMS",

	// === manager
	MULTIPLE_MATCHING_SHORTCUTS = "MULTIPLE_MATCHING_SHORTCUTS",
	INCORRECT_TOGGLE_STATE = "INCORRECT_TOGGLE_STATE",
	NO_MATCHING_SHORTCUT = "NO_MATCHING_SHORTCUT",
	UNKNOWN_KEYS_IN_SHORTCUTS = "UNKNOWN_KEYS_IN_SHORTCUTS",
	UNKNOWN_COMMANDS_IN_SHORTCUTS = "UNKNOWN_COMMANDS_IN_SHORTCUTS",
	UNKNOWN_KEYS_IN_SHORTCUT = "UNKNOWN_KEYS_IN_SHORTCUT",
	UNKNOWN_COMMAND_IN_SHORTCUT = "UNKNOWN_COMMANDS_IN_SHORTCUT",
	KEY_IN_USE = "KEYS_IN_USE",
	COMMAND_IN_USE = "COMMANDS_IN_USE",
	UNKNOWN_KEY_EVENT = "UNKNOWN_KEY_EVENT",
	// internal
	RECORDING = "RECORDING",
	IMPORT_COMMAND = "IMPORT_KEY",
	IMPORT_SHORTCUT_COMMAND = "IMPORT_SHORTCUT_COMMAND",
	IMPORT_SHORTCUT_KEY = "IMPORT_SHORTCUT_KEY",
}

export type ChainErrors =
	| ERROR.CHORD_W_DUPLICATE_KEY
	| ERROR.CHORD_W_ONLY_MODIFIERS
	| ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS
	| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
	| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE

/** Errors that will throw since they should be caught at production. */
export enum TYPE_ERROR {
	ILLEGAL_OPERATION = "ILLEGAL_OPERATION",
	HOOK_OR_LISTENER_DOES_NOT_EXIST = "HOOK_OR_LISTENER_DOES_NOT_EXIST",
	FILTER_DOES_NOT_EXIST = "FILTER_DOES_NOT_EXIST",
}

/** Note the input event can be undefined if you set the manager chain directly since it will check if it should trigger shortcuts. */
export type ManagerErrorCallback<T extends ERROR > = (error: KnownError<T>, manager: Manager, e?: AnyInputEvent) => void

/**
 * Defines the properties attached to each error.
 *
 * Makes it easy to define the properties attached to each error by just allowing passing the error (regardless of error type) as T in [[KnownError]] and [[InternalError]].
 *
 * Note that errors that return union types only return one or the other depending on a single condition, whether the instance is initiated at the time it was thrown.
 * For example, if you create an invalid shortcut it might throw with [[ERROR_Info.CHORD_W_ONLY_MODIFIERS]] and it's `shortcut` property will be of type `{keys: Key[][]}` because the instance won't be available.
 *
 * On the other hand, if you instantiate a shortcut then set it's `keys` property, the error will throw with the full shortcut instance on the `shortcut` property.
 */

export type ErrorInfo<T extends ERROR | TYPE_ERROR> =
	T extends ERROR
	? ERROR_Info[T]

	: T extends TYPE_ERROR
	? TYPE_ERROR_Info[T]
	: never

// note all these error types could be kept in the same type, but then we'd have to make all the keys unique and we can't because internal errors should use the same key

// eslint-disable-next-line @typescript-eslint/naming-convention
type ERROR_Info = {
	// === shortcut init related problems
	[ERROR.CHORD_W_ONLY_MODIFIERS]: {
		self: Shortcut | Manager | undefined
		chord: Key[]
		i: number
		keys: Key[]
	}
	[ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS]: {
		self: Shortcut | Manager | undefined
		chord: Key[]
		i: number
		keys: Key[]
	}
	[ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS]: {
		self: Shortcut | Manager | undefined
		chord: Key[]
		i: number
		keys: Key[]
	}
	[ERROR.CHORD_W_DUPLICATE_KEY]: {
		self: Shortcut | Manager | undefined
		chord: Key[]
		i: number
		keys: Key[]
	}
	[ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE]: {
		self: Shortcut | Manager | undefined
		chain: Key[][]
		i: number
		key: Key
	}
	[ERROR.INVALID_KEY_OPTIONS]: {
		self: Key
	}
	[ERROR.MISSING]: {
		entry: Key | Shortcut | Command | string
		collection: Keys | Shortcuts | Commands
	}
	[ERROR.INVALID_VARIANT]: {
		variants: string[]
		id: string
	}

	// === duplicate "bases"
	[ERROR.DUPLICATE_KEY]: {
		existing: Key
		self: Keys
	}
	[ERROR.DUPLICATE_SHORTCUT]: {
		existing: Shortcut
		self: Shortcuts
		/** If the error is caused by a change, key and value will contain the new key and value. */
		key?: string
		value?: any
	}
	[ERROR.DUPLICATE_COMMAND]: {
		existing: Command
		self: Commands
	}
	[ERROR.KEYS_CANNOT_ADD_TOGGLE]: {
		entry: Key
	}

	// === other
	[ERROR.INVALID_SWAP_CHORDS]:
	{
		chord: Key[][]
	} |
	{
		chordsA: Key[][]
		chordsB: Key[][]
	}

	// === manager
	[ERROR.MULTIPLE_MATCHING_SHORTCUTS]: {
		shortcuts: Shortcut[]
	}
	[ERROR.INCORRECT_TOGGLE_STATE]: {
		key: Key
	}
	[ERROR.NO_MATCHING_SHORTCUT]: {
		chain: Key[][]
	}
	[ERROR.UNKNOWN_KEYS_IN_SHORTCUTS]: {
		entries: { shortcut: Shortcut | Pick<Shortcut, "chain" | "command">, keys: Key[] }[]
	}
	[ERROR.UNKNOWN_KEYS_IN_SHORTCUT]: {
		shortcut: Shortcut
		keys: Key[]
	}
	[ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS]: {
		entries: { shortcut: Shortcut | Pick<Shortcut, "chain" | "command">, command: Command }[]
	}
	[ERROR.UNKNOWN_COMMAND_IN_SHORTCUT]: {
		shortcut: Shortcut
		command: Command
	}
	[ERROR.KEY_IN_USE]: {
		entries: Shortcut[]
	}
	[ERROR.COMMAND_IN_USE]: {
		entries: Shortcut[]
	}
	[ERROR.UNKNOWN_KEY_EVENT]: {
		e: KeyboardEvent
	}
	[ERROR.IMPORT_COMMAND]: { command: ReturnType<Command["export"]>, commands: Commands }
	[ERROR.IMPORT_SHORTCUT_COMMAND]: {
		command: string
		shortcut: ReturnType<Shortcut["export"]>
	}
	[ERROR.IMPORT_SHORTCUT_KEY]: { id: string, shortcut: ReturnType<Shortcut["export"]> }
	// internal
	[ERROR.RECORDING]: undefined
}

// eslint-disable-next-line @typescript-eslint/naming-convention
type TYPE_ERROR_Info = {
	[TYPE_ERROR.ILLEGAL_OPERATION]: undefined
	[TYPE_ERROR.HOOK_OR_LISTENER_DOES_NOT_EXIST]: {
		hook: BaseHook<any, any>
		hooks: BaseHook<any, any>[]
	} | {
		listener: ManagerListener
		listeners: ManagerListener[]
	}
	[TYPE_ERROR.FILTER_DOES_NOT_EXIST]: {
		filter: ManagerListener
		filters: ManagerListener[]
	}
}

export enum MOUSE {
	R = "R",
	M = "M",
	L = "L",
	BACK = "Back",
	FORWARD = "Forward",
}

export enum WHEEL {
	DOWN = "down",
	UP = "up",
}

/* eslint-disable @typescript-eslint/prefer-enum-initializers */
// These do not need to be initialized, we want the order they're declared in.
export enum KEY_SORT_POS {
	mod,
	modmouse,
	// modmousewheel = error
	modwheel, // weird...
	modtoggle, // weird...
	modtogglemouse, // weird...
	modtogglewheel, // weird...
	// modtogglemousewheel = error
	normal,
	mouse,
	wheel,
	toggle,
	togglemouse,
	togglewheel, // weird...
	// modtogglemousewheel = error
}
/* eslint-enable @typescript-eslint/prefer-enum-initializers */
