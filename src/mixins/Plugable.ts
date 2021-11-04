import type { Command, Condition, Key, Plugin, Shortcut } from "@/classes"
import { KnownError } from "@/helpers"
import { RawCommand, RawKey, RawShortcut, TYPE_ERROR } from "@/types"
import { crop, indent, pretty } from "@utils/utils"



export class Plugable<
	TPlugins extends Plugin<any, any>[],
> {
	plugins!: TPlugins
	key?: string
	protected _throwNoPluginsError(info: any): void {
		throw new KnownError(TYPE_ERROR.CLONER_NOT_SPECIFIED, crop`
		You passed an info object but no plugins to manage it:
		${indent(pretty(info), 1)}
		`, { info })
	}
	protected _addPlugin(plugin: Plugin<any, any>, check: boolean = true): void {
		if (check) {
			const can = Plugable._canAddPlugin(plugin, this.plugins)
			if (can !== true) throw can
		}
		const added = this.plugins.includes(plugin)
		if (!added) this.plugins.push(plugin)
	}
	protected _addPlugins(plugins: Plugin<any, any>[]): void {
		const can = Plugable._canAddPlugins(plugins, this)
		if (can !== true) throw can
		for (const plugin of plugins) {
			this._addPlugin(plugin, false)
		}
	}
	protected static _canAddPlugin(plugin: Plugin<any, any>, checkedPlugins: Plugin<any, any>[] = []): true | KnownError<TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES> {
		if (checkedPlugins.length === 0) return true
		const conflict = checkedPlugins.find(existing => existing !== plugin && existing.namespace === plugin.namespace)

		if (conflict !== undefined) {
			return new KnownError(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES, crop`
			Plugin "${plugin.namespace}" would conflict with an existing plugin's namespace.
			New:
			${indent(pretty(plugin), 5)}
			Existing:
			${indent(pretty(conflict), 5)}
			`, { plugins: checkedPlugins, plugin, existing: conflict })
		}
		return true
	}

	protected static _canAddPlugins(plugins: Plugin<any, any>[], instance: any & { key?: string }): true | KnownError<TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES> {
		for (let i = 0; i < plugins.length; i++) {
			const plugin = plugins[i]

			const can = Plugable._canAddPlugin(plugin, [...instance.plugins, ...plugins.slice(0, i)])
			if (can !== true) return can

			if (instance.key === undefined && plugin.overrides && Object.keys(plugin.overrides).length > 0) {
				// eslint-disable-next-line no-console
				console.warn(crop`
					WARNING: This instance (${instance.constructor.name}) was instantiated with a plugin (#${i} in the plugins array, containing a plugin base named "${plugin.namespace}") with overrides, but the instance does not support overrides.
				`)
			}

		}
		return true
	}
	static create<
		T extends Condition | Command | Shortcut | Key,
		TKey extends keyof T,
		TClass extends new (...args: any[]) => T = new (...args: any[]) => T,
		TEntry extends T | RawCommand | RawKey | RawShortcut = T | RawCommand | RawKey | RawShortcut,
	>(type: TClass, plugins: Plugin<any, any>[] | undefined, key: TKey, entry: TEntry): T {
		let instance: any
		const isInstance = (entry instanceof type)

		const arg = entry[key as keyof TEntry]

		const opts = entry.opts

		const entryInfo = (entry as any).info
		if (plugins && plugins.length > 0) {
			if (isInstance) {
				instance = entry
				instance._addPlugins(plugins)
			} else {
				instance = new type(arg, opts, entryInfo, plugins)
			}
		} else {
			instance = isInstance
			? entry
			: new type(arg, opts)
		}

		return instance
	}
}
