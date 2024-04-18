import { multisplice } from "@alanscodelog/utils/multisplice.js"

import { addToChain } from "./addToChain.js"
import { getModifierState } from "./getModifierState.js"
import { removeFromChain } from "./removeFromChain.js"
import { safeSetEmulatedToggleState } from "./safeSetEmulatedToggleState.js"

import { KnownError } from "../helpers/KnownError.js"
import { setKeyProp } from "../setKeyProp.js"
import type { AnyInputEvent, Manager } from "../types/index.js"
import { ERROR } from "../types/index.js"

/**
 * Should be used after we attempt to process the event and set key states.
 *
 * This should cause it to only actually change the state if it was changed off-focus.
 *
 * Technically not neccesary with wheel/mouse events, but ordered similarly for consistency.
 *
 * Modifiers need to be added/removed from the chain on changes, but not toggles.
 *
 * Mutates the passed keys array to remove processed keys.
 *
 */
export function updateNativeKeysState(
	manager: Manager,
	e: AnyInputEvent,
	keyIds: string[] = [],
): void {
	const s = manager.options.stringifier
	for (const id of manager.keys.nativeToggleKeys) {
		const key = manager.keys.entries[id]
		if (key.toggleOnPressed && key.toggleOffPressed) {
			throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${s.stringify(key, manager)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key })
		}
		// this does not guarantee the key code is valid
		// it just returns false even for made up keys
		const modifierState = getModifierState(key, e, manager)
		

		if (modifierState === null) continue
		if (modifierState) {
			if (!key.toggleOnPressed) {
				safeSetEmulatedToggleState(key, true, manager)
			}
		} else {
			if (key.toggleOnPressed) {
				safeSetEmulatedToggleState(key, false, manager)
			}
		}
	}
	const added: string[] = []
	const removed: string[] = []
	for (const id of manager.keys.nativeModifierKeys) {
		const key = manager.keys.entries[id]
		const modifierState = getModifierState(key, e, manager)
		if (modifierState === null) continue
		if (modifierState) {
			if (!key.pressed) {
				if (setKeyProp(key, "pressed", true, manager).isOk) {
					added.push(id)
				}
			}
		} else {
			if (key.pressed) {
				if (setKeyProp(key, "pressed", false, manager).isOk) {
					removed.push(id)
				}
			}
		}
	}

	if (added.length > 0) {
		addToChain(manager, added, e)
		const indexes = keyIds.map(key => added.indexOf(key)).filter(i => i > -1)
		multisplice(keyIds, indexes)
	}
	if (removed.length > 0) {
		removeFromChain(manager, removed, e)
		const indexes = keyIds.map(key => added.indexOf(key)).filter(i => i > -1)
		multisplice(keyIds, indexes)
	}
}

