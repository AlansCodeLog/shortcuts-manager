import type { Key } from "../classes/index.js"

import { isMouseKey } from "./isMouseKey.js"
import { isToggleKey } from "./isToggleKey.js"
import { isWheelKey } from "./isWheelKey.js"


/**
 * Returns whether a key is a normal key (it is not a modifier, mouse, wheel, or toggle key).
 */
export function isNormalKey(key: Key): boolean {
	return !isWheelKey(key)
		&& !isMouseKey(key)
		&& !key.is.modifier
		&& !isToggleKey(key)
}
