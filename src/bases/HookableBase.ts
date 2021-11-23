import { Result } from "@utils/utils"

import { Hookable } from "./Hookable"

import type { Command, Condition, Key, Shortcut } from "@/classes"
import type { BaseHook, BaseHookType, RawCommand, RawKey, RawShortcut } from "@/types"


export class HookableBase<
	THooks extends
		Record<string, BaseHookType<any, any, any, any, any>>,
	TAllowsListener extends
		BaseHook<"allows", THooks> =
		BaseHook<"allows", THooks>,
	TSetListener extends
		BaseHook<"set", THooks> =
		BaseHook<"set", THooks>,
> extends Hookable<{ allows: TAllowsListener, set: TSetListener }> {
	constructor() {
		super(["allows", "set"])
	}
	protected _set<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["value"],
	): void {
		(this as any)[key] = value
	}
	protected _allows<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_key: TKey,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_value: THooks[TKey]["value"],
	): Result<true, THooks[TKey]["error"] | Error> {
		return Result.Ok(true)
	}
	/**
	 * Tells you whether a property is allowed to be set.
	 *
	 * Returns a result monad. See {@link Result} from my utils lib.
	 *
	 * ```ts
	 * const res = shortcut.allows("keys", [[key.a]])
	 * if (res.isOk) {
	 * 	shortcut.set("keys", [[key.a]])
	 * } else { // res.isError
	 * 	console.log(res.error.message)
	 * }
	 * ```
	 *
	 * For the manager, it has a special "property" `"replace"` for replacing one or more of some of it's properties (keys, commands, or shortcuts) at a time. This is because if you want to replace two of them at a time you could get errors that you would not get if you had tried to do it seperately.
	 *
	 * ```ts
	 * // examples:
	 * const res = manager.allows("replace", {shorcuts})
	 * // same as:
	 * const res = manager.allows("shortcuts", shorcuts)
	 *
	 * // multiple properties:
	 * const res = manager.allows("replace", {keys, commands})
	 * const res = manager.allows("replace", {keys, commands, shortcuts})
	 * ```
	 */
	allows<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["exclude"] extends true ? never : THooks[TKey]["value"],
	): Result<true, THooks[TKey]["error"] | Error> {
		const self = this as any
		for (const listener of this.listeners.allows) {
			const response = listener(key as any, value, self[key], self)
			if (response.isError) return response
		}
		if (self._allows) return self._allows(key, value)
		return Result.Ok(true)
	}
	/**
	 * Sets any settable properties and triggers any hooks on them.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
	 *
	 * For the manager their is also the special `"replace"` property. See {@link HookableBase.set set}.
	 */
	set<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["value"],
	): void {
		const self = this as any
		const oldValue = self[key]
		self._set(key, value)
		for (const listener of this.listeners.set) {
			listener(key, value, oldValue, self)
		}
	}
	protected static createAny<
		T extends Condition | Command | Shortcut | Key,
		TKey extends keyof T,
		TClass extends new (...args: any[]) => T = new (...args: any[]) => T,
		TEntry extends T | RawCommand | RawKey | RawShortcut = T | RawCommand | RawKey | RawShortcut,
	>(type: TClass, key: TKey, entry: TEntry): T {
		const isInstance = (entry instanceof type)

		const arg = entry[key as keyof TEntry]

		const opts = (entry as any).opts

		const instance = isInstance
				? entry
				: new type(arg, opts)
		return instance
	}
}
