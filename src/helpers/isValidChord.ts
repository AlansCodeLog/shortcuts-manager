import { crop, Err, findDuplicates, indent, Ok, type Result } from "@alanscodelog/utils"

import { isNormalKey } from "./isNormalKey.js"
import { isWheelKey } from "./isWheelKey.js"
import { KnownError } from "./KnownError.js"

import type { Key, Manager, Shortcut, Stringifier } from "../classes/index.js"
import { ERROR } from "../types/index.js"


/**
 * Guards against invalid chords (for various reasons). See the {@link ERROR}.CHORD_W_... errors.
 *
 * @internal
 */
export function isValidChord(
	self: Shortcut | Manager,
	chain: Key[][],
	chord: Key[],
	i: number,
	stringifier: Stringifier,
): Result<true, KnownError<ERROR.CHORD_W_DUPLICATE_KEY | ERROR.CHORD_W_ONLY_MODIFIERS | ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS | ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS>> {
	const prettyChord = stringifier.stringifyChord(chord)
	const prettyShortut = stringifier.stringifyChain(chain)

	const repeated = findDuplicates(chord, { equals: (key, other) => {
		if (key === other || key.id === other.id) {
			return true
		}
		if (key.is.toggle && other.is.toggle) {
			const keyBase = key.root ?? key
			const otherBase = other.root ?? other
			if (keyBase === otherBase) {
				return true
			}
		}
		// this is caught by multiple wheel key error
		if (isWheelKey(key) && isWheelKey(other)) return false
		return false
	} })
	if (repeated.length > 0) {
		const prettyRepeated = stringifier.stringifyKeys(repeated)

		return Err(new KnownError(ERROR.CHORD_W_DUPLICATE_KEY, crop`
			Chord "${prettyChord}" in chain "${prettyShortut}" contains duplicate or incompatible keys:
				${indent(prettyRepeated, 4)}
			Chords cannot contain duplicate keys. This includes more than one of the same toggle, regardless of the state.
		`, { self, chord, i, keys: repeated }))
	}

	const onlyModifiers = chord.filter(key => key.is.modifier)
	const containsOnlyModifiers = onlyModifiers.length === chord.length
	if (i < chain.length - 1 && containsOnlyModifiers) {
		return Err(new KnownError(ERROR.CHORD_W_ONLY_MODIFIERS, crop`
			Chain "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" cannot contain only modifiers if it is followed by another chord.
			A chord can only consist of only modifiers if it's the last chord in a chain.
		`, { self, chord, i, keys: onlyModifiers }))
	}

	const normalKeys = chord.filter(isNormalKey)
	const prettyNormalKeys = stringifier.stringifyKeys(normalKeys)
	if (normalKeys.length > 1) {
		return Err(new KnownError(ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS, crop`
			Chain "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple normal (non-modifier/mouse/wheel/toggle) keys: ${prettyNormalKeys}
			Chords can only contain one.
		`, { self, chord, i, keys: normalKeys }))
	}

	/* It might actually be possible to allow this, similar to how emulated toggle keys are handled but it would be a pain for such an odd use case (even I don't have such weird shortcuts). */
	const wheelKeys = chord.filter(key => isWheelKey(key))
	const prettyWheelKeys = stringifier.stringifyKeys(wheelKeys)
	if (wheelKeys.length > 1) {
		return Err(new KnownError(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS, crop`
			Chain "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple wheel keys: ${prettyWheelKeys}
			Chords can only contain one.
		`, { self, chord, i, keys: wheelKeys }))
	}
	return Ok(true)
}
