import { isMouseKey } from "./isMouseKey.js"
import { isWheelKey } from "./isWheelKey.js"

import type { Key } from "../types/index.js"


/**
 * Returns whether a key is a key (and not a mouse button or mouse wheel).
 */
export function isAnyKey(key: Key): boolean {
	return !isWheelKey(key) && !isMouseKey(key)
}
