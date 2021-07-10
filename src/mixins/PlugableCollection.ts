import { Plugable } from "./Plugable"

import type { Plugin } from "@/classes"
import type { DeepPartialObj, OrToAnd, PluginInfo } from "@/types"


export class PlugableCollection<
	TPlugins extends Plugin<any>[],
	TInfo extends
		OrToAnd<PluginInfo<TPlugins[number]>> =
		OrToAnd<PluginInfo<TPlugins[number]>>,
> extends Plugable<TPlugins> {
	protected _plugableConstructor(plugins: Plugin<any>[] | undefined, info: DeepPartialObj<TInfo> | undefined, key: string | undefined): void {
		this.key = key
		if (info && !plugins) super._throwNoPluginsError(info)
		if (plugins !== undefined) {
			this._addPlugins(plugins)
		}
	}
}
