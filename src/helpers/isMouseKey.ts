import type { Key } from "classes/index.js"

/**
 * Returns whether a key is a mouse key (id = 0-4).
 */
export function isMouseKey(key: Key): boolean {
	return [
		"0",
		"1",
		"2",
		"3",
		"4",
		"0On",
		"1On",
		"2On",
		"3On",
		"4On",
		"0Off",
		"1Off",
		"2Off",
		"3Off",
		"4Off",
	].includes(key.id)
}
