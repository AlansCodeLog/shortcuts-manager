import { Ok, Result } from "@alanscodelog/utils"

import type { KnownError } from "./KnownError"

import type { Key, KeysSorter, Manager, Shortcut, Stringifier } from "@/classes"
import type { ERROR } from "@/types"

import { containsPossibleToggleChords, isValidChord } from "."


/**
 * Guards against invalid chords (for various reasons). See the {@link ERROR}.CHORD_W_... errors.
 *
 * @internal
 */
export function isValidChain(
	self: Shortcut | Manager,
	chain: Key[][],
	stringifier: Stringifier,
	sorter: KeysSorter
): Result<true, KnownError<
	| ERROR.CHORD_W_DUPLICATE_KEY
	| ERROR.CHORD_W_ONLY_MODIFIERS
	| ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS
	| ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS
	| ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE
>> {
	const val = []
	for (let i = 0; i < chain.length; i++) {
		const chord = chain[i]
		const res = isValidChord(self, chain, chord, i, stringifier)
		if (res.isError) return res
		val.push(sorter.sort([...chord]))
	}
	const res = containsPossibleToggleChords(self, chain, stringifier)
	if (res.isError) return res
	return Ok(true)
}
