import type { Context } from "./Context"
import type { Plugin } from "./Plugin"

import { MixinPlugableBase } from "@/mixins"
import type { ConditionOptions, DeepPartialObj, Optional, PluginsInfo } from "@/types"


const sEval = Symbol("eval")
const sEquals = Symbol("equals")

export class Condition<
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
	PluginsInfo<TPlugins>,
	TOpts extends
		ConditionOptions<TPlugins, TInfo> =
		ConditionOptions<TPlugins, TInfo>,
> extends MixinPlugableBase<TPlugins, TInfo> {
	/**
	 * The main text representation of the condition. Note that this is NOT a unique identifier for conditions and cannot be used to compare them if you are using boolean expressions for your conditions. See {@link Condition.constructor} for an explanation.
	 */
	text!: string
	[sEval]: ConditionOptions<TPlugins, TInfo>["eval"]
	[sEquals]: ConditionOptions<TPlugins, TInfo>["equals"]
	/**
	 * # Condition
	 * Create a condition.
	 *
	 * This class doesn't really do anything except provide a standardized way to wrap conditions. They do not implement any evaluation. Those must be implemented by you or some external library. You can then pass an `eval` function to tell the class how to eval your condition.
	 *
	 * Conditions require a text representation. If you need an additional representation (e.g. to store a parsed condition) or other information stored, you can use a plugin.
	 *
	 * ```ts
	 * // suppose we have an external library with the following interface:
	 * class BooleanExpression {
	 * 	...
	 * 	evaluate(context: Record<string, boolean>): boolean { ... }
	 * }
	 * ```
	 *
	 * Now since expression is not a primitive type, we do not want to do not want to set the default value to `new BooleanExpression()` because it will get assigned everywhere and if you treat the property as mutable... chaos.
	 *
	 * Instead we can set it to `undefined` and pass the type expression could be as the first type parameter. You will also need to do this if a property can be multiple types.
	 *
	 * ```ts
	 * // for this plugin, expression should be a 1:1 representation of the text
	 * const equals = () => true
	 *
	 * const conditionPlugin = new Plugin<{ expression: BooleanExpression | undefined }> (false, { expression: undefined }, {}, {equals})
	 * // You could also cast the properties, but it's not as safe
	 * const conditionPlugin = new Plugin(false, { expression: undefined as BooleanExpression | undefined }, {})
	 *
	 * // We save the eval function to pass again to other conditions, because it's no longer inline, we need to type it
	 * // Don't pass [typeof conditionPlugin, typeof otherPlugin] for the type parameter it will cause issues
	 * const conditionEval: ConditionOptions<(typeof conditionPlugin | typeof otherPlugin)[]>["eval"] =
	 * 	(self, context) => self.info.expression?.evaluate(context.variables) //autocompletes
	 *
	 * const condition = new Condition("a", { eval: conditionEval }, { expression: new BooleanExpression("a") }, [conditionPlugin])
	 * ```
	 *
	 * @template TPlugins **@internal** See {@link PlugableBase}
	 * @template TInfo **@internal** See {@link PlugableBase}
	 * @param text See {@link Condition.text}
	 * @param opts See {@link ConditionOptions}
	 * @param info See {@link Condition.info}
	 * @param plugins See {@link Condition.plugins}
	 */
	constructor(
		text: string,
		opts?: Optional<TOpts>,
	)
	constructor(
		text: string,
		opts: Optional<TOpts>,
		info: DeepPartialObj<TInfo>,
		plugins: TPlugins
	)
	constructor(
		text: string,
		opts: Optional<TOpts> = {} as TOpts,
		info?: TInfo,
		plugins?: TPlugins,
	) {
		super()
		this.text = text
		if (opts.eval) this[sEval] = opts.eval
		if (opts.equals) this[sEquals] = opts.equals
		this._mixin({
			plugableBase: { plugins, info, key: undefined },
		})
	}
	/**
	 * Evals the condition against a context.
	 *
	 * If the class was not passed an `eval` method, the method always returns true.
	 *
	 * See {@link ConditionOptions.eval} for more details.
	 */
	eval(context: Context): boolean {
		if (this[sEval]) return this[sEval]!(this, context)
		return true
	}
	/**
	 * Returns whether the condition passed is equal to this one.
	 *
	 * To return true, they must be equal according to the instance the method is called from, and they must be equal according to their plugins.
	 *
	 * see {@link ConditionOptions.equals}
	 */
	equals(condition: Condition): boolean {
		if (this[sEquals]) return this[sEquals]!(this, condition) && this.equalsInfo(condition)
		if (this === condition) return true
		return this.text === condition.text && this.equalsInfo(condition)
	}
	get opts(): ConditionOptions<TPlugins, TInfo> {
		return { eval: this[sEval], equals: this[sEquals] }
	}
}

// export interface Condition<TPlugins, TInfo> extends PlugableBase<TPlugins, TInfo> { }
// mixin(Condition, [Plugable, PlugableBase])

