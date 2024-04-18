import type { Condition } from "./types/index.js"


export function createCondition<TTextCondition extends string, TReturn extends Condition>(
	rawCondition: TTextCondition,
	/**
	 * Optionally modify the shape of the condition and add your own properties.
	 * For example, you can append a parsed AST like representation of the condition.
	 */
	parse?: (raw: TTextCondition, condition: Condition) => TReturn
): TReturn {
	let condition: Condition = {
		type: "condition",
		text: rawCondition ?? "",
	}
	if (parse) {
		condition = parse(rawCondition, condition)
	}
	return condition as any
}
