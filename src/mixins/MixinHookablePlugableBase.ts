import type { Mixin } from "@utils/types"
import { mixin } from "@utils/utils"

import { Hookable } from "./Hookable"
import { HookableBase } from "./HookableBase"
import { Plugable } from "./Plugable"
import { PlugableBase } from "./PlugableBase"

import type { Plugin } from "@/classes"
import type { BaseHookType, PluginsInfo } from "@/types"


export class MixinHookablePlugableBase<
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	THooks extends Record<string, BaseHookType<any, any, any, any, any>>,
	TPlugins extends Plugin<any, undefined>[],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TInfo extends PluginsInfo<TPlugins>,
> { }
export interface MixinHookablePlugableBase<THooks, TPlugins, TInfo> extends
	Mixin<
		| HookableBase<THooks>
		| PlugableBase<TPlugins, TInfo>
	>,
	HookableBase<THooks>,
	PlugableBase<TPlugins, TInfo> {
	/** @internal */
	_constructor: never
}

mixin(MixinHookablePlugableBase, [Hookable, HookableBase, Plugable, PlugableBase])
