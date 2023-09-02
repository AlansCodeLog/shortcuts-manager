import { chordContainsKey } from "./chordContainsKey.js"
import { dedupeKeys } from "./dedupeKeys.js"

import type { Key } from "../classes/index.js"


/**
 * Returns if the given chords are equal.
 *
 * Can be passed a length, to limit the search to only the first x chords.
 *
 * ```ts
 * equalsKeys([[k.a]], [[k.a]]) // true
 * equalsKeys([[k.a], [k.b]], [[k.a]]) // false
 * equalsKeys([[k.a], [k.b]], [[k.a]], 1) // true
 * equalsKeys([[k.a], [k.b]], [[k.a], [k.b]], 2) // true
 * equalsKeys([[k.a], [k.b]], [[k.a], [k.b], [k.c]], 3) // false
 * equalsKeys([[k.a], [k.b]], [[k.b]], 1) // false
 * ```
 * Can also pass options to {@link Keys.equals}:
 *
 * ```ts
 * equalsKeys([[k.a], [k.b]], [[k.aVariant], [k.b]], 2, { allowVariants: true }) // true
 * ```
 *
 */
export function equalsKeys(keys: readonly Key[][], base: readonly Key[][], length?: number, opts: Parameters<Key["equals"]>[1] = {}): boolean {
	// Since they're pre-sorted this should be quite fast
	if (
		(length === undefined && base.length !== keys.length) ||
		(length !== undefined && (keys.length < length || base.length < length))
	) return false

	return keys.slice(0, length ?? keys.length)
		.find((thisChord, c) => {
			if (!base[c]) return true
			const otherChord = dedupeKeys(base[c], opts)
			thisChord = dedupeKeys(thisChord, opts)
			if (otherChord.length !== thisChord.length) return true
			for (const otherKey of otherChord) {
				if (!chordContainsKey(thisChord, otherKey, opts)) return true
			}
			return false
		}) === undefined
}
