import type { AnyInputEvent, Key, PickManager } from "../types/index.js"


export function getModifierState(
	key: Key,
	e: AnyInputEvent,
	manager: PickManager<"options", "updateStateOnAllEvents">
): boolean | null {
	if (!manager.options.updateStateOnAllEvents || !key.updateStateOnAllEvents) return null
	for (const code of [key.id, ...key.variants ?? []]) {
		if ("getModifierState" in e && e.getModifierState(code)) return true
	}
	return false
}

