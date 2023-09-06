import { type Result, unreachable } from "@alanscodelog/utils"

import { Hookable } from "./Hookable.js"

import type { KnownError } from "../helpers/KnownError.js"
import type { BaseHook, BaseHookType, CollectionHook, CollectionHookType, ERROR } from "../types/index.js"


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
	constructor(_className?: string) {
		super(_className, ["add", "remove", "allowsAdd", "allowsRemove", "set"])
	}

	entries!: TEntries

	protected _add(_entry: TCollectionHook["allowArgs"]): void {
		unreachable("Should be implemented by extending class.")
	}

	protected _remove(_entry: TCollectionHook["removeArgs"]): void {
		unreachable("Should be implemented by extending class.")
	}

	protected _allows(type: "add" | "remove", entry: TCollectionHook["allowArgs"]): Result<true, TCollectionHook["error"] | Error> {
		switch (type) {
			case "add":
				return this._canAddToDict(this.entries, entry)
			case "remove":
				return this._canRemoveFromDict(this.entries, entry)
		}
	}

	protected _canAddToDict(_entries: any, _entry: any,): Result<true, KnownError<any>> {
		unreachable("_canAddToDict should be implemented by extending class.")
	}

	protected _canRemoveFromDict(_entries: any, _entry: any): Result<true, KnownError<ERROR.MISSING>> {
		unreachable("_canRemoveToDict should be implemented by extending class.")
	}

	protected _set< TKey extends keyof TBaseHook = keyof TBaseHook>(
		key: TKey,
		value: TBaseHook[TKey]["value"],
	): void {
		(this as any)[key] = value
	}

	/**
	 * Sets the property and triggers any hooks on it.
	 */
	set< TKey extends keyof TBaseHook = keyof TBaseHook>(
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
	add(entry: TCollectionHook["allowArgs"]): void {
		const self = (this as any)
		self._add(entry)

		for (const hook of this.hooks.add) {
			hook(self, this.entries, entry)
		}
	}

	/**
	 * Removes an entry.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
	 */
	remove(entry: TCollectionHook["removeArgs"]): void {
		const self = (this as any)
		self._remove(entry)

		for (const hook of this.hooks.remove) {
			hook(self, this.entries, entry)
		}
	}

	safeRemove(
		entry: TCollectionHook["removeArgs"]
	): Result<true, TCollectionHook["error"] | Error> {
		const res = this.allows("remove", entry)
		if (res.isOk) {
			this.remove(entry)
		}
		return res
	}

	safeAdd(
		entry: TCollectionHook["allowArgs"]
	): Result<true, TCollectionHook["error"] | Error> {
		const res = this.allows("add", entry)
		if (res.isOk) {
			this.add(entry)
		}
		return res
	}

	/**
	 * Creates a base instance that conforms to the class. If passed an existing instance will modify it to conform to the class.
	 */
	create(_rawEntry: any): any {
		unreachable("Should be implemented by extending class.")
	}
}
