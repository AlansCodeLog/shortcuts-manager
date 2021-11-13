import type { Commands, Keys } from "@/classes"
import { Command, Key, Shortcut } from "@/classes"
import type { Shortcuts } from "@/classes/Shortcuts"
import { KnownError } from "@/helpers"
import { CollectionHook, CollectionHookType, ERROR, Optional } from "@/types"
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
	protected _add(_value: THook["value"]): void {
		unreachable("Should be implemented by extending class.")
	}
	protected _remove(_value: THook["value"]): void {
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
	 * // careful, errors are objects which are truthy
	 * if (allowed === true) {...} else { const error = allowed }
	 * // alternatively
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
	 * Adds an entry.
	 *
	 * ```ts
	 * const allowed = shortcut.allows("add", "keys", [[key.a]])
	 * // careful, errors are truthy
	 * if (allowed === true) {
	 * 	shortcut.add("keys", [[key.a]])
	 * } else {
	 * 	const error = allowed
	 * 	//...
	 * }
	 * // or
	 * try (shortcuts.add("keys", [[key.a]])) {
	 *
	 * } catch(e) {
	 *
	 * }
	 *
	 * ```
	 *
	 * Note that this will mutate the object passed and create an instance from it if it's not one already. If it's already an instance, it might still get mutated if it's options do not conform to the collection's.
	 *
	 * @param {true} check If `true`, will check if the property is allowed to be set first and throw an error if it isn't.
	 *
	 * If you already checked whether an entry can be added with {@link HookableCollection.allows allows} immediately before calling this function, you should pass `false` to prevent the function from checking again.
	 */
	add(
		value: THook["value"],
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows("add", value)
			if (e instanceof Error) {
				throw e
			}
		}
		const self = (this as any)
		self._add(value)

		for (const listener of this.listeners.add) {
			listener(value, this.entries)
		}

	}
	protected static _addToDict<
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

				throw error
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
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows("remove", value)
			if (e instanceof Error) {
				throw e
			}
		}
		const self = (this as any)
		self._remove(value)

		for (const listener of this.listeners.remove) {
			listener(value, this.entries)
		}

	}
	protected static _removeFromDict<
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

			throw error
		}
	}
}
