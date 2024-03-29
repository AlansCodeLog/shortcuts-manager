import type { Key } from "../classes/index.js"


/**
 * Returns whether a key a toggle on/off key (not root).
 */
export function isToggleStateKey(key: Key): boolean {
	return key.is.toggle !== false && key.root !== undefined
}
