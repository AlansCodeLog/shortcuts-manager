import { crop, indent, pretty } from "@utils/utils"

import type { Command, Condition, Key, Plugin, Shortcut } from "@/classes"
import { KnownError } from "@/helpers"
import { DeepPartialObj, OrToAnd, PluginInfo, TYPE_ERROR } from "@/types"
import { PLUGABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


export class Plugable<
	TPlugins extends Plugin<any>[],
	TInfo extends
		OrToAnd<PluginInfo<TPlugins[number]>> =
		OrToAnd<PluginInfo<TPlugins[number]>>,
> {
	plugins?: TPlugins
	#key?: string
	[PLUGABLE_CONSTRUCTOR_KEY](plugins: Plugin<any>[] | undefined, info: DeepPartialObj<TInfo> | undefined, key: string | undefined): void {
		this.#key = key
		if (info && !plugins) this._throwNoPluginsError(info)
		if (plugins !== undefined) {
			this._addPlugins(plugins)
		}
	}
	protected _throwNoPluginsError(info: any): void {
		throw new KnownError(TYPE_ERROR.CLONER_NOT_SPECIFIED, crop`
		You passed an info object but no plugins to manage it:
		${indent(pretty(info), 1)}
		`, { info })
	}
	#addPlugin(plugin: Plugin<any>, check: boolean = true): void {
		if (check) {
			const can = Plugable.canAddPlugin(plugin, this.plugins)
			if (can !== true) throw can
		}
		this.plugins = this.plugins! ?? []
		const added = this.plugins.includes(plugin)
		if (!added) this.plugins.push(plugin)
	}
	protected _addPlugins(plugins: Plugin<any>[]): void {
		Plugable.canAddPlugins(plugins, { isShortcut: this.#key === undefined })
		for (const plugin of plugins) {
			this.#addPlugin(plugin, false)
		}
	}
	protected static canAddPlugin(plugin: Plugin<any>, checkedPlugins: Plugin<any>[] = []): true | KnownError<TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES> {
		if (checkedPlugins.length === 0) return true
		const properties: string[] = [plugin.namespace as string]

		let conflict: { property: string, plugin: Plugin<any> } | undefined

		// eslint-disable-next-line no-shadow
		for (const existing of checkedPlugins) {
			if (properties.includes(existing.namespace as string)) {
				conflict = { property: existing.namespace as string, plugin: existing }
				break
			}
		}
		if (conflict !== undefined) {
			return new KnownError(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES, crop`
			Plugin "${plugin.namespace}" would conflict with plugin's namespace.
			New:
			${indent(pretty(plugin), 5)}
			Existing:
			${indent(pretty(conflict.plugin), 5)}
			`, { plugins: checkedPlugins, plugin, existing: conflict })
		}
		return true
	}
	protected static canAddPlugins(plugins: Plugin<any>[], { isShortcut = false }: { isShortcut?: boolean } = {}): true | KnownError<TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES> {
		for (let i = 0; i < plugins.length; i++) {
			const plugin = plugins[i]
			const can = Plugable.canAddPlugin(plugin, plugins.slice(0, i))
			if (can !== true) return can
			if (isShortcut && plugin.overrides) {
				// eslint-disable-next-line no-console
				console.warn(crop`
				WARNING: Shortcuts instance will not use plugins with overrides, and you passed a plugin (#${i} in the plugins array, containing a plugin base named "${plugin.namespace}") with overrides.
				This is because there is no one property we can index shortcuts by.
				`)
			}
		}
		return true
	}
	static create<
		T extends Condition | Command | Shortcut | Key,
		TKey extends keyof T,
		TClass extends new (...args: any[]) => T = new (...args: any[]) => T,
		TEntry extends T | DeepPartialObj<T["opts"]> = T | DeepPartialObj<T["opts"]>,
	>(type: TClass, plugins: Plugin<any>[] | undefined, key: TKey, entry: TEntry): T {
		let instance: any
		const isNotInstance = !(entry instanceof type)

		const arg = entry[key as keyof TEntry]

		// @ts-expect-error - doesn't matter if they don't exist
		const opts = entry.opts

		if (plugins) {
			if (isNotInstance) {
				const entryInfo = (entry as any).info
				instance = new type(arg, opts, entryInfo, plugins)
			}
		} else {
			instance = isNotInstance
			? new type(arg, opts)
			: entry
		}

		return instance
	}
}
