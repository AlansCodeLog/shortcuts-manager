import { getKeyFromIdOrVariant } from "./getKeyFromIdOrVariant.js"
import { virtualPress } from "./virtualPress.js"
import { virtualRelease } from "./virtualRelease.js"

import type { Manager } from "../types/index.js"

/**
 * Calls {@link virtualRelease} if the key is pressed.
 *
 * Calls {@link virtualPress} if the key is released.
 */
export function virtualToggle(
	manager:	Manager,
	keyIdOrVariant: string,
): void {
	const res = getKeyFromIdOrVariant(keyIdOrVariant, manager.keys)
	if (res.isError) {
		manager.options.cb(manager, res.error)
		return
	}
	const key = res.value[0]
	if (key.pressed) {
		virtualRelease(manager, keyIdOrVariant)
	} else {
		virtualPress(manager, keyIdOrVariant)
	}
}

