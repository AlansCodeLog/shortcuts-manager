/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { keys } from "@alanscodelog/utils/keys.js"
import type { AnyFunction } from "@alanscodelog/utils/types"

import type { AttachTarget, EventTypes } from "./types/index.js"
/**
 * Attach the event listeners created by {@link createManagerEventListeners} to an element or {@link Emulator} so the manager can listen to the needed event hooks.
 */
export function attach(
	el: AttachTarget,
	listeners: Record<EventTypes, AnyFunction>,
	/** Add options to some listeners. */
	opts: Partial<Record<EventTypes, AddEventListenerOptions>> = { wheel: { passive: true } },
) {
	for (const listenerName of keys(listeners)) {
		el.addEventListener(listenerName, listeners[listenerName], opts[listenerName])
	}
}

