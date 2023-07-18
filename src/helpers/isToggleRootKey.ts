import type { Key } from "classes/index.js"


/**
 * Returns whether a key is the root key of a toggle key.
 */
export function isToggleRootKey(key: Key): boolean {
	return key.is.toggle !== false && key.root === undefined
}
