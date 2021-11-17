import { Err, Ok, Result } from "@alanscodelog/utils"
import { crop, indent, pretty, unreachable } from "@utils/utils"

import { Hookable } from "./Hookable"

import { Command, Commands, Key, Keys, Shortcut } from "@/classes"
import type { Shortcuts } from "@/classes/Shortcuts"
import { KnownError } from "@/helpers"
import { CollectionHook, CollectionHookType, ERROR, Optional } from "@/types"


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
		add: TAddListener
		remove: TRemoveListener
		allowsAdd: TAllowsAddListener
		allowsRemove: TAllowsRemoveListener
	} =
	{
		add: TAddListener
		remove: TRemoveListener
		allowsAdd: TAllowsAddListener
		allowsRemove: TAllowsRemoveListener
	},
> extends Hookable<TListeners> {
	declare _constructor: Hookable<TListeners>["_constructor"]
	entries!: TEntries
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _add(_value: THook["allowValue"]): void {
		unreachable("Should be implemented by extending class.")
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _remove(_value: THook["allowValue"]): void {
		unreachable("Should be implemented by extending class.")
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _allows(type: "add" | "remove", value: THook["allowValue"]): Result<true, THook["error"] | Error> {
		const func = this instanceof Commands
			? (t: Command) => t.name
			: this instanceof Keys
			? (t: Key) => t.id
			: undefined

		switch (type) {
			case "add":
				return HookableCollection._canAddToDict<any>(this as any, this.entries, value, func)
			case "remove":
				return HookableCollection._canRemoveFromDict<any>(this as any, this.entries, value, func)
		}
	}
	/**
	 * Tells you whether an entry is allowed to be added/removed.
	 *
	 * Returns a result monad. See {@link Result} from my utils lib.
	 *
	 * ```ts
	 * const entry = new Shortcut([[ctrl, a]])
	 * const res = shortcuts.allows("add", entry)
	 * if (res.isOk) {
	 * 	shortcuts.add(entry)
	 * } else { // res.isError
	 * 	console.log(res.error.message)
	 * }
	 * ```
	 */
	allows(
		type: "add" | "remove",
		value: THook["allowValue"],
	): Result<true, THook["error"] | Error> {
		const self = (this as any)
		for (const listener of this.listeners[(`allows${type.charAt(0).toUpperCase()}${type.slice(1)}`) as keyof TListeners]) {
			const response = (listener as any as (...args: any[]) => Result<true> as (...args: any[]) => Result<true>)(type, value, self.entries)
			if (response.isError) return response
		}
		return self._allows(type, value)
	}
	/**
	 * Adds an entry.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
	 */
	add(
		value: THook["allowValue"],
	): void {
		const self = (this as any)
		self._add(value)

		for (const listener of this.listeners.add) {
			listener(value, this.entries)
		}
	}
	protected static _canAddToDict<
		T extends Command | Key | Shortcut,
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
	): Result<true,
		KnownError<
			T extends Key ? ERROR.DUPLICATE_KEY
			: T extends Command ? ERROR.DUPLICATE_COMMAND
			: T extends Shortcut ? ERROR.DUPLICATE_SHORTCUT
			: Error
		>
	> {
		const key = typeof indexer === "function"
			? indexer(entry) as keyof TEntries
			: indexer

		let existing: any | undefined

		if (Array.isArray(entries)) {
			existing = (entries as any[]).find(item => entry.equals(item))
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

			return Err(error) as any
		}

		return Ok(true)
	}
	protected static _addToDict<
		T extends Command | Key | Shortcut,
		TEntries extends
		Record<string, T> | T[] =
		Record<string, T> | T[],
	>(
		entries: TEntries,
		entry: T,
		/** When entries are stored in a record this will give us the key the entries are keyed by. */
		indexer: Optional<keyof TEntries | ((entry: T) => string)>,
	): void {
		const key = typeof indexer === "function"
			? indexer(entry) as keyof TEntries
			: indexer

		if (Array.isArray(entries)) {
			entries.push(entry)
		} else {
			entries[key as string] = entry
		}
	}
	/**
	 * Removes an entry.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
	 */
	remove(
		value: THook["allowValue"],
	): void {
		const self = (this as any)
		self._remove(value)

		for (const listener of this.listeners.remove) {
			listener(value, this.entries)
		}
	}
	protected static _canRemoveFromDict<
		T extends Command | Key | Shortcut,
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
	): Result<true, KnownError<ERROR.MISSING>> {
		const key = typeof indexer === "function"
			? indexer(entry) as keyof TEntries
			: indexer

		let index: number | string

		if (Array.isArray(entries)) {
			index = (entries as any[]).findIndex(item => entry.equals(item))
		} else {
			index = key as string
		}

		if (index === undefined) {
			const type = entry.constructor.name
			const text = crop`
			Entry ${type} ${index/* .string */} does not exist in this collection.

			Entry:
			${indent(pretty(entry), 3)}
			`
			const error = new KnownError(ERROR.MISSING, text, { entry: (index as any), collection: self as Shortcuts })

			return Err(error)
		}
		return Ok(true)
	}
	protected static _removeFromDict<
		T extends Command | Key | Shortcut,
		TEntries extends
		Record<string, T> | T[] =
		Record<string, T> | T[],
	>(
		entries: TEntries,
		entry: T,
		/** When entries are stored in a record this will give us the key the entries are keyed by. */
		indexer: Optional<keyof TEntries | ((entry: T) => string)>,
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
		}
	}
}
