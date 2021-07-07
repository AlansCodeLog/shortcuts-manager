import { Plugable } from "./Plugable"

import type { Plugin } from "@/classes"
import type { DeepPartialObj, OrToAnd, PluginInfo } from "@/types"
import { PLUGABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


export class PlugableCollection<
	TPlugins extends Plugin<any>[],
	TInfo extends
		OrToAnd<PluginInfo<TPlugins[number]>> =
		OrToAnd<PluginInfo<TPlugins[number]>>,
> extends Plugable<TPlugins, TInfo> {
	#key?: string
	[PLUGABLE_CONSTRUCTOR_KEY](plugins: Plugin<any>[] | undefined, info: DeepPartialObj<TInfo> | undefined, key: string | undefined): void {
		this.#key = key
		if (info && !plugins) super._throwNoPluginsError(info)
		if (plugins !== undefined) {
			super._addPlugins(plugins)
		}
	}
}
