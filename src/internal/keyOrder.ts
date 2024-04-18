import type { Key, KEY_SORT_POS, KeySortPos } from "../types/index.js"
import { isMouseKey } from "../utils/isMouseKey.js"
import { isWheelKey } from "../utils/isWheelKey.js"


/**
	*
 * Determines the key order position based on a key's type and the given {@link KeySortPos}
 */
export function keyOrder(
	key: Key,
	dictOrEnum: KeySortPos
): number {
	let type = [
		key.isModifier ? "mod" : "",
		key.isToggle ? "toggle" : "",
		isMouseKey(key) ? "mouse" : "",
		isWheelKey(key) ? "wheel" : "",
	].join("")
	if (type === "") {
		type = "normal"
	}
	return dictOrEnum[type as keyof typeof KEY_SORT_POS]
}
