import { Plugable } from "./Plugable"

import type { Command, Key, Plugin, Shortcut } from "@/classes"
import type { DeepPartialObj, OrToAnd, PluginInfo } from "@/types"
import { PLUGABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


export class PlugableBase<
	TPlugins extends Plugin<any>[],
	TInfo extends
		OrToAnd<PluginInfo<TPlugins[number]>> =
		OrToAnd<PluginInfo<TPlugins[number]>>,
> extends Plugable<TPlugins, TInfo> {
	info!: TInfo
	#key?: string
	[PLUGABLE_CONSTRUCTOR_KEY](plugins: Plugin<any>[] | undefined, info: DeepPartialObj<TInfo> | undefined, key: string | undefined): void {
		this.#key = key
		if (info && !plugins) super._throwNoPluginsError(info)
		if (plugins !== undefined) {
			super._addPlugins(plugins)
			this.#initPlugins()
		}
	}
	#initPlugins(): void {
		for (const plugin of this.plugins!) {
			const namespace = plugin.namespace as keyof TInfo
			const key = this.#key

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
	protected equalsInfo<T extends Shortcut | Command | Key>(item: T): boolean {
		// both undefined
		if (this.plugins === item.plugins && this.plugins === undefined) return true

		if (this.plugins!.length !== item.plugins!.length) return false

		const check = this.plugins !== item.plugins
		for (const plugin of item.plugins!) {
			// one plugin is different
			if (check && !this.plugins!.includes(plugin)) return false
			const thisInfo = this.info[plugin.namespace as keyof TInfo]
			const itemInfo = item.info[plugin.namespace as keyof T]
			if (!plugin.equals(thisInfo, itemInfo)) return false
		}
		return true
	}
}
