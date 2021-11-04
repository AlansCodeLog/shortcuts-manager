import type { Commands, Keys } from "@/classes"
import { Command, Key, Shortcut } from "@/classes"
import type { Shortcuts } from "@/classes/Shortcuts"
import { defaultCallback, KnownError } from "@/helpers"
import { CollectionHook, CollectionHookType, ERROR, ErrorCallback, Optional } from "@/types"
import { crop, indent, pretty, unreachable } from "@utils/utils"
import { Hookable } from "./Hookable"


export class HookableCollection<
	THook extends CollectionHookType<any, any, any, any>,
	TAddListener extends
		CollectionHook<"add", THook> =
		CollectionHook<"add", THook>,
	TRemoveListener extends
		CollectionHook<"remove", THook> =
		CollectionHook<"remove", THook>,
	TAllowsAddListener extends
		CollectionHook<"allowsAdd", THook> =
		CollectionHook<"allowsAdd", THook>,
	TAllowsRemoveListener extends
		CollectionHook<"allowsRemove", THook> =
		CollectionHook<"allowsRemove", THook>,
	TEntries extends THook["values"] = THook["values"],
	TListeners extends {
		add: TAddListener,
		remove: TRemoveListener,
		allowsAdd: TAllowsAddListener,
		allowsRemove: TAllowsRemoveListener
	} =
	{
		add: TAddListener,
		remove: TRemoveListener,
		allowsAdd: TAllowsAddListener,
		allowsRemove: TAllowsRemoveListener
	}
	> extends Hookable<TListeners> {
	declare _constructor: Hookable<TListeners>["_constructor"]
	entries!: TEntries
	protected _add(_value: THook["value"], _cb: (error: THook["addError"] | Error) => void): void {
		unreachable("Should be implemented by extending class.")
	}
	protected _remove(_value: THook["value"], _cb: (error: THook["removeError"] | Error) => void): void {
		unreachable("Should be implemented by extending class.")
	}
	protected _allows(_type: "add" | "remove", _value: THook["value"]): true | THook["error"] | Error | never {
		return true
	}
	/**
	 * Tells you whether an entry is allowed to be added/removed.
	 *
	 * Can return true or the error that would throw:
	 * ```ts
	 * const allowed = shortcut.allows("add", "keys", [[key.a]])
	 * // Careful to check against true
	 * if (allowed === true) {...} else { const error = allowed }
	 * // Alternatively
	 * if (allowed instanceof Error) {...} else {...}
	 * ```
	 */
	allows(
		type: "add" | "remove" ,
		value: THook["value"],
	): true | THook["error"] | Error | never {
		const self = (this as any)
		for (const listener of this.listeners[("allows" + type.charAt(0).toUpperCase() + type.slice(1)) as keyof TListeners]) {
			const response = (listener as any)(type, value, self.entries)
			if (response !== true) return response
		}
		if (self._allows) return self._allows(type, value)
		return true
	}
	/**
	 * ---
	 * Adds an entry. Note that this will mutate the object passed.
	 *
	 * Also keys added like this can't be autocompleted properly without recasting the instance.
	 *
	 * You can either be really strict and recast on each addition with the provided ExpandRecord utility type:
	 *
	 * ```ts
	 * let keys = new Keys(new Key("a"))
	 * let dict = keys.dict
	 * keys.add(new Key("b"))
	 * dict.a // good (gets autosuggested)
	 * dict.b // error
	 * (dict as ExpandRecord<typeof dict, "b">).b // good (gets autosuggested)
	 * // or
	 * let expanded = (dict as ExpandRecord<typeof dict, "b">)
	 * // now can be used repeatedly
	 * expanded.b //good
	 * ```
	 *
	 * Or if you don't mind that it will no longer error out if you try to access a non-existent key you can do this:
	 * ```ts
	 * let keys = new Keys(new Key("a"))
	 * // by default ExpandRecord will make the type accept any string key
	 * let dict = keys.dict as ExpandRecord<typeof keys.dict>
	 * keys.add(new Key("b"))
	 * dict.a // good (gets autosuggested)
	 * dict.b // good (does not get autosuggested)
	 * dict.c // good (does not get autosuggested) // error in production
	 * ```
	 *
	 * @param cb A callback in case the entry is not allowed to be added. A default callback is provided that will just throw the error.
	 * @param {true} check If true, check if the property is allowed to be set (if it's not, the function will throw).
	 *
	 * If you already checked whether an entry can be added with {@link HookableCollection.allows allows} immediately before calling this function, you should pass `false` to prevent the function from checking again.
	 */
	add(
		value: THook["value"],
		cb: (error: THook["addError"] | Error) => void = defaultCallback,
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows("add", value)
			if (e instanceof Error) {
				cb(e)
				return
			}
		}
		const self = (this as any)
		self._add(value, cb)

		for (const listener of this.listeners.add) {
			listener(value, this.entries)
		}

	}
	protected static _addToDict<
		T extends Command | Key | Shortcut, // needed else we get an error on the callback type
		TSelf extends Commands | Keys | Shortcuts = Commands | Keys | Shortcuts,
		TEntries extends
			Record<string, T> | T[] =
			Record<string, T> | T[],
	>(
		self: TSelf,
		entries: TEntries,
		entry: T,
		/** When entries are stored in a record this will give us the key the entries are keyed by. */
		indexer: Optional<keyof TEntries | ((entry: T) => string)>,
		/** Is the user's error callback passed down to us. */
		cb: ErrorCallbackSubtype<T> = defaultCallback as ErrorCallbackSubtype<T>,
	): void {
		const key = typeof indexer === "function"
			? indexer(entry) as keyof TEntries
			: indexer

		let existing: any | undefined

		if (Array.isArray(entries)) {
			existing = (entries as any[]).find(item =>  entry.equals(item))
		} else {
			existing = (entries as any)[key as string]
		}

		if (existing) {
			const type = entry.constructor.name
			const text = crop`
			${type} ${existing/* .string */} is already registered.
			Existing ${type}:
			${indent(pretty(existing), 3)}
			New ${type}:
			${indent(pretty(entry), 3)}
			`

			const error =
				existing instanceof Key
				? new KnownError(ERROR.DUPLICATE_KEY, text, { existing: (existing as any), self: self as Keys })

				: existing instanceof Command
				? new KnownError(ERROR.DUPLICATE_COMMAND, text, { existing: (existing as any), self: self as Commands })

				: existing instanceof Shortcut
				? new KnownError(ERROR.DUPLICATE_SHORTCUT, text, { existing: (existing as any), self: self as Shortcuts })
				: unreachable()
				// not sure why this thinks cb takes a union of ALL possible types
				// the following cast works but is wrong for use for the function argument

				; (cb as ErrorCallback<ERROR.DUPLICATE_KEY | ERROR.DUPLICATE_COMMAND | ERROR.DUPLICATE_SHORTCUT>)(error)
			}

		if (Array.isArray(entries)) {
			entries.push(entry)
		} else {
			entries[key as string] = entry
		}
	}
	/**
	 * ---
	 * Removes an entry.
	 */
	remove(
		value: THook["value"],
		cb: (error: THook["removeError"] | Error) => void = defaultCallback,
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows("remove", value)
			if (e instanceof Error) {
				cb(e)
				return
			}
		}
		const self = (this as any)
		self._remove(value, cb)

		for (const listener of this.listeners.remove) {
			listener(value, this.entries)
		}

	}
	protected static _removeFromDict<
		T extends Command | Key | Shortcut, // needed else we get an error on the callback type
		TSelf extends Commands | Keys | Shortcuts = Commands | Keys | Shortcuts,
		TEntries extends
		Record<string, T> | T[] =
		Record<string, T> | T[],
	>(
			self: TSelf,
			entries: TEntries,
			entry: T,
			/** When entries are stored in a record this will give us the key the entries are keyed by. */
			indexer: Optional<keyof TEntries | ((entry: T) => string)>,
			/** Is the user's error callback passed down to us. */
			cb: ErrorCallback<ERROR.MISSING>,
	): void {
		const key = typeof indexer === "function"
			? indexer(entry) as keyof TEntries
			: indexer

		let index: number | string

		if (Array.isArray(entries)) {
			index = (entries as any[]).findIndex(item => entry.equals(item))

		} else {
			index = key as string
		}

		if (index !== undefined) {
			if (Array.isArray(entries)) {
				entries.splice(index as number, 1)
			} else {
				entries[key as string] = undefined as any
			}
		} else {
			const type = entry.constructor.name
			const text = crop`
			Entry ${type} ${index/* .string */} does not exist in this collection.

			Entry:
			${indent(pretty(entry), 3)}
			`

			const error = new KnownError(ERROR.MISSING, text, { entry: (index as any), collection: self as Shortcuts })

			; cb(error)
		}
	}
}

type ErrorCallbackSubtype<T> =
	T extends Key
	? ErrorCallback<ERROR.DUPLICATE_KEY>

	: T extends Command
	? ErrorCallback<ERROR.DUPLICATE_COMMAND>

	: T extends Shortcut
	? ErrorCallback<ERROR.DUPLICATE_SHORTCUT>
	: never
