import type { Key } from "@/classes"
import type { KEY_SORT_POS } from "@/types"
import { isModifierKey } from "./isModifierKey"
import { isMouseKey } from "./isMouseKey"
import { isToggleKey } from "./isToggleKey"
import { isWheelKey } from "./isWheelKey"

/**
 * The default key ordering function.
 */
export function keyOrder(key: Key, dictOrEnum: typeof KEY_SORT_POS | Record<keyof typeof KEY_SORT_POS, number>): number {
	const is = key.is
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
