import { crop, indent, pretty } from "@utils/utils"

import { KnownError } from "@/helpers"
import { TYPE_ERROR } from "@/types"


export class Hookable<
	THooks extends Record<string, any>,
	TTypes extends keyof THooks = keyof THooks,
> {
	listeners!: {[K in keyof THooks]: THooks[K][] }
	protected _hookableConstructor(keys: TTypes[]): void {
		this.listeners = {} as any
		for (const key of keys) this.listeners[key] = [] as any
	}
	/**
	 * Add a hook.
	 *
	 * This works just like adding an event listener:
	 *
	 * ```ts
	 * const allowsHook = ... // keep a reference if you want to remove it later
	 * keys.addHook("allows", allowsHook)
	 *
	 * if (keys.allows(...)) // your hook will fire
	 * ```
	 *
	 * Note that typescript can only understand the types of the errors of the builtin listeners. Therefore if you're adding listeners afterwards, you will need to pass the possible errors the listener can return as the first type parameter if you want them typed correctly:
	 * ```ts
	 * class MyError extends Error {
	 *  	property: boolean
	 * }
	 * let allowed = keys.allows<MyError>(...)
	 * ```
	 */
	addHook<
		TType extends
			TTypes =
			TTypes,
		TListener extends
			THooks[TType] =
			THooks[TType],
	>(type: TType, listener: TListener): void {
		this.listeners[type].push(listener as any)
	}
	/**
	 * Remove a hook.
	 *
	 * This works just like removing an event listener:
	 *
	 * ```ts
	 * const allowsHook = ... // keep a reference to the listener
	 * keys.addHook("allows", allowsHook)
	 * keys.removeHook("allows", allowsHook)
	 * ```
	 */
	removeHook<
		TType extends
			TTypes =
			TTypes,
		TListener extends
			THooks[TType] =
			THooks[TType],
	>(type: TType, listener: TListener): void {
		const index = this.listeners[type].indexOf(listener)
		if (index === -1) {
			const prettyListeners = indent(pretty(this.listeners[type]), 4)
			throw new KnownError(TYPE_ERROR.LISTENER_DOES_NOT_EXIST, crop`
			Could not find listener ${(listener as any).toString()} in listeners list:
				${prettyListeners}
			`, {
				listener, listeners: this.listeners[type],
			})
		}
		this.listeners[type].splice(index, 1)
	}
}
