import type { Manager } from "../types/index.js"
import { isTriggerKey } from "../utils/isTriggerKey.js"

/**
 * A list of currently pressed non-modifier keys. They can't be toggle state keys (i.e. `on`/`off`) either.
 *
 * This determines whether when we await keyup and when a new chord should be added.
 */
export function getPressedNonModifierKeys(manager: Pick<Manager, "keys">): string[] {
	const res: string[] = []
	for (const keyId of Object.keys(manager.keys.entries)) {
		const key = manager.keys.entries[keyId]
		if (key.pressed && isTriggerKey(manager.keys.entries[keyId])) {
			res.push(key.id)
		}
	}
	return res
}

