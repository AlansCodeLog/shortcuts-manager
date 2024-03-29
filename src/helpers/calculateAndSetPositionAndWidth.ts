import type { RawKey } from "../types/index.js"

/**
 * Auto calculate and set the x positions of a row of raw keys based on their width if set (otherwise width is set to 1). If the key already has an x position it takes priotity and "shifts" the rest of the keys.
 */
export function calculateAndSetPositionAndWidth<
	T extends RawKey,
>(row: readonly T[]): RawKey<T["id"]>[] {
	let x = 0
	for (const key of row) {
		key.opts = key.opts! ?? {} as any
		if (key.opts.x) x = key.opts.x
		key.opts.x = x
		if (key.opts?.width) {
			x += key.opts.width
		} else {
			key.opts.width = 1
			x++
		}
	}
	return row as any
}
