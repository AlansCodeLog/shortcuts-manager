import type { Condition } from "./Condition"

/**
 * Create a simple context that looks like `Record<string, boolean>`.
 *
 * If you need something more complex, you will need to extend from the class and provide your `equals` method.
 */
export class Context<
	T extends
		Record<string, boolean> =
		Record<string, boolean>,
> {
	variables: T
	constructor(context: T) {
		this.variables = context
	}
	equals(context: Context): context is Context<T> {
		const thisKeys = Object.keys(this.variables)
		const otherKeys = Object.keys(context.variables)
		if (thisKeys.length !== otherKeys.length) return false
		for (const key of thisKeys) {
			const value = this.variables[key]
			const otherValue = context.variables[key]
			if (value !== otherValue) return false
		}
		return true
	}
	/** A wrapper around the parameter's eval function if you prefer to write `context.eval(condition)` instead of `condition.eval(context)` */
	eval(condition: Condition): boolean {
		return condition.eval(this)
	}
}
