import type { BaseHook } from "./hooks"

import type { /* Command, Commands, Condition, */ Key, /* Keys,  */ Plugin } from "@/classes"
import type { KnownError } from "@/helpers"


/**
 * Errors that are not thrown (unless they happen when you instantiate some instance*) and which should be passed to error callbacks.
 * It's not a good idea to allow passing a callback for errors in the constructor since the instance still gets constructed unless you throw.
 * See [[ErrorCallback]] for more info on the callbacks.
 */
export enum ERROR {
	// * - have internal versions
	// ? It's reccomended you prompt the user as to what they want to do with these types of errors.

	// === shortcut init related problems
	CHORD_W_ONLY_MODIFIERS,
	CHORD_W_MULTIPLE_NORMAL_KEYS,
	CHORD_W_MULTIPLE_WHEEL_KEYS,
	CHORD_W_DUPLICATE_KEY,
	IMPOSSIBLE_TOGGLE_SEQUENCE,
	INVALID_KEY_OPTIONS,

	// === shortcut incompatabilities
	INVALID_SHORTCUT_CONDITION, // ?
	INVALIDATES_SHORTCUT_CONDITION, // ?

	// === duplicate "bases"
	DUPLICATE_KEY,
	DUPLICATE_COMMAND,
	DUPLICATE_SHORTCUT,
}

/** Errors that will throw since they should be caught at production. */
export enum TYPE_ERROR {
	CLONER_NOT_SPECIFIED,
	CONFLICTING_PLUGIN_NAMESPACES,
	ILLEGAL_OPERATION,
	LISTENER_DOES_NOT_EXIST,
}


/**
 * Creates the type of error callback function for a specific error.
 * You can see what properties each error contains by looking at each [insert error type]_Info type:
 * [[ERROR_Info]]
 * [[TYPE_ERROR_Info]]
 * [[INTERNAL_ERROR_Info]]
 */
export type ErrorCallback<T extends ERROR | TYPE_ERROR> = (error: KnownError<T>) => void

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
		// 	shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS]: {
		chord: Key[]
		i: number
		// shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS]: {
		chord: Key[]
		i: number
		// 	shortcut: { keys: Key[][] } | Shortcut
		keys: Key[]
	}
	[ERROR.CHORD_W_DUPLICATE_KEY]: {
		chord: Key[]
		i: number
		// shortcut: { keys: Key[][] } | Shortcut
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

	// // === shortcut incompatibilities
	[ERROR.INVALID_SHORTCUT_CONDITION]: {
	// 	condition: Condition
	// 	command: Command
	}
	[ERROR.INVALIDATES_SHORTCUT_CONDITION]: {
	// 	condition: Condition
	// 	command: Command
	}

	// === duplicate "bases"
	[ERROR.DUPLICATE_KEY]: {
	// 	existing: Key
	// 	self: Keys
	}
	[ERROR.DUPLICATE_SHORTCUT]: {
	// 	existing: Shortcut
	// 	self: Shortcuts
	}
	[ERROR.DUPLICATE_COMMAND]: {
	// 	existing: Command
	// 	self: Commands
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
type TYPE_ERROR_Info = {
	[TYPE_ERROR.CLONER_NOT_SPECIFIED]: {
		info: any
	}
	[TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES]: {
		plugins: Plugin<any>[]
		plugin: Plugin<any>
		existing: {
			property: string
			plugin: Plugin<any>
		}
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
	modwheel,
	modtoggle,
	modtogglemouse,
	modtogglewheel,
	// modtogglemousewheel = error
	normal,
	mouse,
	wheel,
	toggle,
	togglemouse,
	togglewheel,
	// togglemousewheel = error
}
/* eslint-enable @typescript-eslint/prefer-enum-initializers */
