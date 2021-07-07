import { crop } from "@alanscodelog/utils"

import { KnownError } from "./KnownError"

import type { Key } from "@/classes"
import { ERROR } from "@/types"


/**
 * If you have toggle keys in chords, their are "chains" of the same toggle key that would be physically impossible. For example: `toggle(on) toggle(on)`.
 *
 * @internal
 * This guards against that.
 */
export function throwIfImpossibleToggles(
	shortcut: Key[][],
): void {
	const prevToggles: [Key, number][] = []
	let num = 0
	let impossible: {
		key: Key
		pos: number
	} | undefined
	for (const chord of shortcut) {
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
		const prettyShortcut = shortcut // TODO
		// const prettyShortcut = parser.stringify.any(shortcut)
		const { pos, key } = impossible
		throw new KnownError(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE, crop`
			Shortcut "${prettyShortcut}" is impossible.
			This shortcut has a toggle key state "${key/* .string */}" at key #${pos + 1} that would be impossible to trigger.
		`, { shortcut, key, i: pos }) // TODO           ^
	}
}
