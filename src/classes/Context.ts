import type { RecursiveRecord } from "types/index.js"

import type { Condition } from "./Condition.js"


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
	TValue extends {} = RecursiveRecord,
> {
	/** Where the context object is stored. */
	value: TValue

	/**
	 * # Context
	 *
	 * Like {@link Condition}, provides a way to descrive contexts.
	 *
	 * Contexts describe the relevant application state. They are what {@link Condition}s are evaluated against.
	 *
	 * @template TValue **@internal** Captures the type of the context value.
	 * @param context See {@link Context.value}
	 */
	constructor(
		context: TValue,
	) {
		this.value = context
	}

	/**
	 * Returns whether the context passed is equal to this one.
	 *
	 * The default methods provides a simple comparison that can handle simple flat or nested objects (simple as in it assumes values are not arrays). If you need something more complex you will need to extend from the class and override the method.
	 */
	equals(context: Context<any>): context is Context<TValue> {
		return fastIsEqual(this.value, context.value)
	}

	/**
	 * A wrapper around the parameter's eval function if you prefer to write `context.eval(condition)` instead of `condition.eval(context)`
	 */
	eval(condition: Condition): boolean {
		return condition.eval(this)
	}

	export(): Pick<Context, "value"> {
		return { value: this.value }
	}
}
