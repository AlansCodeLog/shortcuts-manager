import { containsKey } from "./containsKey.js"
import { dedupeKeys } from "./dedupeKeys.js"

import type { Keys } from "../types/index.js"

/**
 * Returns if the given chords are equal.
 *
 * Can be passed a length, to limit the search to only the first x chords.
 *
 * ```ts
 * equalsKeys([[keyA]], [[keyA]]) // true
 * equalsKeys([[keyA], [keyB]], [[keyA]]) // false
 * equalsKeys([[keyA], [keyB]], [[keyA]], 1) // true
 * equalsKeys([[keyA], [keyB]], [[keyA], [keyB]], 2) // true
 * equalsKeys([[keyA], [keyB]], [[keyA], [keyB], [keyC]], 3) // false
 * equalsKeys([[keyA], [keyB]], [[keyB]], 1) // false
 * ```
 * Can also pass options to {@link equalsKey}:
 *
 * ```ts
 * equalsKeys([[keyA], [keyB]], [[keyAVariant], [keyB]], 2, { allowVariants: true }) // true
 * ```
 *
 */
export function equalsKeys(
	chain: readonly string[][],
	base: readonly string[][],
	keys: Keys,
	length?: number,
	opts: { allowVariants?: boolean } = {}
): boolean {
	// Since they're pre-sorted this should be quite fast
	if (
		(length === undefined && base.length !== chain.length) ||
		(length !== undefined && (chain.length < length || base.length < length))
	) return false

	return chain.slice(0, length ?? chain.length)
		.find((thisChord, c) => {
			if (!base[c]) return true
			const otherChord = dedupeKeys(base[c], keys, opts)
			thisChord = dedupeKeys(thisChord, keys, opts)
			if (otherChord.length !== thisChord.length) return true
			for (const otherKey of otherChord) {
				if (!containsKey(thisChord, otherKey, keys, opts)) return true
			}
			return false
		}) === undefined
}
