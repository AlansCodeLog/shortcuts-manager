import type { BaseHook, BaseHookType } from "@/types"
import { Hookable } from "./Hookable"



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
		_key: TKey,
		_value: THooks[TKey]["value"],
	): true | THooks[TKey]["error"] | Error {
		return true
	}
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
			const response = listener(key, value, self[key], self)
			if (response !== true) return response
		}
		if (self._allows) return self._allows(key, value)
		return true
	}
	/**
	 * ---
	 * Sets any settable properties and triggers any hooks on them.
	 *
	 * @param {true} check If `true`, will check if the property is allowed to be set first and throw an error if it isn't.
	 *
	 * If you already checked whether an entry can be added with {@link HookableBase.allows allows} immediately before calling this function, you should pass `false` to prevent the function from checking again.
	 */
	set<
		TKey extends
			keyof THooks =
			keyof THooks,
	>(
		key: TKey,
		value: THooks[TKey]["value"],
		check: boolean = true,
	): void {
		if (check) {
			const e = this.allows<TKey>(key, value)
			if (e instanceof Error) {
				throw e
			}
		}
		const self = this as any
		const oldValue = self[key]
		self._set(key, value)
		for (const listener of this.listeners.set) {
			listener(key, value, oldValue, self)
		}
	}
}
