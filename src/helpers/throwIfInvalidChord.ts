import type { Key, KeysStringifier } from "@/classes"
import { ERROR } from "@/types"
import { crop, findDuplicates, indent } from "@utils/utils"
import { isNormalKey } from "./isNormalKey"
import { isWheelKey } from "./isWheelKey"
import { KnownError } from "./KnownError"




/**
 * Guards against invalid chords (for various reasons). See the {@link ERROR}.CHORD_W_... errors.
 *
 * @internal
 */
export function throwIfInvalidChord(
	self: { keys: Key[][] },
	chord: Key[],
	i: number,
	stringifier: KeysStringifier
): void {
	const shortcut = self.keys
	const prettyChord = stringifier.stringifyChord(chord)
	const prettyShortut = stringifier.stringifyChain(shortcut)

	const repeated = findDuplicates(chord, {
		equals: (key, other) => {
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
		// eslint-disable-next-line no-shadow
		const prettyRepeated = stringifier.stringifyKeys(repeated)

		throw new KnownError(ERROR.CHORD_W_DUPLICATE_KEY, crop`
			Chord "${prettyChord}" in shortcut "${prettyShortut}" contains duplicate or incompatible keys:
				${indent(prettyRepeated, 4)}
			Shortcut chords cannot contain duplicate keys. This includes more than one of the same toggle, regardless of the state.
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
	const prettyNormalKeys = stringifier.stringifyKeys(normalKeys)
	if (normalKeys.length > 1) {
		throw new KnownError(ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS, crop`
			Shortcut "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple normal (non-modifier/mouse/wheel/toggle) keys: ${prettyNormalKeys}
			Chords can only contain one.
		`, { shortcut: self, chord, i, keys: normalKeys })
	}

	/* It might actually be possible to allow this, similar to how emulated toggle keys are handled but it would be a pain for such an odd use case (even I don't have such weird shortcuts). */
	const wheelKeys = chord.filter(key => isWheelKey(key))
	const prettyWheelKeys = stringifier.stringifyKeys(wheelKeys)
	if (wheelKeys.length > 1) {
		throw new KnownError(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS, crop`
			Shortcut "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple wheel keys: ${prettyWheelKeys}
			Chords can only contain one.
		`, { shortcut: self, chord, i, keys: wheelKeys })
	}
}
