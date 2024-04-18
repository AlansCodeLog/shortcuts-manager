import { getKeyFromIdOrVariant } from "./getKeyFromIdOrVariant.js"

import { addToChain } from "../internal/addToChain.js"
import { setKeysState } from "../internal/setKeysState.js"
import type { Manager } from "../types/index.js"

/**
 * The manager is not designed to react to setting a key's pressed state directly only to events to then set the key state.
 *
 * So this method is provided to allow a "virtual" press (i.e. by some method that is not a real key press such as directly clicking on a visual representation of the key), without having to use the Emulator.
 *
 * It takes care of changing the key press state, and adding the key to the chain.
 *
 * Note that it is more simplistic and less "precise" than the emulator. It will ignore the type of toggles (native toggles will be treated as emulated). If using {@link Manager.options.updateStateOnAllEvents}, you will probably want to temporarily disable it or the state of the key press might get immediately reset.
 *
 * There is also {@link virtualRelease} and {@link virtualToggle}.
 */
export function virtualPress(
	manager: Manager,
	keyIdOrVariant: string,
): void {
	const res = getKeyFromIdOrVariant(keyIdOrVariant, manager.keys)
	if (res.isError) {
		manager.options.cb(manager, res.error)
		return
	}
	const key = res.value[0]
	const keys = [key.id]

	manager.listener?.({ isKeydown: true, keys, manager })
	setKeysState(keys, manager, true, { ignoreToggleType: true })
	addToChain(manager, keys, undefined)
}

