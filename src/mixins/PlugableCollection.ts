import type { Plugin } from "@/classes"
import { KnownError } from "@/helpers"
import type { CollectionHookType } from "@/types"
import { ERROR } from "@/types"
import { Plugable } from "./Plugable"
import type { PlugableBase } from "./PlugableBase"



export class PlugableCollection<
	TPlugins extends Plugin<any>[],
> extends Plugable<TPlugins> {
	_constructor(
		{ plugableCollection: { plugins, key, isShortcut } }:
		{
			plugableCollection: {
				plugins: Plugin<any>[] | undefined,
				key: string | undefined,
				isShortcut?: boolean
			}
		}
	): void {
		this.key = key
		if (plugins !== undefined) {
			if (plugins) {
				Plugable._canAddPlugins(plugins, { isShortcut })
				this.plugins = plugins as TPlugins
			}
		}
	}
}

/**
 * Prevents allowing entries with different plugins or that have plugins when the instance does not.
 * @internal
 */
export function internalPlugableCollectionAllowsHook<
	TPlugins extends Plugin<any>[],
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
