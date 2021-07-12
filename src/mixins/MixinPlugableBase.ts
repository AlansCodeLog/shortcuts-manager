import type { Plugin } from "@/classes";
import type { PluginsInfo } from "@/types";
import type { Mixin } from "@utils/types";
import { mixin } from "@utils/utils";
import { Plugable } from "./Plugable";
import { PlugableBase } from "./PlugableBase";


export class MixinPlugableBase<
	TPlugins extends Plugin<any, undefined>[],
	TInfo extends PluginsInfo<TPlugins>
> { }
export interface MixinPlugableBase<TPlugins, TInfo> extends
	Mixin<
		| PlugableBase<TPlugins, TInfo>
	>,
	PlugableBase<TPlugins, TInfo>
{
	/** @internal */
	_constructor: never
}

mixin(MixinPlugableBase, [Plugable, PlugableBase])
