import { crop, Err, Ok, type Result } from "@alanscodelog/utils"

import { KnownError } from "./KnownError.js"

import type { Key, Manager, Shortcut, Stringifier } from "../classes/index.js"
import { ERROR } from "../types/index.js"


/**
 * If you have toggle keys in chords, their are "chains" of the same toggle key that would be physically impossible. For example: `toggle(on) toggle(on)`.
 *
 * @internal
 * This guards against that.
 */
export function containsPossibleToggleChords(
	self: Shortcut | Manager | undefined,
	chain: Key[][],
	stringifier: Stringifier
): Result<true, KnownError<ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE>> {
	const prevToggles: [Key, number][] = []
	let num = 0
	let impossible: {
		key: Key
		pos: number
	} | undefined
	for (const chord of chain) {
		const toggles = chord.filter(key => key.is.toggle)
		let found = false
		for (let k = 0; k < toggles.length; k++) {
			const curr = toggles[k]
			// We've already been guaranteed there's maximum 1 of the same toggle per chord
			// So we can use this to count if the amount of previous toggle states for each unique toggle key cancel out
			const prevWithSameRoots = prevToggles.map(([prev, j]) => (prev.root || prev) === (curr.root || curr)
				? [prev, j]
				: undefined).filter(key => key !== undefined) as [Key, number][]
			prevWithSameRoots.push([curr, num + k])
			let canBeOn = true
			let canBeOff = true
			for (const [key, j] of prevWithSameRoots) {
				if (key.root === undefined) {
					// Flip them since a root toggle functions as the opposite of the last toggle key state
					// Note they can be both true, which is why we must literally flip them
					const couldOn: boolean = canBeOn
					const couldOff: boolean = canBeOff
					canBeOn = couldOff
					canBeOff = couldOn
					continue
				}
				const isOff = key.root.off === key
				const isOn = key.root.on === key
				if ((isOn && !canBeOn)
					|| (isOff && !canBeOff)) {
					impossible = { key, pos: j }
					break
				}
				canBeOn = isOff
				canBeOff = isOn
			}
			if (impossible) {
				found = true; break
			}
			if (curr.is.toggle) {
				prevToggles.push([curr, num + k])
			}
			num += chord.length
		}
		if (found) break
	}
	if (impossible) {
		const prettyShortcut = stringifier.stringify(chain)
		const { pos, key } = impossible
		return Err(new KnownError(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE, crop`
			Chain "${prettyShortcut}" is impossible.
			This chain has a toggle key state "${stringifier.stringify(key)}" at key #${pos + 1} that would be impossible to trigger.
		`, { self, chain, key, i: pos }))
	}
	return Ok(true)
}
