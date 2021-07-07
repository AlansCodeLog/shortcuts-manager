import type { Key } from "@/classes"

/**
 * Returns whether a key is a normal key (it is not a modifier, mouse, wheel, or toggle key).
 */
export function isNormalKey(key: Key): boolean {
	const is = key.is
	return is.mouse === false
		&& is.wheel === false
		&& !is.modifier
		&& !is.toggle
}
