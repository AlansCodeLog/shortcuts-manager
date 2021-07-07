import { crop, indent, pretty } from "@utils/utils"

import { KnownError } from "@/helpers"
import { TYPE_ERROR } from "@/types"
import { HOOKABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


export class Base<
	THooks extends Record<string, any>,
	THookTypes extends keyof THooks = keyof THooks,
> {
	listeners!: {[K in keyof THooks]: THooks[K][] }
	[HOOKABLE_CONSTRUCTOR_KEY](keys: THookTypes[]): void {
		this.listeners = {} as any
		for (const key of keys) this.listeners[key] = [] as any
	}
	addHook<
		TType extends
			THookTypes =
			THookTypes,
		TListener extends
			THooks[TType] =
			THooks[TType],
	>(type: TType, listener: TListener): void {
		this.listeners[type].push(listener as any)
	}
	removeHook<
		TType extends
		THookTypes =
		THookTypes,
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
