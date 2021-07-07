import { crop, indent, pretty, unreachable } from "@utils/utils"

import { Hookable } from "./Hookable"

import type { Commands, Keys } from "@/classes"
import { Command, Key, Shortcut } from "@/classes"
import type { Shortcuts } from "@/classes/Shortcuts"
import { defaultCallback, KnownError } from "@/helpers"
import { CollectionHook, CollectionHookType, ERROR, ErrorCallback, Optional } from "@/types"


export class HookableCollection<
	THook extends CollectionHookType<any, any, any>,
	TAllowsListener extends
		CollectionHook<"allows", THook> =
		CollectionHook<"allows", THook>,
	TAddListener extends
		CollectionHook<"add", THook> =
		CollectionHook<"add", THook>,
	TEntries extends THook["values"] = THook["values"],
> extends Hookable<{ allows: TAllowsListener, add: TAddListener }> {
	entries!: TEntries
	#add!: (value: THook["value"], cb: ErrorCallback<any>) => void // needs to be implemented by class extending
	/**
	 * Tells you whether an entry is allowed to be added.
	 * Can return true or the error that would throw so check it against `true` (because errors are objects and objects are truthy):
	 * ```ts
	 * let allowed = shortcuts.allows(shortcut)
	 * if (allowed === true) {
	 * 	// true
	 * } else {
	 * 	let error = allowed
	 * }
	 * ```
	 */
	allows(
		value: THook["value"],
	): true | THook["error"] | Error | never {
		const self = (this as any)
		for (const listener of this.listeners.allows) {
			const response = listener(value, self.entries)
			if (response !== true) return response
		}
		return true
	}
	/**
	 * Adds an entry. Note that this will mutate the object passed.
	 * Also keys added like this can't be autocomplete properly without recasting the instance.
	 * You can either be really strict and recast on each addition with the provided ExpandRecord utility type:
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
	 * Or if you don't mind that it will no longer error out if you try to access a non-existant key you can do this:
	 * ```ts
	 * let keys = new Keys(new Key("a"))
	 * // by default ExpandRecord will make the type accept any string key
	 * let dict = keys.dict as ExpandRecord<typeof keys.dict>
	 * keys.add(new Key("b"))
	 * dict.a // good (gets autosuggested)
	 * dict.b // good (does not get autosuggested)
	 * dict.c // good (does not get autosuggested) // error in production
	 * ```
	 * TODO in the future asserts might make this easier (they don't yet)
	 */
	add(
		value: THook["value"],
		cb: (error: THook["error"] | Error) => void = defaultCallback,
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows(value)

			if (e instanceof Error) {
				cb(e)
			}
		}
		const self = (this as any)
		for (const listener of this.listeners.add) {
			listener(value, this.entries, cb as (e: Error) => void)
		}

		if (self.#add === undefined) {
			throw new Error(`You forgot to implement #add for "${self.constructor.name}".`)
		}
		self.#add(value, cb)
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
		cb: ErrorCallbackSubtype<T>,
	): void {
		const key = typeof indexer === "function"
			? indexer(entry) as keyof TEntries
			: indexer

		let existing: any | undefined

		if (Array.isArray(entries)) {
			existing = (entries as any[]).find(item => {
				entry.equals(item)
			})
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
				existing instanceof Key // todo
				? new KnownError(ERROR.DUPLICATE_KEY, text, { existing: (existing as any), self: self as Keys })

				: existing instanceof Command // todo
				? new KnownError(ERROR.DUPLICATE_COMMAND, text, { existing: (existing as any), self: self as Commands })

				: existing instanceof Shortcut // todo
				? new KnownError(ERROR.DUPLICATE_SHORTCUT, text, { existing: (existing as any), self: self as Shortcuts })
				: unreachable()
				// not sure why this thinks cb takes a union of ALL possible types
				// the following cast works but is wrong for use for the function argument

				; (cb as ErrorCallback<ERROR.DUPLICATE_KEY | ERROR.DUPLICATE_COMMAND | ERROR.DUPLICATE_SHORTCUT>)(error)
		}

		if (Array.isArray(entries)) {
			(entries).push(entry)
		} else {
			(entries as any)[key as string] = entry
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
