import type { Key } from "../classes/index.js"


/**
 * Returns whether a key is the on version of a toggle key.
 */
export function isToggleOnKey(key: Key): boolean {
	return key.is.toggle !== false && key.root?.on === key
}
