import type { Condition } from "../types/index.js"

/**
 * Returns whether the condition passed is equal to this one.
 *
 * The default method does a simplistic object check, and otherwise a  check of the `text` property for equality. If both conditions are undefined, note this will return true.
 *
 * If you override the default conditionEquals option you will likely want it to just always return false.
 *
 * Why? Because unless you're using simple single variable conditions that you can presort to make them uniquely identifiable (i.e. not boolean expressions, e.g. `!a b !c`), this will return A LOT of false negatives.
 *
 * Why the false negatives? Because two conditions might be functionally equal but have differing representations (e.g: `a && b`, `b && a`). You might think, lets normalize them all, but normalizing boolean expressions (converting them to CNF) can be dangerous with very long expressions because it can take exponential time.
 *
 * Now the main reason for checking the equality of two conditions is to check if two shortcuts might conflict. If we're using boolean expressions it just can't be done safely.
 *
 * This is a personal preference, but if we have a method that gives false negatives it can be confusing that some shortcuts immediately error when added because their conditions are simple, while others don't until triggered. The simpler, more consistent alternative is to only have them error on triggering. Aditionally conflicting conditions can be shown on the keyboard layout when then user picks contexts to check against.
 *
 * Why use the default implementation at all then? Well, shortcuts aren't the only ones that have conditions, commands can too, but unlike shortcuts, usually it's developers who are in charge of assigning a command's condition, and since they are usually simple, it's more possible to make sure the conditions are unique (e.g. tests could enforce they're unique by converting them all to CNF and pre-checking them for equality).
 */
export function defaultConditionEquals<TCondition extends Condition>(
	conditionA?: TCondition,
	conditionB?: Condition
): conditionB is TCondition {
	// both are the same object or both undefined
	if (conditionA === conditionB) return true
	// one if undefined
	if (!conditionA || !conditionB) return false
	return conditionA.text === conditionB.text
}
