import { Err, Ok, Result } from "@alanscodelog/utils"
import { crop, indent, unreachable } from "@utils/utils"

import { Hookable } from "./Hookable"

import { Command, Commands, Key, Keys, Shortcut, Shortcuts } from "@/classes"
import { isToggleKey, isToggleRootKey, KnownError, mapKeys } from "@/helpers"
import { BaseHook, BaseHookType, CollectionHook, CollectionHookType, ERROR } from "@/types"


export class HookableCollection<
	TCollectionHook extends CollectionHookType<any, any, any, any>,
	TBaseHook extends
		Record<string, BaseHookType<any, any, any, any, any, any>> = {},
	TSetHook extends
		BaseHook<"set", TBaseHook> =
		BaseHook<"set", TBaseHook>,
	TAddHook extends
		CollectionHook<"add", TCollectionHook> =
		CollectionHook<"add", TCollectionHook>,
	TRemoveHook extends
		CollectionHook<"remove", TCollectionHook> =
		CollectionHook<"remove", TCollectionHook>,
	TAllowsAddHook extends
		CollectionHook<"allowsAdd", TCollectionHook> =
		CollectionHook<"allowsAdd", TCollectionHook>,
	TAllowsRemoveHook extends
		CollectionHook<"allowsRemove", TCollectionHook> =
		CollectionHook<"allowsRemove", TCollectionHook>,
	TEntries extends TCollectionHook["values"] = TCollectionHook["values"],
	THooks extends {
		add: TAddHook
		remove: TRemoveHook
		allowsAdd: TAllowsAddHook
		allowsRemove: TAllowsRemoveHook
		set: TSetHook
	} =
	{
		add: TAddHook
		remove: TRemoveHook
		allowsAdd: TAllowsAddHook
		allowsRemove: TAllowsRemoveHook
		set: TSetHook
	},
> extends Hookable<THooks> {
	constructor() {
		super(["add", "remove", "allowsAdd", "allowsRemove", "set"])
	}
	entries!: TEntries
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _add(_entry: TCollectionHook["allowArgs"]): void {
		unreachable("Should be implemented by extending class.")
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _remove(_entry: TCollectionHook["removeArgs"]): void {
		unreachable("Should be implemented by extending class.")
	}

	protected _allows(type: "add" | "remove", entry: TCollectionHook["allowArgs"]): Result<true, TCollectionHook["error"] | Error> {
		switch (type) {
			case "add":
				return HookableCollection._canAddToDict<any>(this as any, this.entries, entry)
			case "remove":
				return HookableCollection._canRemoveFromDict<any>(this as any, this.entries, entry)
		}
	}
	protected _set<
		TKey extends
		keyof TBaseHook =
		keyof TBaseHook,
	>(
		key: TKey,
		value: TBaseHook[TKey]["value"],
	): void {
		(this as any)[key] = value
	}
	/**
	 * Sets the property and triggers any hooks on it.
	 */
	set<
		TKey extends
		keyof TBaseHook =
		keyof TBaseHook,
	>(
		key: TKey,
		value: TBaseHook[TKey]["excludeSet"] extends true ? never : TBaseHook[TKey]["value"],
	): void {
		const self = this as any
		const oldValue = self[key]
		self._set(key, value)
		for (const hook of this.hooks.set) {
			hook(key, value, oldValue, self)
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
		entry: TCollectionHook["allowArgs"]
	): Result<true, TCollectionHook["error"] | Error> {
		const self = (this as any)
		for (const hook of this.hooks[(`allows${type.charAt(0).toUpperCase()}${type.slice(1)}`) as keyof THooks]) {
			const response = type === "add"
				? (hook as any as CollectionHook<"allowsAdd">)(self, type, entry)
				: (hook as any as CollectionHook<"allowsRemove">)(self, self.entries, entry)
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
		entry: TCollectionHook["allowArgs"]
	): void {
		const self = (this as any)
		self._add(entry)

		for (const hook of this.hooks.add) {
			hook(self, this.entries, entry)
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
		let existingIdentifier = ""

		if (self instanceof Keys) {
			if (isToggleKey(entry as Key) && !isToggleRootKey(entry as Key)) {
				return Err(new KnownError(ERROR.KEYS_CANNOT_ADD_TOGGLE, `Toggle keys are automatically added to the key set when the root key is added, on/off instances cannot be added individually.`, { entry: entry as Key })) as any
			}
			existingIdentifier = (entry as any as Key).id
			existing = (entries as any)[(entry as any as Key).id]
		} else if (self instanceof Commands) {
			existingIdentifier = (entry as Command).name
			existing = (entries as any)[(entry as Command).name]
		} else if (self instanceof Shortcuts) {
			existingIdentifier = JSON.stringify(mapKeys((entry as Shortcut).chain))
			existing = (entries as Shortcut[]).find(item => (entry as Shortcut).equals(item))
		}

		if (existing) {
			const type = self instanceof Keys ? "key" : self instanceof Commands ? "command" : "shortcut"
			const text = crop`
			${type} ${existingIdentifier} is already registered.
			Existing ${type}:
			${indent(self.stringifier.stringify(existing), 3)}
			New ${type}:
			${indent(self.stringifier.stringify(entry), 3)}
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
		entry: TCollectionHook["removeArgs"]
	): void {
		const self = (this as any)
		self._remove(entry)

		for (const hook of this.hooks.remove) {
			hook(self, this.entries, entry)
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
		if (self instanceof Keys) {
			existing = (entries as any)[(entry as Key).id]
		} else if (self instanceof Commands) {
			existing = (entries as any)[(entry as Command).name]
		} else if (self instanceof Shortcuts) {
			existing = (entries as any[]).find(item => entry.equals(item))
		}

		if (existing === undefined) {
			return Err(new KnownError(ERROR.MISSING, crop`
			${entry.constructor.name} does not exist in this collection.

			${indent(self.stringifier.stringify(entry), 3)}
			`, { entry, collection: self as any }))
		}
		return Ok(true)
	}
	/**
	 * Creates a base instance that conforms to the class. If passed an existing instance will modify it to conform to the class.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	create(_rawEntry: any): any {
		unreachable("Should be implemented by extending class.")
	}
}
