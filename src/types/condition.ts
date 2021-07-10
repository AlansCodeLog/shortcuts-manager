import type { PluginsInfo } from "./plugin"

import type { Condition, Context, Plugin } from "@/classes"


/**
 *	{@link Condition}'s options.
 *
 * Can be used to type the options to pass to a Condition.
 *
 * ```ts
 *  const conditionEval: ConditionOptions<(typeof somePlugin | typeof otherPlugin)[]>["eval"] =
 * 	(self, context) => self.info. //autocompletes correctly
 *
 * const condition = new Condition("a", { eval: conditionEval }, { }, plugins)
 * ```
 *
 * Note: Do NOT pass the type parameter like `[typeof somePlugin, typeof otherPlugin]`, it needs to be an array of a union of plugin types.
 */
export type ConditionOptions<
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
> = {
	/**
	 * By default all conditions just eval to true. You must pass this option to actually tell the class how to evaluate an option.
	 *
	 * For example, you might use a plugin to store a representation of the condition and call it's eval method.
	 */
	eval?: (self: Condition<TPlugins, TInfo>, context: Context) => boolean
	/**
	 * By default, all conditions only check any plugin properties according to the plugin's equals method. Otherwise (e.g. no plugins are being used) they are all considered equal.
	 *
	 * Unless you're using simple single variable conditions (i.e. not boolean expressions) you will probably want to just use the default behavior and pass an `equals` method to plugins that always returns true.
	 *
	 * Why? Because two conditions might be functionally equal but have differing representations (e.g: `a && b`, `b && a`). Normalizing them (converting them to CNF) can be dangerous with very long expressions because it can take exponential time.
	 *
	 * The main reason you might want to check the equality of two conditions is to check if two shortcuts might conflict. The simpler alternative is to not try to do this. Instead when the user triggers more than one shortcut, only trigger the first and display a warning regarding the others.
	 *
	 * If you do decide to implement a custom method, note, it will have to call {@link PlugableBase.equalsInfo equalsInfo} itself.
	 */
	equals?: (self: Condition<TPlugins, TInfo>, condition: Condition) => boolean
}
