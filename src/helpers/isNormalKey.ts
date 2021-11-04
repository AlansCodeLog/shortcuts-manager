import type { Key } from "@/classes"
import { isMouseKey } from "."
import { isToggleKey } from "./isToggleKey"
import { isWheelKey } from "./isWheelKey"



/**
 * Returns whether a key is a normal key (it is not a modifier, mouse, wheel, or toggle key).
 */
export function isNormalKey(key: Key): boolean {
	return !isWheelKey(key)
		&& !isMouseKey(key)
		&& !key.is.modifier
		&& !isToggleKey(key)
}
