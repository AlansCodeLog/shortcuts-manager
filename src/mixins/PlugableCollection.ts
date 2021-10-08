import type { Plugin } from "@/classes"
import { KnownError } from "@/helpers"
import type { CollectionHookType } from "@/types"
import { ERROR } from "@/types"
import { Plugable } from "./Plugable"
import type { PlugableBase } from "./PlugableBase"



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

/**
 * Prevents allowing entries with different plugins or that have plugins when the instance does not.
 * @internal
 */
export function internalPlugableCollectionAllowsHook<
	TPlugins extends Plugin<any, any>[],
	THook extends CollectionHookType<any, any, any>
>(self: PlugableCollection<TPlugins>, value: THook["value"]): true | THook["error"] | Error | never {
	if (value.plugins !== undefined) {
		//@ts-expect-error
		declare const value: PlugableBase<TPlugins>
		if (value.plugins!.length !== self.plugins?.length || value.plugins!.find(plugin => self.plugins!.includes(plugin)) == undefined) {
			return new KnownError(ERROR.CONFLICTING_ENTRY_PLUGINS, `To add an existing entry to a collection it must `,
				{entry: value as any, collection: self as any}
			)
		}
	}
	return true
}
