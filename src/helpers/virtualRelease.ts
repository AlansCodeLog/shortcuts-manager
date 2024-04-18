import { getKeyFromIdOrVariant } from "./getKeyFromIdOrVariant.js"

import { removeFromChain } from "../internal/removeFromChain.js"
import { setKeysState } from "../internal/setKeysState.js"
import type { Manager } from "../types/index.js"

/**
 * See {@link virtualPress}
 */
export function virtualRelease(
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
	manager.listener?.({ isKeydown: false, keys, manager })
	setKeysState(keys, manager, false)
	removeFromChain(manager, keys, undefined)
}

