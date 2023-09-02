import { isMouseKey } from "./isMouseKey.js"
import { isWheelKey } from "./isWheelKey.js"

import type { Key } from "../classes/index.js"


/**
 * Returns whether a key is a key (anot not a mouse button or mouse wheel).
 */
export function isAnyKey(key: Key): boolean {
	return !isWheelKey(key) && !isMouseKey(key)
}
