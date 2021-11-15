import type { BaseHook } from "./hooks"
import type { AnyInputEvent } from "./manager"

import type { Command, Commands, Key, Keys, Plugin, Shortcut, Shortcuts } from "@/classes"
import type { Manager } from "@/classes/Manager"
import type { KnownError } from "@/helpers"


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
	CONFLICTING_ENTRY_PLUGINS = "CONFLICTING_ENTRY_PLUGINS",
	MISSING = "MISSING", // removing

	// === duplicate "bases"
	DUPLICATE_KEY = "DUPLICATE_KEY",
	DUPLICATE_COMMAND = "DUPLICATE_COMMAND",
	DUPLICATE_SHORTCUT = "DUPLICATE_SHORTCUT",

	// === other
	INVALID_SWAP_CHORDS = "INCORRECT_SWAP_PARAMS",
	MULTIPLE_MATCHING_SHORTCUTS = "MULTIPLE_MATCHING_SHORTCUTS",
	INCORRECT_TOGGLE_STATE = "INCORRECT_TOGGLE_STATE",
	INVALID_VARIANT = "VARIANT_EXISTS_AS_KEY",
	NO_MATCHING_SHORTCUT = "NO_MATCHING_SHORTCUT",
	UNKNOWN_KEYS = "UNKNOWN_KEYS",
	UNKNOWN_COMMANDS = "UNKNOWN_COMMANDS",
}

/** Errors that will throw since they should be caught at production. */
export enum TYPE_ERROR {
	CLONER_NOT_SPECIFIED = "CLONER_NOT_SPECIFIED",
	CONFLICTING_PLUGIN_NAMESPACES = "CONFLICTING_PLUGIN_NAMESPACES",
	ILLEGAL_OPERATION = "ILLEGAL_OPERATION",
	LISTENER_DOES_NOT_EXIST = "LISTENER_DOES_NOT_EXIST",
}


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
		chord: Key[]
		i: number
		shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS]: {
		chord: Key[]
		i: number
		shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS]: {
		chord: Key[]
		i: number
		shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.CHORD_W_DUPLICATE_KEY]: {
		chord: Key[]
		i: number
		shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE]: {
		shortcut: Key[][]
		i: number
		key: Key
	}
	[ERROR.INVALID_KEY_OPTIONS]: {
		self: Key
	}
	[ERROR.CONFLICTING_ENTRY_PLUGINS]: {
		entry: Key | Shortcut | Command
		collection: Keys | Shortcuts | Commands
	}
	[ERROR.MISSING]: {
		entry: Key | Shortcut | Command
		collection: Keys | Shortcuts | Commands
	}

	// === duplicate "bases"
	[ERROR.DUPLICATE_KEY]: {
		existing: Key
		self: Keys
	}
	[ERROR.DUPLICATE_SHORTCUT]: {
		existing: Shortcut
		self: Shortcuts
	}
	[ERROR.DUPLICATE_COMMAND]: {
		existing: Command
		self: Commands
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
	[ERROR.MULTIPLE_MATCHING_SHORTCUTS]: {
		shortcuts: Shortcut[]
	}
	[ERROR.INCORRECT_TOGGLE_STATE]: {
		key: Key
	}
	[ERROR.INVALID_VARIANT]: {
		variants: string[]
		id: string
	}
	[ERROR.NO_MATCHING_SHORTCUT]: {
		chain: Key[][]
	}
	[ERROR.UNKNOWN_KEYS]: {
		entries: [Shortcut, Key[]][]
	}
	[ERROR.UNKNOWN_COMMANDS]: {
		entries: [Shortcut, Command][]
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
type TYPE_ERROR_Info = {
	[TYPE_ERROR.CLONER_NOT_SPECIFIED]: {
		info: any
	}
	[TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES]: {
		plugins: Plugin<any, any>[]
		plugin: Plugin<any, any>
		existing: Plugin<any, any>
	}
	[TYPE_ERROR.ILLEGAL_OPERATION]: undefined
	[TYPE_ERROR.LISTENER_DOES_NOT_EXIST]: {
		listener: BaseHook<any, any>[]
		listeners: BaseHook<any, any>[]
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
