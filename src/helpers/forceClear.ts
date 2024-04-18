import { setKeyProp } from "../setKeyProp.js"
import { setManagerProp } from "../setManagerProp.js"
import type { Manager } from "../types/index.js"

/**
 * Force clears/resets all state. Clears the chain and sets all keys to unpressed.
 *
 * Useful for testing.
 *
 * @param opts
 * @param {false} opts.ignoreNative  If true, does not change state of native modifier/toggle keys.
 */


export function forceClear(manager: Manager, { ignoreNative = false }: { ignoreNative?: boolean } = {}): void {
	setManagerProp(manager, "state.chain", [])
	setManagerProp(manager, "state.nextIsChord", true)
	setManagerProp(manager, "state.untrigger", false)
	setManagerProp(manager, "state.isAwaitingKeyup", false)

	for (const key of Object.values(manager.keys.entries)) {
		if ((key.isModifier === "native" || key.isToggle === "native") && ignoreNative) return
		setKeyProp(key, "pressed", false, manager)
		if (key.isToggle) {
			// safe not to check return because setting to false will never error
			setKeyProp(key, "toggleOnPressed", false, manager)
			setKeyProp(key, "toggleOffPressed", false, manager)
		}
	}
}

