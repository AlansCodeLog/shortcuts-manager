import { Ok, Result } from "@alanscodelog/utils"

import { Hookable } from "./Hookable.js"

import type { BaseHook, BaseHookType, HookableOpts } from "../types/index.js"


export class HookableBase<
	THooks extends
		Record<string, BaseHookType<any, any, any, any, any, any>>,
	TAllowsHook extends
		BaseHook<"allows", THooks> =
		BaseHook<"allows", THooks>,
	TSetHook extends
		BaseHook<"set", THooks> =
		BaseHook<"set", THooks>,
> extends Hookable<{ allows: TAllowsHook, set: TSetHook }> {
	readonly _class: string

	constructor(className: string, opts: Partial<HookableOpts> = {}) {
		super(["allows", "set"], opts)
		this._class = className
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

	protected _allows<TKey extends keyof THooks = keyof THooks>(_key: TKey, _value: THooks[TKey]["value"]): Result<true, THooks[TKey]["error"] | Error> {
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
	allows< TKey extends keyof THooks = keyof THooks>(
		key: TKey,
		value: THooks[TKey]["excludeAllows"] extends true ? never : THooks[TKey]["value"],
	): Result<true, THooks[TKey]["error"] | Error> {
		const self = this as any

		for (const hook of this.hooks.allows) {
			const response = hook(key as any, value, self[key], self)
			if (response.isError) return response
		}
		if (self._allows) return self._allows(key, value)
		return Result.Ok(true)
	}

	/**
	 * Sets the property and triggers any hooks on it.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first or use {@link HookableBase.safeSet}.
	 *
	 * For the manager there is also the special `"replace"` property. See {@link HookableBase.set set}.
	 */
	set< TKey extends keyof THooks = keyof THooks>(
		key: TKey,
		value: THooks[TKey]["excludeSet"] extends true ? never : THooks[TKey]["value"],
	): void {
		const self = this as any
		const oldValue = self[key]
		self._set(key, value)
		for (const hook of this.hooks.set) {
			hook(key, value, oldValue, self)
		}
	}

	/**
	 * Like `set` but checks first if the property can be set.
	 *
	 * Returns a result monad. See {@link Result} from my utils lib.
	 * ```ts
	 * const res = shortcut.safeSet("keys", [[key.a]])
	 *
	 * if (res.isError) {...}
	 *
	 * // alternatively throw immediately
	 * shortcut.safeSet("keys", [[key.a]]).unwrap()
	 * ```
	 */
	safeSet< TKey extends keyof THooks = keyof THooks>(
		key: TKey,
		value: THooks[TKey]["excludeSet"] extends true ? never : THooks[TKey]["value"],
	): Result<true, THooks[TKey]["error"] | Error> {
		const res = this.allows(key, value)
		if (res.isError) return res
		else this.set(key, value)
		return Ok(true)
	}
}

