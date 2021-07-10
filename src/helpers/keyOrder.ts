import type { Key } from "@/classes"
import type { KEY_SORT_POS } from "@/types"

/**
 * The default key ordering function.
 */
export function keyOrder(key: Key, dictOrEnum: typeof KEY_SORT_POS | Record<keyof typeof KEY_SORT_POS, number>): number {
	const is = key.is
	let type = [
		is.modifier ? "mod" : "",
		is.toggle ? "toggle" : "",
		["0", "1", "2", "3", "4"].includes(key.id) ? "mouse" : "",
		["WheelUp", "WheelDown"].includes(key.id) ? "wheel" : "",
	].join("")
	if (type === "") {
		type = "normal"
	}

	return dictOrEnum[type as keyof typeof KEY_SORT_POS]
}