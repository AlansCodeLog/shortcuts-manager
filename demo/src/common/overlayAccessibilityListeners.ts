import { keys as objectKeys } from "@alanscodelog/utils/keys.js"
import { type MakeRequired } from "@alanscodelog/utils/types"
import type { EventListenerTypes } from "shortcuts-manager/types"

/**
 * Overlays/wraps the given manager listeners for certain keys to allow different behavior on regular key presses vs hold. Note this requires preventDefault and stopPropagation on all keydown events for the keys given.
 *
 *  Note, will not work for tab, because tab default behavior normally triggers on keydown and we must e.preventDefault() the event.
 *
 * A default `onKeyup` handler is provided that triggers the original keydown then the original keyup if the threshold was not reached.
 */
export function overlayHoldListeners<T extends MakeRequired<EventListenerTypes, "keydown" | "keyup">>(
	listeners: T,
	actions: Record<string, {
		onImmediateKeydown?: (
			listener: EventListenerTypes["keydown"],
			e: KeyboardEvent
		) => void
		onThresholdKeydown?: (
			listener: EventListenerTypes["keydown"],
			e: KeyboardEvent
		) => void
		onKeyup?: (
			keyupListener: EventListenerTypes["keydown"],
			eUp: KeyboardEvent,
			keydownListener: EventListenerTypes["keyup"],
			eDown: KeyboardEvent,
			thresholdReached: boolean
		) => void
	}>,
	onDefault?: (listener: EventListenerTypes["keydown"], e: KeyboardEvent) => void,
	holdTime: number = 1500,
	filter?: () => boolean,
): T {
	const originalKeydown = listeners.keydown
	const originalKeyup = listeners.keyup
	const keys = objectKeys(actions)
	const holding = Object.fromEntries(keys
		.map(k => [
			k,
			{
				event: undefined as undefined | KeyboardEvent,
				time: -1,
				thresholdReached: false,
				...actions[k],
			},
		])
	)
	return {
		...listeners,
		keydown: (e: KeyboardEvent) => {
			const now = performance.now()

			if (!filter || filter()) {
				for (const key of keys) {
					if (e.code === key) {
						e.preventDefault()
						e.stopImmediatePropagation()
						const timeHeld = holding[key].time > -1 ? now - holding[key].time : 0
						if (timeHeld > holdTime && !holding[key].thresholdReached) {
							holding[key].thresholdReached = true
							holding[key].event = e
							holding[key].onThresholdKeydown?.(originalKeydown, e)
							return
						}
						if (timeHeld > 0) return
						if (holding[key].onImmediateKeydown) {
							holding[key].event = e
							holding[key].onImmediateKeydown?.(originalKeydown, e)
						}
						holding[key].time = now
						return
					}
				}
			}
			if (onDefault) onDefault(originalKeydown, e)
			else originalKeydown(e)
		},
		keyup: (e: KeyboardEvent) => {
			if (!filter || filter()) {
				for (const key of keys) {
					if (e.code === key) {
						const didReach = holding[key].thresholdReached
						holding[key].time = -1
						holding[key].thresholdReached = false
						if (holding[key].onKeyup) {
							holding[key].onKeyup(
								originalKeydown,
								holding[key].event!,
								originalKeyup,
								e,
								didReach
							)
						} else {
							if (!didReach) {
								originalKeydown(e)
								originalKeyup(e)
							}
						}
						return
					}
				}
			}
			if (onDefault) onDefault(originalKeyup, e)
			else originalKeyup(e)
		},
	}
}
