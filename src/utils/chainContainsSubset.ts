import { containsKey } from "./containsKey.js"
import { dedupeKeys } from "./dedupeKeys.js"
import { equalsKeys } from "./equalsKeys.js"

import type { Keys } from "../types/index.js"


/**
 * Returns whether a chain is a subset of another, taking into account variants (this can be disabled).
 */

export const chainContainsSubset = (
	chain: readonly string[][],
	chainSubset: readonly string[][],
	keys: Keys,
	{
		onlySubset = false,
		onlyPressable = false,
		allowVariants = true,
	}: {
		/**
		 * If true, will return false if the last chord of the chainSubset is exactly equal.
		 *
		 * So for example, for the chain: [[a], [ctrl+b]], the following would return as follows:
		 *
		 * ```
		 * // true
		 * [[]] or []
		 * [[a]]
		 * [[a], []]
		 * [[a], [ctrl]]
		 * [[a], [b]]
		 *
		 * // false
		 * [[a], [ctrl, b]]
		 * ```
		 */
		onlySubset?: boolean
		/** If true, will return false if the shortcut is not one key press away.*/
		onlyPressable?: boolean
		allowVariants?: boolean
	} = { }
): boolean => {
	const opts = { allowVariants }

	if (chainSubset.length === 0) {
		const isEmpty = chain.length === 0 || (chain.length === 1 && chain[0].length === 0)
		if (isEmpty) return onlySubset
		return !onlyPressable || (chain.length === 1 && chain[0].length === 1)
	}

	if (chainSubset.length > chain.length) return false


	const index = chainSubset.length === 0 ? 0 : chainSubset.length - 1
	
	const precedingChords = chainSubset.slice(0, index)
	const precedingChordsEqual = index === 0 || equalsKeys(chain, precedingChords, keys, precedingChords.length, opts)
	if (!precedingChordsEqual) return false
	if (onlyPressable && index !== chain.length - 1) return false

	const subsetLastChord = dedupeKeys(chainSubset[index], keys, opts)
	// note it might NOT be the last chord
	const chainLastSharedChord = dedupeKeys(chain[index], keys, opts)

	if (onlySubset) {
		if (subsetLastChord.length === chainLastSharedChord.length) {
			// they match exactly, so it's not strictly a subset
			if (chainSubset.length === chain.length) return false
			// the chainSubset is x chords too short, this is always a subset
			if (chainSubset.length < chain.length) return true
		}
	}

	for (const key of subsetLastChord) {
		if (!containsKey(chainLastSharedChord, key, keys, opts)) {
			return false
		}
	}

	const subsetModifiers = subsetLastChord.filter(key => keys.entries[key].isModifier)
	const modifiers = chainLastSharedChord.filter(key => keys.entries[key].isModifier)

	const modKeysDiff = modifiers.length - subsetModifiers.length

	const subsetNonModKeysCount = subsetLastChord.length - subsetModifiers.length
	const nonModKeysCount = chainLastSharedChord.length - modifiers.length
	const nonModKeysDiff = nonModKeysCount - subsetNonModKeysCount

	if (onlySubset && modKeysDiff === 0 && nonModKeysDiff === 0) return false
	if (onlyPressable && !(
		(modKeysDiff === 0 && nonModKeysDiff === 1) ||
		(modKeysDiff === 1 && nonModKeysDiff === 0)
	)) {return false}
	
	return true
}
