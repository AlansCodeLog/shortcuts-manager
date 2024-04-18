import type { Manager } from "../types/index.js"


export function getPressedModifierKeys(manager: Pick<Manager, "keys">): string[] {
	const res: string[] = []
	for (const keyId of Object.keys(manager.keys.entries)) {
		const key = manager.keys.entries[keyId]
		if (key.pressed && key.isModifier) {
			res.push(key.id)
		}
	}
	return res
}

