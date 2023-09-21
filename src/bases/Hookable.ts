import { crop, indent, pretty } from "@alanscodelog/utils"

import { KnownError } from "../helpers/KnownError.js"
import { TYPE_ERROR } from "../types/enums.js"


export class Hookable<
	THooks extends Record<string, any>,
	TTypes extends keyof THooks = keyof THooks,
> {
	readonly _class?: string

	hooks: {[K in keyof THooks]: THooks[K][] } = {} as any

	constructor(_className: string | undefined, keys: TTypes[]) {
		for (const key of keys) this.hooks[key] = [] as any
		this._class = _className
	}

	/**
	 * Add a hook.
	 *
	 * This works just like adding an event hook:
	 *
	 * ```ts
	 * const allowsHook = ... // keep a reference if you want to remove it later
	 * shortcut.addHook("allows", allowsHook)
	 *
	 * if (shortcut.allows(...).isOk) // your hook will fire
	 * ```
	 *
	 * Note that typescript can only understand the types of the errors of the builtin hooks. Therefore if you're adding hooks afterwards, you will need to pass the possible errors the hook can return as the first type parameter if you want them typed correctly:
	 * ```ts
	 * class MyError extends Error {
	 *  	property: boolean
	 * }
	 * let allowed = shortcut.allows<MyError>(...)
	 * ```
	 *
	 * Note some classes might allow adding only some types of hooks, but not others on some properties. For example, you can add `set` hooks to some properties of collection classes but not `allows` hooks to those properties.
	 */
	addHook<
		TType extends
			TTypes =
			TTypes,
		THook extends
			THooks[TType] =
			THooks[TType],
	>(type: TType, hook: THook): THook {
		if (typeof hook !== "function") {
			throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "Hook is not a function.", undefined)
		}
		this.hooks[type].push(hook as any)
		return hook
	}

	/**
	 * Remove a hook.
	 *
	 * This works just like removing an event hook:
	 *
	 * ```ts
	 * const allowsHook = ... // keep a reference to the hook
	 * keys.addHook("allowsAdd", allowsHook)
	 * keys.removeHook("allowsAdd", allowsHook)
	 * ```
	 */
	removeHook<
		TType extends
			TTypes =
			TTypes,
		THook extends
			THooks[TType] =
			THooks[TType],
	>(type: TType, hook: THook): void {
		const index = this.hooks[type].indexOf(hook)
		if (index === -1) {
			const prettyHooks = indent(pretty(this.hooks[type]), 4)
			throw new KnownError(TYPE_ERROR.HOOK_OR_LISTENER_DOES_NOT_EXIST, crop`
			Could not find hook ${(hook as any).toString()} in hooks list:
				${prettyHooks}
			`, {
				hook, hooks: this.hooks[type],
			})
		}
		this.hooks[type].splice(index, 1)
	}
}
