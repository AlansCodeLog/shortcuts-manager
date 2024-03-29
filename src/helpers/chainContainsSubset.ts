import { chordContainsKey } from "./chordContainsKey.js"
import { dedupeKeys } from "./dedupeKeys.js"
import { equalsKeys } from "./equalsKeys.js"

import type { Key } from "../classes/Key.js"


/**
 * Returns whether a chain is a subset of another.
 */

export const chainContainsSubset = (
	chainSubset: readonly Key[][],
	chain: readonly Key[][],
	{
		onlySubset = false,
		onlyPressable = false,
		allowVariants = true,
	}: {
		/** If true, will return false if the chain is exactly equal. */
		onlySubset?: boolean
		/** If true, will return false if the shortcut is not one key press away.*/
		onlyPressable?: boolean
		allowVariants?: boolean
	} = { }
): boolean => {
	const opts = { allowVariants }

	if (chainSubset.length === 0) {
		if (chain.length === 0 && chain[0].length === 0) return !onlySubset
		return !onlyPressable || (chain.length === 1 && chain[0].length === 1)
	}

	if (chainSubset.length > chain.length) return false


	const index = chainSubset.length === 0 ? 0 : chainSubset.length - 1
	const precedingChords = chainSubset.slice(0, index)
	const precedingChordsEqual = equalsKeys(chain, precedingChords, precedingChords.length, opts)
	if (!precedingChordsEqual) return false
	if (onlyPressable && index !== chain.length - 1) return false

	const subsetLastChord = dedupeKeys(chainSubset[index], opts)
	// not it might NOT be the last chord
	const chainChord = dedupeKeys(chain[index], opts)

	if (onlySubset && chainSubset.length === chain.length && subsetLastChord.length === chainChord.length) return false

	for (const key of subsetLastChord) {
		if (!chordContainsKey(chainChord, key, opts)) return false
	}

	const subsetModifiers = subsetLastChord.filter(key => key.is.modifier)
	const modifiers = chainChord.filter(key => key.is.modifier)

	const modKeysDiff = modifiers.length - subsetModifiers.length

	const subsetNonModKeysCount = subsetLastChord.length - subsetModifiers.length
	const nonModKeysCount = chainChord.length - modifiers.length
	const nonModKeysDiff = nonModKeysCount - subsetNonModKeysCount


	if (onlySubset && modKeysDiff === 0 && nonModKeysDiff === 0) return false
	if (onlyPressable && !(
		(modKeysDiff === 0 && nonModKeysDiff === 1) ||
		(modKeysDiff === 1 && nonModKeysDiff === 0)
	)) {return false}
	
	return true
}
