import { setReadOnly } from "@alanscodelog/utils/setReadOnly.js"

import type { RawKey } from "../types/keys.js"

/**
 * Auto calculate and set the x positions of a row of raw keys based on their width if set (otherwise width is set to 1). If the key already has an x position it takes priority and "shifts" the rest of the keys.
 *
 * Useful for creating layouts.
 *
 * This is for *RAW* keys, so it mutates the key directly without going through {@link setKeyProp}
 */
export function calculateAndSetPositionAndSize<
	T extends RawKey,
>(row: T[]): (T & { x: number, width: number, height: 1 })[] {
	let x = 0
	for (const key of row) {
		if (key.x) x = key.x
		setReadOnly(key, "x", x)
		if (key.width) {
			x += key.width
		} else {
			setReadOnly(key, "width", 1)
			x++
		}
		if (key.height === undefined) {
			setReadOnly(key, "height", 1)
		}
	}
	return row as any
}
