import { MixinPlugableBase } from "@/mixins"
import type { PluginsInfo } from "@/types"
import type { ContextOptions, RecursiveRecord } from "@/types/context"
import type { Condition } from "./Condition"
import type { Plugin } from "./Plugin"

const sEquals = Symbol("equals")

function fastIsEqual(obj: RecursiveRecord, other: RecursiveRecord): boolean {
	const keys1 = Object.keys(obj)
	const keys2 = Object.keys(other)
	if (keys1.length !== keys2.length) return false
	for (const key of keys1) {
		const val1 = obj[key]
		const val2 = other[key]
		if (typeof val1 === "object" && typeof val2 === "object") {
			if (!fastIsEqual(val1, val2)) return false
		}
		if (val1 !== val2) return false
	}
	return true
}

export class Context<
	TValue = RecursiveRecord,
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
> extends MixinPlugableBase<TPlugins, TInfo>{
	/** Where the context object is stored. */
	value: TValue
	[sEquals]: ContextOptions<TValue>["equals"]
	/**
	 * # Context
	 *
	 * Like {@link Condition}, provides a wrapper around contexts.
	 *
	 * Contexts describe the relevant application state. They are what {@link Condition}s are evaluated against.
	 *
	 * The class provides a default `equals` method that can do fast comparisons for simple flat or nested objects (simple as in it assumes values are not arrays).
	 *
	 * If you need something more complex, you can pass a custom `equals` method. See {@link ContextOptions} for details.
	 *
	 * @template TValue **@internal** Captures the type of the context value.
	 * @template TPlugins **@internal** See {@link PlugableBase}
	 * @template TInfo **@internal** See {@link PlugableBase}
	 * @param context See {@link Context.value}
	 * @param opts See {@link ContextOptions}
	 * @param info See {@link Context.info}
	 * @param plugins See {@link Context.plugins}
	 */
	constructor(
		context: TValue,
		opts: ContextOptions<TValue> = {},
		info?: TInfo,
		plugins?: TPlugins
	) {
		super()
		this.value = context
		if (opts.equals) this[sEquals] = opts.equals
		this._mixin({
			plugableBase: { plugins, info, key: undefined }
		})
	}
	/**
	 * Returns whether the context passed is equal to this one.
	 *
	 * To return true, their values must be equal according to the class (see {@link ContextOptions.equals}), and they must be equal according to their plugins.
	 */
	equals(context: Context<any, any, any>): context is Context<TValue, TPlugins, TInfo> {
		if (this[sEquals]) return this[sEquals]!(this, context) && this.equalsInfo(context)
		return fastIsEqual(this.value, context.value) && this.equalsInfo(context)
	}
	/** A wrapper around the parameter's eval function if you prefer to write `context.eval(condition)` instead of `condition.eval(context)` */
	eval(condition: Condition): boolean {
		return condition.eval(this)
	}
	get opts() {
		return { equals: this[sEquals] }
	}
}

// export interface Context<TValue, TPlugins, TInfo> extends PlugableBase<TPlugins, TInfo>, IgnoreUnusedTypes<[TValue]> { }
// mixin(Context, [Plugable, PlugableBase])
