import type { Key } from "classes/index.js"
import type { KEY_SORT_POS } from "types/index.js"

import { isModifierKey } from "./isModifierKey.js"
import { isMouseKey } from "./isMouseKey.js"
import { isToggleKey } from "./isToggleKey.js"
import { isWheelKey } from "./isWheelKey.js"


/**
 * The default key ordering function.
 */
export function keyOrder(key: Key, dictOrEnum: typeof KEY_SORT_POS | Record<keyof typeof KEY_SORT_POS, number>): number {
	// const is = key.is
	let type = [
		isModifierKey(key) ? "mod" : "",
		isToggleKey(key) ? "toggle" : "",
		isMouseKey(key) ? "mouse" : "",
		isWheelKey(key) ? "wheel" : "",
	].join("")
	if (type === "") {
		type = "normal"
	}
	return dictOrEnum[type as keyof typeof KEY_SORT_POS]
}
