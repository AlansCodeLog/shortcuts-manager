import type { OrToAnd } from "@utils/types"

import type { Plugin } from "@/classes"


/** Can tell you the properties a Plugin would add to the class's info property. In combination with OrToAnd can be used to get all the properties an array of Plugins would return. */
export type PluginInfo<T extends Plugin<any>> = T extends Plugin<any, any, string> ? Record<T["namespace"], T["defaults"]> : T["defaults"]


/** Same as [[PluginInfo]], but for multiple plugins. */
export type PluginsInfo<T extends Plugin<any>[]> = OrToAnd<PluginInfo<T[number]>>

// @ts-expect-error todo
export type PluginOpts<T> = {
	// on: {
	// 	before: {
	// 		/** Should throw if the entry should not be allowed to be added. */
	// 		add?: (dict: Record<string, T>, entry: T | any) => void
	// 	}
	// 	/** Should throw if the entry should not be allowed to be initialized. */
	// 	init?: (entry: T) => void
	// }
}

