import type { Key } from "classes/index.js"


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
 *
 */
export function equalsKeys(keys: Key[][], base: Key[][], length?: number): boolean {
	// Since they're pre-sorted this should be quite fast
	if (
		(length === undefined && base.length !== keys.length) ||
		(length !== undefined && (keys.length < length || base.length < length))
	) return false

	return keys.slice(0, length ?? keys.length)
		.find((thisChord, c) => {
			const otherChord = base[c]
			if (!otherChord || otherChord.length !== thisChord.length) return true
			return thisChord.find((thisKey, i) => {
				const shortcutKey = otherChord[i]
				if (!shortcutKey) return true
				return !thisKey.equals(shortcutKey)
			}) !== undefined
		}) === undefined
}
