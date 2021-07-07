import { crop, findDuplicates, indent, readable } from "@utils/utils"

import { isNormalKey } from "./isNormalKey"
import { KnownError } from "./KnownError"

import type { Key, Shortcut } from "@/classes"
import { ERROR } from "@/types"


/**
 * Guards against invalid chords (for various reasons). See the [[ERROR]].CHORD_W_... errors.
 *
 * @internal
 */
export function throwIfInvalidChord(
	self: Shortcut | { keys: Key[][] },
	chord: Key[],
	i: number,
): void {
	const shortcut = self.keys
	// todo
	const prettyChord = chord
	const prettyShortut = shortcut
	// const pretty_chord = parser.stringify.any(chord)
	// const pretty_shortcut = parser.stringify.any(shortcut)
	const repeated = findDuplicates(chord, { equals: (key, other, found) => {
		if (key === other) {
			return true
		}
		if (key.is.mouse !== false && other.is.mouse !== undefined) {
			const button = key.is.mouse
			const otherButton = other.is.mouse
			return otherButton === button
		}
		if (key.is.toggle && other.is.toggle) {
			const keyBase = key.root ?? key
			const otherBase = other.root ?? other
			if (keyBase === otherBase) {
				if (!found.includes(other)) {
					found.push(other)
				}
				return true
			}
		}
		return false
	} })
	if (repeated.length > 0) {
		// eslint-disable-next-line no-shadow
		const prettyRepeated = repeated.toString() // todo
		// const prettyRepeated = parser.stringify.any(repeated.map(chord => [[chord]]))
		throw new KnownError(ERROR.CHORD_W_DUPLICATE_KEY, crop`
			Chord "${prettyChord}" in shortcut "${prettyShortut}" contains duplicate or incompatible keys:
				${indent(prettyRepeated, 4)}
			Shortcut chords cannot contain duplicate keys.
			This includes:
				- more than one of the same mouse key, even if they have different options (e.g. one is a modifier and one is not.)
				- more than one of the same toggle, regardless of the state.
		`, { shortcut: self, chord, i, keys: repeated })
	}
	const onlyModifiers = chord.filter(key => key.is.modifier)
	const containsOnlyModifiers = onlyModifiers.length === chord.length
	if (i < shortcut.length - 1 && containsOnlyModifiers) {
		throw new KnownError(ERROR.CHORD_W_ONLY_MODIFIERS, crop`
			Shortcut "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" cannot contain only modifiers if it is followed by another chord.
			A chord can only consist of only modifiers if it's the last chord in a shortcut.
		`, { shortcut: self, chord, i, keys: onlyModifiers })
	}
	const normalKeys = chord.filter(isNormalKey)
	const prettyNormalKeys = readable(normalKeys.map(key => key/* .string TODO */))
	if (normalKeys.length > 1) {
		throw new KnownError(ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS, crop`
			Shortcut "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple normal (non-modifier/mouse/wheel/toggle) keys: ${prettyNormalKeys}
			Chords can only contain one.
		`, { shortcut: self, chord, i, keys: normalKeys })
	}
	/* It might actually be possible to allow this, similar to how emulated toggle keys are handled but it would be a pain for such an odd use case (even I don't have such weird shortcuts). */
	const wheelKeys = chord.filter(key => key.is.wheel)
	const prettyWheelKeys = readable(wheelKeys.map(key => key/* .string TODO */))
	if (wheelKeys.length > 1) {
		throw new KnownError(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS, crop`
			Shortcut "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple wheel keys: ${prettyWheelKeys}
			Chords can only contain one.
		`, { shortcut: self, chord, i, keys: wheelKeys })
	}
}
