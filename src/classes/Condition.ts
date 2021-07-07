import { mixin } from "@alanscodelog/utils"

import type { Context } from "./Context"
import type { Plugin } from "./Plugin"

import { Plugable } from "@/mixins"
import type { ConditionOptions, DeepPartialObj, Optional, PluginsInfo } from "@/types"
import { PLUGABLE_CONSTRUCTOR_KEY } from "@/types"


/**
 * The base class doesn't really do anything except provide a standardized way to wrap conditions and trigger their evaluation.
 *
 * Conditions require a text representation. If you need an additional representation or information stored, you can use a plugin.
 *
 * You will need to provide an evaluation method.
 *
 * You can also provide an optional equality method, though unless you're using simple single variable conditions (i.e. not boolean expressions) you will probably want to just let the default method return true.
 *
 * Why? Because two conditions might be functionally equal but have differing representations (e.g: `a && b`, `b && a`). Normalizing them (converting them to CNF) can be dangerous with very long expressions because it can take exponential time.
 *
 * The main reason you might want to check the equality of two conditions is when checking the equality of two shortcuts to see if they might conflict. The simpler alternative is to not try to do this. Instead when the user triggers more than one shortcut, only trigger the first and display a warning regarding the others.
 */
export class Condition<
	TPlugins extends
		Plugin<any>[] =
		Plugin<any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
	TOpts extends
		ConditionOptions=
		ConditionOptions,
> {
	text!: string
	#eval: (self: Condition, context: Context) => boolean
	#equals?: (self: Condition, condition: Condition) => boolean = () => true
	constructor(
		text: string,
		opts?: TOpts,
	)
	constructor(
		text: string,
		opts: Optional<TOpts>,
		info: DeepPartialObj<TInfo>,
		plugins: TPlugins
	)
	constructor(
		text: string,
		opts: TOpts,
		info?: TInfo,
		plugins?: TPlugins,
	) {
		this.text = text
		this.#eval = opts.eval
		this.#equals = opts.equals ?? this.#defaultEquals
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		this[PLUGABLE_CONSTRUCTOR_KEY](plugins, info, undefined)
	}
	#defaultEquals(): boolean {
		return true
	}
	/** Evals the condition against a context. */
	eval(context: Context): boolean {
		return this.#eval(this, context)
	}
	/**
	 * Returns the condition is equal to another.
	 *
	 * Note if no `equals` option was passed it always returns true.
	 */
	equals(condition: Condition): boolean {
		if (this.#equals) {
			return this.#equals(this, condition)
		} else return true
	}
	get opts(): ConditionOptions {
		return { eval: this.#eval, equals: this.#equals }
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Condition<TPlugins, TInfo, TOpts> extends Plugable<TPlugins, TInfo> { }
mixin(Condition, [Plugable])

