import type { Plugin } from "@/classes"
import { Plugable } from "./Plugable"


export class PlugableCollection<
	TPlugins extends Plugin<any, any>[],
> extends Plugable<TPlugins> {
	_constructor(
		{ plugableCollection: { plugins, key } }:
		{
			plugableCollection: {
				plugins: Plugin<any, any>[] | undefined,
				key: string | undefined,
			}
		}
	): void {
		this.key = key
		this.plugins = [] as any as TPlugins
		if (plugins !== undefined) {
			this._addPlugins(plugins)
		}
	}
}
