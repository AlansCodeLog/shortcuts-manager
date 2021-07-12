import type { Key } from "@/classes"

/**
 * Returns whether a key is a toggle key (this returns true for `root`, `on`, and `off`).
 */
export function isModifierKey(key: Key): boolean {
	return key.is.modifier === true
}
