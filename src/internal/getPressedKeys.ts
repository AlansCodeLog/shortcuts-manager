import type { Manager } from "../types/index.js"

/**
 * A list of currently pressed keys for convenience.
 *
 * It's just a wrapper around querying the key set for pressed keys.
 */
export function getPressedKeys(manager: Pick<Manager, "keys">): string[] {
	const res: string[] = []
	for (const keyId of Object.keys(manager.keys.entries)) {
		const key = manager.keys.entries[keyId]
		if (key.pressed) {
			res.push(key.id)
		}
		if (key.isToggle) {
			if (key.toggleOnPressed) {
				res.push(key.toggleOnId)
			}
			if (key.toggleOffPressed) {
				res.push(key.toggleOffId)
			}
		}
	}
	return res
}

