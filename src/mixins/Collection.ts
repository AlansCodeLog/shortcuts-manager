import { Hookable } from "./Hookable"

import { defaultCallback } from "@/helpers"
import type { CollectionHook, CollectionHookType } from "@/types"


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
		if (self.__allows !== undefined) {
			const response = self.__allows(value, self.entries)
			if (response !== true) return response
		}

		return true
	}
	/**
	 * Adds any entries and triggers any hooks on them.
	 * If you already checked whether an entry would be allowed to be set with [[allows]] immediately before calling this function, you should pass @param check = false so it doesn't check again, but still triggers hooks properly.
	 */
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

		if (self.__add === undefined) {
			throw new Error(`You forgot to implement __add for "${self.constructor.name}".`)
		}
		self.__add(value, cb)
	}
}
