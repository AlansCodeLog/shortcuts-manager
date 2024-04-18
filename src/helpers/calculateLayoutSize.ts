import type { Key, Keys } from "../types/index.js"

/**
 * Returns the layout size in key units for a set of {@link Keys}. This will only look at keys which are set to ({@link Key.render}).
 *
 * See {@link Keys.autoManageLayout} and {@link Keys.layout}.
 *
 * This should be done after creating {@link Keys} then on any user changes to the size/pos properties of keys. You can hook into these changed with the manager's {@link Manager.hooks.onSetKeyProp}.
 */
export function calculateLayoutSize(keys: Keys): Keys["layout"] {
	let x = 0
	let y = 0
	for (const key of Object.values<Key>(keys.entries)) {
		if (key.render) {
			const xLimit = key.x + key.width
			x = xLimit > x ? xLimit : x
			const yLimit = key.y + key.height
			y = yLimit > y ? yLimit : y
		}
	}
	return { x, y }
}
