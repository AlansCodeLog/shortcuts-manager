import type { Plugin } from "@/classes"
import type { OrToAnd } from "@utils/types"



/** Can tell you the properties a Plugin would add to the class's info property. In combination with OrToAnd can be used to get all the properties an array of Plugins would return. */
export type PluginInfo<T extends Plugin<any, any>> = T extends Plugin<any, any, string> ? Record<T["namespace"], T["defaults"]> : T["defaults"]


/** Same as [[PluginInfo]], but for multiple plugins. */
export type PluginsInfo<T extends Plugin<any, any>[]> = OrToAnd<PluginInfo<T[number]>>

export type PluginOptions<
	TInfo = any,
> = {
	/**
	 * Override the default init method of a plugin. Note this is passed all the info properties, not the entire class or overrides. i.e. the info property passed to the class being created, the defaults, and the corresponding override.
	 *
	 * The order of priority should be: defaults(lowest), overrides, obj(highest).
	 */
	init?(obj: Partial<TInfo>, defaults: TInfo, overrides: Partial<TInfo>): TInfo
	/**
	 * Override the default equals method of a plugin. This should be done for an condition plugins if the {@link Condition} uses boolean expressions. See {@link Condition.constructor} for why.
	 *
	 * Note that either info object passed could be undefined. This is because the function could be used to compare in situations were one instance has the plugin and the other doesn't.
	 */
	equals?(obj1: TInfo | undefined, obj2: TInfo | undefined): boolean
}

