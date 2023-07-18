import type { Key } from "classes/index.js"


/**
 * Returns whether a key is the off version of a toggle key.
 */
export function isToggleOffKey(key: Key): boolean {
	return key.is.toggle !== false && key.root?.off === key
}
