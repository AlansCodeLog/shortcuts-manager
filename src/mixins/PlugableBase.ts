import { dedupe } from "@alanscodelog/utils"

import { Plugable } from "./Plugable"

import type { Plugin } from "@/classes"
import type { DeepPartialObj, OrToAnd, PluginInfo } from "@/types"


export class PlugableBase<
	TPlugins extends Plugin<any, any>[],
	TInfo extends
		OrToAnd<PluginInfo<TPlugins[number]>> =
		OrToAnd<PluginInfo<TPlugins[number]>>,
> extends Plugable<TPlugins> {
	info!: TInfo
	_constructor(
		{ plugableBase: { plugins, info, key } }:
		{
			plugableBase: {
				plugins: Plugin<any, any>[] | undefined
				info: DeepPartialObj<TInfo> | undefined
				key: string | undefined
			}
		}
	): void {
		this.key = key
		if (info && !plugins) super._throwNoPluginsError(info)
		this.plugins = [] as any as TPlugins
		if (plugins !== undefined) {
			this._addPlugins(plugins)
			this._initPlugins()
		}
	}
	protected _initPlugins(): void {
		for (const plugin of this.plugins) {
			const namespace = plugin.namespace as keyof TInfo
			const key = this[this.key as keyof this]

			const overrides = plugin.overrides !== undefined && key !== undefined
				? plugin.overrides[key]
				: {}

			this.info = this.info ?? {} as TInfo
			this.info[namespace] = {} as TInfo[keyof TInfo]
			this.info[namespace] = plugin.init(this.info[namespace], plugin.defaults, overrides)
		}
	}
	/**
	 * Returns if the info properties of another entry is equal to this one, according to each plugin's equal method.
	 *
	 * Note the method can be overwritten, and is therefore not guaranteed to be correct.
	 */
	equalsInfo(item: PlugableBase<any, any>): boolean {
		const plugins = dedupe([...item.plugins, ...this.plugins])
		for (const plugin of plugins) {
			const thisInfo = this.info?.[plugin.namespace as keyof TInfo]
			const itemInfo = item.info?.[plugin.namespace as keyof typeof item["info"]]

			if (!plugin.equals(thisInfo, itemInfo)) return false
		}
		return true
	}
}

