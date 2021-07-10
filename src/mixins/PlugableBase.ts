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
	protected _plugableConstructor(plugins: Plugin<any>[] | undefined, info: DeepPartialObj<TInfo> | undefined, key: string | undefined): void {
		this.key = key
		if (info && !plugins) super._throwNoPluginsError(info)
		if (plugins !== undefined) {
			this._addPlugins(plugins)
			this._initPlugins()
		}
	}
	protected _initPlugins(): void {
		for (const plugin of this.plugins!) {
			const namespace = plugin.namespace as keyof TInfo
			const key = this.key

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
	 *
	 * Instances compared should have the same plugins, otherwise this will always return false.
	 */
	equalsInfo(item: PlugableBase<any, any>): boolean {
		// both undefined
		if (this.plugins === item.plugins && this.plugins === undefined) return true

		if (this.plugins!.length !== item.plugins.length) return false

		const check = this.plugins !== item.plugins
		for (const plugin of item.plugins) {
			// one plugin is different
			if (check && !this.plugins!.includes(plugin)) return false
			const thisInfo = this.info[plugin.namespace as keyof TInfo]
			const itemInfo = item.info[plugin.namespace as keyof typeof item["info"]]
			if (!plugin.equals(thisInfo, itemInfo)) return false
		}
		return true
	}
}

