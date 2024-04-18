import { updateNativeKeysState } from "../internal/updateNativeKeysState.js"
import type { AnyInputEvent, Manager } from "../types/index.js"

/**
	* Force the manager to update the state of modifier/toggle keys during a keyboard or mouse event.
	*/
export function forceUpdateNativeKeysState(manager: Manager, e: AnyInputEvent): void {
	updateNativeKeysState(manager, e)
}
