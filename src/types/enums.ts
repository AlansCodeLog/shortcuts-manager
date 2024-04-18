import type { AnyInputEvent, Command, Commands, Key, Keys, Shortcut, Shortcuts } from "./index.js"

import type { KnownError } from "../helpers/index.js"


/**
 * All possible errors.
 */
export enum ERROR {
	// === shortcut init related problems
	CHORD_W_ONLY_MODIFIERS = "CHORD_W_ONLY_MODIFIERS",
	CHORD_W_MULTIPLE_TRIGGER_KEYS = "CHORD_W_MULTIPLE_TRIGGER_KEYS",
	CHORD_W_MULTIPLE_WHEEL_KEYS = "CHORD_W_MULTIPLE_WHEEL_KEYS",
	CHORD_W_DUPLICATE_KEY = "CHORD_W_DUPLICATE_KEY",
	IMPOSSIBLE_TOGGLE_SEQUENCE = "IMPOSSIBLE_TOGGLE_SEQUENCE",
	MISSING = "MISSING", // removing
	INVALID_VARIANT = "VARIANT_EXISTS_AS_KEY",
	INVALID_VARIANT_PAIR = "INVALID_VARIANT_PAIR",

	// === duplicate "bases"
	DUPLICATE_KEY = "DUPLICATE_KEY",
	DUPLICATE_COMMAND = "DUPLICATE_COMMAND",
	DUPLICATE_SHORTCUT = "DUPLICATE_SHORTCUT",

	// === other
	INVALID_SWAP_CHORDS = "INCORRECT_SWAP_PARAMS",
	CANNOT_SET_WHILE_DISABLED = "CANNOT_SET_WHILE_DISABLED",

	// === manager
	MULTIPLE_MATCHING_SHORTCUTS = "MULTIPLE_MATCHING_SHORTCUTS",
	INCORRECT_TOGGLE_STATE = "INCORRECT_TOGGLE_STATE",
	NO_MATCHING_SHORTCUT = "NO_MATCHING_SHORTCUT",
	UNKNOWN_KEY = "UNKNOWN_KEYS",
	UNKNOWN_COMMAND = "UNKNOWN_COMMANDS",
	KEY_IN_USE = "KEYS_IN_USE",
	COMMAND_IN_USE = "COMMANDS_IN_USE",
	UNKNOWN_KEY_EVENT = "UNKNOWN_KEY_EVENT",
	// for when we must return multiple custom errors
	MULTIPLE_ERRORS = "MULTIPLE_ERRORS",
}

export type ChainErrors =
| ERROR.UNKNOWN_KEY
| ERROR.CHORD_W_DUPLICATE_KEY
| ERROR.CHORD_W_ONLY_MODIFIERS
| ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS
| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE

/** Errors that will throw since they should be caught at production. */
export enum TYPE_ERROR {
	ILLEGAL_OPERATION = "ILLEGAL_OPERATION",
	HOOK_OR_LISTENER_DOES_NOT_EXIST = "HOOK_OR_LISTENER_DOES_NOT_EXIST",
	FILTER_DOES_NOT_EXIST = "FILTER_DOES_NOT_EXIST",
}

/**
 * Defines the properties attached to each error.
 *
 * Makes it easy to define the properties attached to each error by just allowing passing the error (regardless of error type) as T in [[KnownError]] and [[InternalError]].
 */

export type ErrorInfo<T extends ERROR | TYPE_ERROR> =
	T extends ERROR
	? ERROR_Info[T]
	: never

/** Type multiple {@link KnownError} errors to work like a discriminated union. */
export type MultipleErrors<T extends ERROR | TYPE_ERROR> = {
	[k in T]: KnownError<k>
}[T]

// note all these error types could be kept in the same type, but then we'd have to make all the keys unique and we can't because internal errors should use the same key

// eslint-disable-next-line @typescript-eslint/naming-convention
type ERROR_Info = {
	// === shortcut init related problems
	[ERROR.CHORD_W_ONLY_MODIFIERS]: {
		chord: string[]
		i: number
		keys: string[]
	}
	[ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS]: {
		chord: string[]
		i: number
		keys: string[]
	}
	[ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS]: {
		chord: string[]
		i: number
		keys: string[]
	}
	[ERROR.CHORD_W_DUPLICATE_KEY]: {
		chord: string[]
		i: number
		keys: string[]
	}
	[ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE]: {
		chain: string[][]
		i: number
		key: Key
	}
	[ERROR.MISSING]: {
		entry: Key | Shortcut | Command | string
		self: Keys | Shortcuts | Commands
	}
	[ERROR.INVALID_VARIANT]: {
		variants: string[]
		id: string
	}
	[ERROR.INVALID_VARIANT_PAIR]: {
		variants: Key[]
		key: Key
		otherKey: Key
	}
	
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
	

	// === other
	[ERROR.INVALID_SWAP_CHORDS]:
	{
		chord: string[][]
	} |
	{
		chordsA: string[][]
		chordsB: string[][]
	}

	[ERROR.CANNOT_SET_WHILE_DISABLED]:
	{
		key: Key
	}

	// === manager
	[ERROR.MULTIPLE_MATCHING_SHORTCUTS]: {
		shortcuts: Shortcut[]
	}
	[ERROR.INCORRECT_TOGGLE_STATE]: {
		key: Key
	}
	[ERROR.NO_MATCHING_SHORTCUT]: {
		chain: string[][]
	}
	[ERROR.UNKNOWN_KEY]: {
		shortcut?: Pick<Shortcut, "chain">
		keys: string[] | Keys
	}
	[ERROR.UNKNOWN_COMMAND]: {
		shortcut?: Pick<Shortcut, "chain" | "command">
		command: string
		commands: string[] | Commands
	}
	[ERROR.MULTIPLE_ERRORS]: {
		errors: Error[]
	}
	[ERROR.KEY_IN_USE]: {
		inUseShortcuts: Shortcut[]
	}
	[ERROR.COMMAND_IN_USE]: {
		inUseShortcuts: Shortcut[]
	}
	[ERROR.UNKNOWN_KEY_EVENT]: {
		e: AnyInputEvent
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
