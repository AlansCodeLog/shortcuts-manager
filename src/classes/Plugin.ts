import { isEqual, merge } from "lodash"

import type { PluginOptions } from "@/types"


export class Plugin<
	TInfo = any,
	TOverrides extends Record<string, TInfo> | undefined = undefined,
	TNamespace extends string | false = string | false,
> {
	#equals: PluginOptions<TInfo>["equals"]
	#init: PluginOptions<TInfo>["init"]
	/** The namespace in which the properties are declared on the info property of the instance. */
	readonly namespace: TNamespace
	/** The default values that are assigned to each property if it's undefined. */
	defaults: TInfo
	/**
	 * An object of `{[key]: overrides}` to use when instantiating an base class instance. Where `key` is a key's id or a command's name, (this does not work with shortcuts, contexts, conditions, etc, since they don't have unique keys they cn be keyed by).
	 *
	 * For example:
	 * ```ts
	 * let defaults = { myprop: "default" }
	 * let overrides = {
	 * 	a: { myprop: "override" }
	 * 	b: { myprop: "override" }
	 * 	...
	 * }
	 *
	 * let plugin = new Plugin(namespace, defaults, overrides)
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
	/**
	 * Creates a plugin for use with any instance.
	 *
	 * Plugins are used to define additional properties on each key, shortcut, etc (under their info property).
	 *
	 * This class is made up of the information needed to define what the plugin does and a dictionary/object of override values. You can also optionally override the `equals` and `init` methods if needed (see {@link PluginOptions}).
	 *
	 * Between the two, they allow for easily creating sets of keys/shortcuts/etc by defining some defaults and then only the overrides per key.
	 */
	constructor(
		namespace: TNamespace,
		defaults: TInfo,
		overrides?: TOverrides,
		opts?: PluginOptions<TInfo>
	) {
		this.defaults = defaults

		this.namespace = namespace

		this.overrides = overrides!
		this.#equals = opts?.equals ?? isEqual
		this.#init = opts?.init ?? this.#defaultInit
	}
	#defaultInit(obj: Partial<TInfo>, defaults: TInfo, overrides: Partial<TInfo>): TInfo {
		return merge({}, defaults, overrides, obj)
	}
	/**
	 * Inits a plugin on an object or class according to the plugin.
	 *
	 * Unless the plugin was created with a custom `init` method (see {@link PluginOptions.init}), the default method uses lodash's `merge` to merge like `merge({}, defaults, overrides, obj)`.
	 */
	init(obj: Partial<TInfo>, defaults: TInfo, overrides: Partial<TInfo>): TInfo {
		return this.#init(obj, defaults, overrides)
	}
	/**
	 * Returns if two info properties are equal according to the plugin.
	 *
	 * Unless the plugin was created with a custom `init` method (see {@link PluginOptions.equals}), the default method uses lodash's `isEqual` function.
	 */
	equals(obj1: TInfo, obj2: TInfo): boolean {
		return this.#equals(obj1, obj2)
	}
}
