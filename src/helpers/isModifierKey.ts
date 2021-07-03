import type { Key } from "@/classes"

/**
 * Returns whether a key is a modifier key (emulated or native).
 */
export function isModifierKey(key: Key): boolean {
	return key.is.modifier !== false
}
