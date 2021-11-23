import { Err, Ok, Result } from "@alanscodelog/utils"
import { crop, indent, pretty, unreachable } from "@utils/utils"

import { Hookable } from "./Hookable"

import { Command, Commands, Key, Keys, Shortcut, Shortcuts } from "@/classes"
import { isToggleKey, isToggleRootKey, KnownError } from "@/helpers"
import { CollectionHook, CollectionHookType, ERROR } from "@/types"


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
	constructor() {
		super(["add", "remove", "allowsAdd", "allowsRemove"])
	}
	entries!: TEntries
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _add(_entry: THook["allowArgs"]): void {
		unreachable("Should be implemented by extending class.")
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _remove(_entry: THook["removeArgs"]): void {
		unreachable("Should be implemented by extending class.")
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _allows(type: "add" | "remove", entry: THook["allowArgs"]): Result<true, THook["error"] | Error> {
		switch (type) {
			case "add":
				return HookableCollection._canAddToDict<any>(this as any, this.entries, entry[0])
			case "remove":
				return HookableCollection._canRemoveFromDict<any>(this as any, this.entries, entry[0])
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
	 *
	 * See {@link HookableCollection.add add } for not on {@link Keys} class.
	 */
	allows(
		type: "add" | "remove",
		entry: THook["allowArgs"]
	): Result<true, THook["error"] | Error> {
		const self = (this as any)
		for (const listener of this.listeners[(`allows${type.charAt(0).toUpperCase()}${type.slice(1)}`) as keyof TListeners]) {
			const response = type === "add"
				? (listener as any as CollectionHook<"allowsAdd">)(self, type, entry)
				: (listener as any as CollectionHook<"allowsRemove">)(self, self.entries, entry)
			if (response.isError) return response
		}
		return self._allows(type, entry)
	}
	/**
	 * Adds an entry.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
	 *
	 * Note for adding keys to {@link Keys}, you will need to pass `{key, col, row}` as the value. `col`/`row` are optional and default to 0. This is not neccesary when removing a key, just `key` can be passed as the value.
	 */
	add(
		entry: THook["allowArgs"]
	): void {
		const self = (this as any)
		self._add(entry)

		for (const listener of this.listeners.add) {
			listener(entry, this.entries, self)
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
	): Result<true,
		KnownError<
			T extends Key ? ERROR.DUPLICATE_KEY | ERROR.KEYS_CANNOT_ADD_TOGGLE
			: T extends Command ? ERROR.DUPLICATE_COMMAND
			: T extends Shortcut ? ERROR.DUPLICATE_SHORTCUT
			: Error
		>
	> {
		let existing: any | undefined

		if (self instanceof Keys) {
			if (isToggleKey(entry as Key) && !isToggleRootKey(entry as Key)) {
				return Err(new KnownError(ERROR.KEYS_CANNOT_ADD_TOGGLE, `Toggle keys are automatically added to the key set when the root key is added, on/off instances cannot be added individually.`, { entry: entry as Key })) as any
			}
			existing = (entries as any)[(entry as any as Key).id]
		} else if (self instanceof Commands) {
			existing = (entries as any)[(entry as Command).name]
		} else if (self instanceof Shortcuts) {
			existing = (entries as Shortcut[]).find(item => (entry as Shortcut).equals(item))
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
	/**
	 * Removes an entry.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
	 */
	remove(
		entry: THook["removeArgs"]
	): void {
		const self = (this as any)
		self._remove(entry)

		for (const listener of this.listeners.remove) {
			listener(self, this.entries, entry)
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
	): Result<true, KnownError<ERROR.MISSING>> {
		let existing: any

		if (this instanceof Keys) {
			existing = (entries as any)[(entry as Key).id]
		} else if (this instanceof Commands) {
			existing = (entries as any)[(entry as Command).name]
		} else if (this instanceof Shortcuts) {
			existing = (entries as any[]).find(item => entry.equals(item))
		}

		if (existing === undefined) {
			return Err(new KnownError(ERROR.MISSING, crop`
			${entry.constructor.name} does not exist in this collection.

			${indent(pretty(entry), 3)}
			`, { entry, collection: self as any }))
		}
		return Ok(true)
	}
}
