import { isEqual, merge } from "lodash"

import type { PluginOpts } from "@/types"


/**
 * Creates a plugin for use with any instance.
 *
 * Plugins are used to define additional properties on each key, shortcut, etc (under their info property).
 *
 * This class is made up of the information needed to define what the plugin does and a dictionary/object of override values.
 *
 * Between the two, they allow for easily creating sets of keys/shortcuts/etc by defining some defaults and then only the overrides per key.
 */
export class Plugin<
	TOverrides extends Record<string, TInfo> | undefined = undefined,
	TInfo = any,
	TNamespace extends string | false = string | false,
> {
	/** The namespace in which the properties are declared on the info property of the instance. */
	readonly namespace: TNamespace
	/** The default values that are assigned to each property if it's undefined. */
	defaults: TInfo
	/**
	 * An object of `{key: overrides}` to use when instantiating an instance. Where `key` is a key's id or a command's name, (this does not work with shortcuts since they aren't unique).
	 *
	 * For example:
	 * ```ts
	 * let defaults = { myprop: "default" }
	 * let overrides = {
	 * 	a: { myprop: "override" }
	 * 	b: { myprop: "override" }
	 * 	...
	 * }
	 * let plugin = new Plugin(namespace, defaults, init, equals, overrides)
	 *
	 * let key = new Key("a", {}, {}, [plugin])
	 * key.a.info[namespace].myprop // "override"
	 *
	 * let key2 = new Key("a", {}, { myprop: "highest override" }, [plugin])
	 * key2.a.info[namespace].myprop // "highest override"
	 * ```
	 *
	 * Although usually it would be used with a collection:
	 *
	 * ```ts
	 * let keys = new Keys([], {}, [plugin])
	 * keys.add({ id: "a" })
	 * keys.get("a").info[namespace].myprop // override
	 * ```
	 */
	overrides: TOverrides
	constructor(
		namespace: TNamespace,
		defaults: TInfo,
		overrides?: TOverrides,
	) {
		this.defaults = defaults

		this.namespace = namespace

		this.overrides = overrides!
	}
	init(obj: Partial<TInfo>, defaults: TInfo, overrides: Partial<TInfo>): TInfo {
		return merge({}, defaults, overrides, obj)
	}
	equals(obj1: TInfo, obj2: TInfo): boolean {
		return isEqual(obj1, obj2)
	}
}


export const defaultPluginOpts: PluginOpts<any> = {
}
