import type { Plugin } from "@/classes";
import type { BaseHookType, PluginsInfo } from "@/types";
import type { Mixin } from "@utils/types";
import { mixin } from "@utils/utils";
import { Hookable } from "./Hookable";
import { HookableBase } from "./HookableBase";
import { Plugable } from "./Plugable";
import { PlugableBase } from "./PlugableBase";


export class MixinHookablePlugableBase<
	THooks extends Record<string, BaseHookType<any, any>>,
	TPlugins extends Plugin<any, undefined>[],
	TInfo extends PluginsInfo<TPlugins>
> { }
export interface MixinHookablePlugableBase<THooks, TPlugins, TInfo> extends
	Mixin<
		| HookableBase<THooks>
		| PlugableBase<TPlugins, TInfo>
	>,
	HookableBase<THooks>,
	PlugableBase<TPlugins, TInfo>
{
	/** @internal */
	_constructor: never
}

mixin(MixinHookablePlugableBase, [Hookable, HookableBase, Plugable, PlugableBase])
