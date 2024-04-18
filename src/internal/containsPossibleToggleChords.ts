import { crop } from "@alanscodelog/utils/crop.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { getKeyFromIdOrVariant } from "../helpers/getKeyFromIdOrVariant.js"
import { KnownError } from "../helpers/KnownError.js"
import { ERROR, type Manager, type PickManager } from "../types/index.js"

/**
 * If you have toggle keys in chords, their are "chains" of the same toggle key that would be physically impossible. For example: `toggle(on) toggle(on)`.
 *
 * This guards against that.
 *
 * This does NOT guard against duplicates and errors in the same chord, for that see {@link isValidChord}.
 *
 * @internal
 */
export function containsPossibleToggleChords(
	chain: string[][],
	manager: Pick<Manager, "keys"> & PickManager<"options", "stringifier">,
): Result<true, KnownError<ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE>> {
	const keys = manager.keys
	const s = manager.options.stringifier


	const prevToggles: [string, number][] = []
	let num = 0
	let impossible: {
		keyId: string
		pos: number
	} | undefined
	for (const chord of chain) {
		const toggleIds = chord.filter(keyId => (getKeyFromIdOrVariant(keyId, keys).unwrap()[0]).isToggle)
		let found = false
		for (let k = 0; k < toggleIds.length; k++) {
			const currId = toggleIds[k]
			// We've already been guaranteed there's maximum 1 of the same toggle per chord in isValidChord
			// So we can use this to count if the amount of previous toggle states for each unique toggle key cancel out
			const prevWithSameRootsIds = prevToggles.map(([prevId, j]) => {
				const prev = getKeyFromIdOrVariant(prevId, keys).unwrap()[0]
				const curr = getKeyFromIdOrVariant(currId, keys).unwrap()[0]
				return (prev.id === curr.id || prev.variants?.includes(curr.id) || curr.variants?.includes(prev.id))
				? [prevId, j]
				: undefined
			}).filter(key => key !== undefined) as [string, number][]
			prevWithSameRootsIds.push([currId, num + k])
			let canBeOn = true
			let canBeOff = true
			for (const [keyId, j] of prevWithSameRootsIds) {
				// no need to check variants
				const key = (keys.entries[keyId] ?? keys.toggles[keyId])
				if (key.id === keyId) {
					// Flip them since a root toggle functions as the opposite of the last toggle key state
					// Note they can be both true, which is why we must literally flip them
					const couldOn: boolean = canBeOn
					const couldOff: boolean = canBeOff
					canBeOn = couldOff
					canBeOff = couldOn
					continue
				}
				const isOff = key.toggleOffId === keyId
				const isOn = key.toggleOnId === keyId
				if ((isOn && !canBeOn)
					|| (isOff && !canBeOff)) {
					impossible = { keyId, pos: j }
					break
				}
				canBeOn = isOff
				canBeOff = isOn
			}
			if (impossible) {
				found = true; break
			}
			const currKey = getKeyFromIdOrVariant(currId, keys).unwrap()[0]
			if (currKey.isToggle) {
				prevToggles.push([currId, num + k])
			}
			num += chord.length
		}
		if (found) break
	}
	if (impossible) {
		const prettyShortcut = s.stringify(chain, manager)
		const { pos, keyId: key } = impossible
		const e = Result.Err(new KnownError(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE, crop`
			Chain "${prettyShortcut}" is impossible.
			This chain has a toggle key state "${s.stringify(key, manager)}" at key #${pos + 1} that would be impossible to trigger.
		`, { chain, key: keys.entries[key] ?? keys.toggles[key], i: pos }))
		return e
	}
	return Result.Ok(true)
}
