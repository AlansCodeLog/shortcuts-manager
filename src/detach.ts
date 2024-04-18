import { keys } from "@alanscodelog/utils/keys.js"
import type { AnyFunction } from "@alanscodelog/utils/types"

import type { AttachTarget, EventTypes } from "./types/index.js"

/**
 * Detach the listeners from an element.
 */
export function detach(
	el: AttachTarget,
	listeners: Record<EventTypes, AnyFunction>,
	/** Listeners need ot be detached with the same options they were attached with. */
	opts: Partial<Record<EventTypes, AddEventListenerOptions>> = { wheel: { passive: true } },
): void {
	for (const name of keys(listeners)) {
		el.removeEventListener(name, listeners[name], opts[name])
	}
}

