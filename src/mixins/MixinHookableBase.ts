import type { Mixin } from "@utils/types"
import { mixin } from "@utils/utils"

import { Hookable } from "./Hookable"
import { HookableBase } from "./HookableBase"

import type { BaseHookType } from "@/types"


export class MixinHookableBase<
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	THooks extends Record<string, BaseHookType<any, any, any, any, any>>,
> { }
export interface MixinHookableBase<THooks> extends
	Mixin<
		| HookableBase<THooks>
	>,
	HookableBase<THooks> {
	/** @internal */
	_constructor: never
}

mixin(MixinHookableBase, [Hookable, HookableBase])
