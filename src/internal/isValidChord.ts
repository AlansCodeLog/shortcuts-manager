import { crop } from "@alanscodelog/utils/crop.js"
import { findDuplicates } from "@alanscodelog/utils/findDuplicates.js"
import { indent } from "@alanscodelog/utils/indent.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { getKeyFromIdOrVariant } from "../helpers/getKeyFromIdOrVariant.js"
import { KnownError } from "../helpers/KnownError.js"
import { ERROR, type Manager, type PickManager } from "../types/index.js"
import { isTriggerKey } from "../utils/isTriggerKey.js"
import { isWheelKey } from "../utils/isWheelKey.js"


/**
 * Guards against invalid chords (for various reasons). See the {@link ERROR}.CHORD_W_... errors.
 *
 * Does not check if the keys are valid.
 *
 * @internal
 */
export function isValidChord(
	chain: string[][],
	chord: string[],
	i: number,
	manager: Pick<Manager, "keys"> & PickManager<"options", "stringifier" | "sorter">,
): Result<true, KnownError<ERROR.CHORD_W_DUPLICATE_KEY | ERROR.CHORD_W_ONLY_MODIFIERS | ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS | ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS>> {
	const keys = manager.keys
	const s = manager.options.stringifier

	const prettyChord = s.stringify(chord, manager)
	const prettyChain = s.stringify(chain, manager)

	const repeated = findDuplicates(chord, { equals: (id, otherId) => {
		const key = getKeyFromIdOrVariant(id, keys).unwrap()[0]
		const other = getKeyFromIdOrVariant(otherId, keys).unwrap()[0]
		if (key.id === other.id) return true
		if (key.variants?.includes(other.id) || other.variants?.includes(key.id)) return true
		// this is caught by multiple wheel key error
		if (isWheelKey(key) && isWheelKey(other)) return false
		return false
	} })
	if (repeated.length > 0) {
		const prettyRepeated = s.stringifyList("keys", repeated, manager)

		return Result.Err(new KnownError(ERROR.CHORD_W_DUPLICATE_KEY, crop`
			Chord "${prettyChord}" in chain "${prettyChain}" contains duplicate or incompatible keys:
				${indent(prettyRepeated, 4)}
			Chords cannot contain duplicate keys. This includes more than one of the same toggle, regardless of the state.
		`, { chord, i, keys: repeated }))
	}

	const onlyModifiers = chord.filter(id => (getKeyFromIdOrVariant(id, keys).unwrap()[0]).isModifier)
	const containsOnlyModifiers = onlyModifiers.length === chord.length
	if (i < chain.length - 1 && containsOnlyModifiers) {
		return Result.Err(new KnownError(ERROR.CHORD_W_ONLY_MODIFIERS, crop`
			Chain "${prettyChain}" is impossible.
			Chord #${i + 1} "${prettyChord}" cannot contain only modifiers if it is followed by another chord.
			A chord can only consist of only modifiers if it's the last chord in a chain.
		`, { chord, i, keys: onlyModifiers }))
	}

	/* It might actually be possible to allow this, similar to how emulated toggle keys are handled but it would be a pain for such an odd use case (even I don't have such weird shortcuts). */
	const wheelKeys = chord.filter(id => isWheelKey(getKeyFromIdOrVariant(id, keys).unwrap()[0]))
	const prettyWheelKeys = s.stringifyList("keys", wheelKeys, manager)

	if (wheelKeys.length > 1) {
		return Result.Err(new KnownError(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS, crop`
			Chain "${prettyChain}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple wheel keys: ${prettyWheelKeys}
			Chords can only contain one.
		`, { chord, i, keys: wheelKeys }))
	}
	// todo remove this limitation
	// we should be able to have shortcuts like holding down both mouse buttons
	// note it's fine to not check key.toggles in isTriggerKey because a trigger key cannot be a toggle *state* anyways
	const triggerKeys = chord.filter(id => isTriggerKey(getKeyFromIdOrVariant(id, keys).unwrap()[0]))
	const prettyTriggerKeys = s.stringifyList("keys", triggerKeys, manager)
	if (triggerKeys.length > 1) {
		return Result.Err(new KnownError(ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS, crop`
			Chain "${prettyChain}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple trigger (non-modifier/non-root toggle) keys: ${prettyTriggerKeys}
			Chords can only contain one.
		`, { chord, i, keys: triggerKeys }))
	}


	return Result.Ok(true)
}
