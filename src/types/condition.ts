import type { Condition, Context, Plugin } from "@/classes"
import type { PluginsInfo } from "./plugin"

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
	 * By default, all conditions will check their `text` property for equality.
	 *
	 * Now, unless you're using simple single variable conditions that you can presort to make them uniquely identifiable (i.e. not boolean expressions, e.g. `!a b !c`), this will return A LOT of false negatives, to the point you might just want the equals method to always return false.
	 *
	 * Why the false negatives? Because two conditions might be functionally equal but have differing representations (e.g: `a && b`, `b && a`). You might think, okay, lets normalize them all, but normalizing boolean expressions (converting them to CNF) can be dangerous with very long expressions because it can take exponential time.
	 *
	 * Why make this return false? Well, the main reason for checking the equality of two conditions is usually to check if two shortcuts might conflict. This is a personal preference, but it can be confusing that some shortcuts immediately error because they're duplicates, while others that feel like they should don't. The simpler, more consistent alternative is to instead just wait for the user to trigger more than one shortcut, only trigger the first and display a warning regarding the others. Also conflicting conditions can be shown on the keyboard layout *when* then user picks contexts to check against.
	 *
	 * Why use the default implementation at all then? Well, shortcuts aren't the only ones that have conditions, commands can too, but unlike shortcuts, usually it's developers who are in charge of assigning a command's condition, and since they are usually simple, it's more possible to make sure the conditions are unique (e.g. tests could enforce they're unique by converting them all to CNF and pre-checking them for equality).
	 */
	equals?: (self: Condition<TPlugins, TInfo>, condition: Condition) => boolean
}
