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
	 *
	 * Can return true or the error that would throw:
	 * ```ts
	 * const allowed = shortcut.allows("keys", [[key.a]])
	 * // Careful to check against true
	 * if (allowed === true) {...} else { const error = allowed }
	 * // Alternatively
	 * if (allowed instanceof Error) {...} else {...}
	 * ```
	 *
	 * @inheritDoc
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
	 * ---
	 * Sets any settable properties and triggers any hooks on them.
	 *
	 * @param cb A callback in case the entry is not allowed to be added. A default callback is provided that will just throw the error.
	 * @param {true} check If true, check if the property is allowed to be set (if it's not, the function will throw).
	 *
	 * If you already checked whether an entry can be added with {@link HookableCollection.allows allows} immediately before calling this function, you should pass `false` to prevent the function from checking again.
	 */
	set<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["value"],
		cb: (error: THooks[TKey]["error"] | Error | never) => void = defaultCallback,
		/** Check if the property is allowed to be set (if it's not, the function will throw). */
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows<TKey>(key, value)

			if (e instanceof Error) cb(e)
		}
		const self = this as any
		for (const listener of this.listeners.set) {
			listener(key, value, self[key], cb)
		}
	}
}
