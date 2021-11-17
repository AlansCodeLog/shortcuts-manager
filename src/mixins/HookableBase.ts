import { Result } from "@utils/utils"

import { Hookable } from "./Hookable"

import type { BaseHook, BaseHookType } from "@/types"


export class HookableBase<
	THooks extends
		Record<string, BaseHookType<any, any, any>>,
	TAllowsListener extends
		BaseHook<"allows", THooks> =
		BaseHook<"allows", THooks>,
	TSetListener extends
		BaseHook<"set", THooks> =
		BaseHook<"set", THooks>,
> extends Hookable<{ allows: TAllowsListener, set: TSetListener }> {
	declare _constructor: Hookable<{ allows: TAllowsListener, set: TSetListener }>["_constructor"]
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
	 */
	allows<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["value"],
	): Result<true, THooks[TKey]["error"] | Error> {
		const self = this as any
		for (const listener of this.listeners.allows) {
			const response = listener(key, value, self[key], self)
			if (response.isError) return response
		}
		if (self._allows) return self._allows(key, value)
		return Result.Ok(true)
	}
	/**
	 * Sets any settable properties and triggers any hooks on them.
	 *
	 * This will NOT check if the property is allowed to be set, you should always check using {@link HookableBase.allows allows} first.
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
}
