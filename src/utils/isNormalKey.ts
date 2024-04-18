import { isMouseKey } from "./isMouseKey.js"
import { isWheelKey } from "./isWheelKey.js"

import type { Key } from "../types/index.js"


/**
 * Returns whether a key is a normal key (it is not a modifier, mouse, wheel, or toggle key).
 */
export function isNormalKey(key: Key): boolean {
	return !isWheelKey(key)
		&& !isMouseKey(key)
		&& !key.isModifier
		&& !key.isToggle
}
