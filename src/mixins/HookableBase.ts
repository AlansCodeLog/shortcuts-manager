import { Hookable } from "./Hookable"

import { defaultCallback } from "@/helpers"
import type { BaseHook, BaseHookType } from "@/types"


export class HookableBase<
	THooks extends
		Record<string, BaseHookType<any, any>>,
	TAllowsListener extends
		BaseHook<"allows", THooks> =
		BaseHook<"allows", THooks>,
	TSetListener extends
		BaseHook<"set", THooks> =
		BaseHook<"set", THooks>,
> extends Hookable<{ allows: TAllowsListener, set: TSetListener }> {
	/**
	 * Tells you whether a property is allowed to be set.
	 * Can return true or the error that would throw so check it against `true` (because errors are objects and objects are truthy):
	 * ```ts
	 * let allowed = shortcut.allows("keys", [[key.a]])
	 * if (allowed === true) {
	 * 	// true
	 * } else {
	 * 	let error = allowed
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
	): true | THooks[TKey]["error"] | Error | never {
		const self = this as any
		for (const listener of this.listeners.allows) {
			const response = listener(key, value, self[key])
			if (response !== true) return response
		}
		return true
	}
	/**
	 * Sets any settable properties and triggers any hooks on them.
	 *
	 * If you already checked whether a property was allowed to be set with [[allows]] immediately before calling this function, you should pass @param check = false so it doesn't check again, but still triggers hooks properly.
	 */
	set<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["value"],
		cb: (error: THooks[TKey]["error"] | Error | never) => void = defaultCallback,
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows<TKey>(key, value)

			if (e instanceof Error) {
				cb(e)
			}
		}
		const self = this as any
		for (const listener of this.listeners.set) {
			listener(key, value, self[key], cb)
		}
	}
}
