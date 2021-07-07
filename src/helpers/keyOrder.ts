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
		is.mouse !== false ? "mouse" : "",
		is.wheel !== false ? "wheel" : "",
	].join("")
	if (type === "") {
		type = "normal"
	}

	return dictOrEnum[type as keyof typeof KEY_SORT_POS]
}
