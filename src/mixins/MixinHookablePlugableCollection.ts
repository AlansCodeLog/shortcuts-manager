import type { Plugin } from "@/classes";
import type { CollectionHookType } from "@/types";
import type { Mixin } from "@utils/types";
import { mixin } from "@utils/utils";
import { Hookable } from "./Hookable";
import { HookableCollection } from "./HookableCollection";
import { Plugable } from "./Plugable";
import { PlugableCollection } from "./PlugableCollection";

export class MixinHookablePlugableCollection<
	THook extends CollectionHookType<any, any, any>,
	TPlugins extends Plugin<any, undefined>[],
> { }
export interface MixinHookablePlugableCollection<THook, TPlugins> extends
	Mixin<
		| HookableCollection<THook>
		| PlugableCollection<TPlugins>
	>,
	HookableCollection<THook>,
	PlugableCollection<TPlugins>
{
	/** @internal */
	_constructor: never
}

mixin(MixinHookablePlugableCollection, [Hookable, HookableCollection, Plugable, PlugableCollection])
