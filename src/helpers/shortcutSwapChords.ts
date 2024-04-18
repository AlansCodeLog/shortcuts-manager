import { crop } from "@alanscodelog/utils/crop.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "./KnownError.js"

import { defaultStringifier } from "../defaults/Stringifier.js"
import { setShortcutProp } from "../setShortcutProp.js"
import type { IStringifier, Keys, Manager, PickManager, Shortcut, Shortcuts } from "../types/index.js"
import { ERROR } from "../types/index.js"
import { equalsKeys } from "../utils/equalsKeys.js"


function setForceUnequalOnAll<TSave extends boolean = false>(shortcuts: Shortcut[], val: boolean | boolean[], save: TSave = false as TSave): TSave extends true ? boolean[] : undefined {
	const was: boolean[] | undefined = save ? [] : undefined
	for (let i = 0; i < shortcuts.length; i++) {
		const shortcut = shortcuts[i]
		if (save) was!.push(shortcut.forceUnequal)
		// it's safe to not handle the result, forceUnequal is not canHookable
		setShortcutProp(shortcut, "forceUnequal", typeof val === "boolean" ? val : val[i], {})
	}
	return was as any
}

function canSwapChords(
	shortcuts: Shortcuts,
	manager: Pick<Manager, "keys" | "shortcuts" | "commands" >
	& PickManager<"options", | "evaluateCondition" | "conditionEquals" | "stringifier" | "sorter">,
	chainA: string[][],
	chainB: string[][],
	filter?: (shortcut: Shortcut) => boolean
): Result<true, Error | KnownError<ERROR.INVALID_SWAP_CHORDS | ERROR.DUPLICATE_SHORTCUT>> {
	let can: Result<true, any> = Result.Ok(true)
	const shortcutsClone = { ...shortcuts, entries: [...shortcuts.entries.map(_ => ({ ..._ }))]}
	const managerClone = { ...manager, shortcuts: shortcutsClone }

	const { shortcutsA, shortcutsB } = getToSwap(shortcutsClone, manager, chainA, chainB, filter)
	
	const wasA = setForceUnequalOnAll(shortcutsA, true, true)

	for (const shortcutB of shortcutsB) {
		const newChain = [...chainA, ...shortcutB.chain.slice(chainA.length, shortcutB.chain.length)]
		const res = setShortcutProp(shortcutB, "chain", newChain, managerClone)
		if (res.isError) {
			can = res as any
			break
		}
	}
	setForceUnequalOnAll(shortcutsA, wasA)

	if (can.isOk) {
		const wasB = setForceUnequalOnAll(shortcutsB, true, true)
		for (const shortcutA of shortcutsA) {
			const newChain = [...chainB, ...shortcutA.chain.slice(chainB.length, shortcutA.chain.length)]
			const res = setShortcutProp(shortcutA, "chain", newChain, managerClone)
			if (res.isError) {
				can = res as any
				break
			}
		}
		setForceUnequalOnAll(shortcutsB, wasB)
	}

	return can
}


function assertChordsNotEmpty(chord: string[][],
	keys: Keys,
	{ stringifier: s = defaultStringifier }: { stringifier?: IStringifier } = {}
): Result<true, KnownError<ERROR.INVALID_SWAP_CHORDS>> {
	let found: undefined | string[][]
	if (chord.length === 0 || chord.find(ks => ks.length === 0)) {
		found = chord
	}
	if (found) {
		return Result.Err(new KnownError(
			ERROR.INVALID_SWAP_CHORDS,
			`Cannot swap with empty chord, but ${s.stringify(chord, { keys })} contains an empty chord.`,
			{ chord }
		))
	}
	return Result.Ok(true)
}


function assertCorrectSwapParameters(
	keys: Keys,
	chordsA: string[][], chordsB: string[][],
	{
		stringifier: s = defaultStringifier,
	}: {
		stringifier?: IStringifier
	} = {}
): Result<true, KnownError<ERROR.INVALID_SWAP_CHORDS>> {
	const canA = assertChordsNotEmpty(chordsA, keys, { stringifier: s })
	if (canA.isError) { return canA }
	const canB = assertChordsNotEmpty(chordsB, keys, { stringifier: s })
	if (canB.isError) { return canB }

	if (equalsKeys(chordsA, chordsB, keys, chordsB.length)
			|| equalsKeys(chordsB, chordsA, keys, chordsA.length)
	) {
		return Result.Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, crop`
			The chords to swap cannot share starting chords.
			Chords:
			${s.stringify(chordsA, { keys })}
			${s.stringify(chordsB, { keys })}
			`, { chordsA, chordsB }))
	}
	return Result.Ok(true)
}
function getToSwap(
	shortcuts: Shortcuts,
	manager: Pick<Manager, "keys" | "shortcuts" | "commands" >
	& PickManager<"options", | "evaluateCondition" | "conditionEquals" | "stringifier" | "sorter">,
	chainA: string[][],
	chainB: string[][],
	filter?: (shortcut: Shortcut) => boolean
): { shortcutsA: Shortcut[], shortcutsB: Shortcut[] } {
	let shortcutsA = shortcuts.entries.filter(shortcut => equalsKeys(shortcut.chain, chainA, manager.keys, chainA.length))
	let shortcutsB = shortcuts.entries.filter(shortcut => equalsKeys(shortcut.chain, chainB, manager.keys, chainB.length))

	if (filter) {
		shortcutsA = shortcutsA.filter(filter)
		shortcutsB = shortcutsB.filter(filter)
	}
	return { shortcutsA, shortcutsB }
}

/**
 * Swaps the given chords for all matching shortcuts.
 *
 * This is done by using forceUnequal for each set of matching shortcuts in turn.
 *
 * EXAMPLES:
 *
 * Given the following shortcuts:
 *
 * ```
 * 1 A
 * 1 B
 * 2 C
 * 2 D
 * ```
 *
 * `swapChords([[1]], [[2]])` would result in:
 *
 * ```
 * 2 A
 * 2 B
 * 1 C
 * 1 D
 * ```
 *
 * Multiple chords, and chords of unequal lengths can be safely swapped.
 *
 * ```
 * 1 2 A
 * 1 2 B
 * 3 C
 * 3 D
 * ```
 *
 * `swapChords([[1], [2]], [[3]])`:
 * ```
 * 3 A
 * 3 B
 * 1 2 C
 * 1 2 D
 * ```
 *
 * A filter function is provided, to, for example, filter out disabled entries from the swap. Note that it might be unsafe to swap entries with a filter if the new entries can be equal to the ignored ones, hence why the `check` exists.
 *
 * Example of how it might be a problem:
 * ```
 * A
 * B
 * ```
 * `shortcutSwapChords([[A]], [[B]], () => { filter that ignores A })` would result in two A shortcuts.
 *
 * But if, for example, you use the filter to ignore disabled shortcuts, this wouldn't be a problem because you'd get two unequal shortcuts (A and A(disabled)), though re/dis-abling one of them would trigger a conflict.
 *
 * Note: Certain types of chords cannot be swapped, like empty chords, or chords which share a base.
 *
 * If using the experimental {@link ignoreModifierConflicts  Shortcuts["ignoreModifierConflicts"]}, note that you cannot use this to swap the base modifiers.
 *
 * For example, say you had:
 * ```
 * Ctrl+A
 *	Ctrl
 * ```
 * If you do `swapChords([Ctrl],[Shift])`, `Ctrl+A` is not considered to match the `[Ctrl]` chord and you will get:
 * ```
 * Ctrl+A
 *	Shift
 * ```
 */
export function shortcutSwapChords(
	shortcuts: Shortcuts,
	chainA: string[][],
	chainB: string[][],
	manager: Pick<Manager, "keys" | "shortcuts" | "commands" >
	& PickManager<"options", | "evaluateCondition" | "conditionEquals" | "stringifier" | "sorter">,
	{
		check = true,
	}: {
		check?: boolean | "only"
	} = {},
	filter?: (shortcut: Shortcut) => boolean
): Result<true, KnownError<ERROR.INVALID_SWAP_CHORDS | ERROR.INVALID_SWAP_CHORDS | ERROR.DUPLICATE_SHORTCUT> | Error> {
	const res = assertCorrectSwapParameters(manager.keys, chainA, chainB)
	if (res.isError) { return res }

	if (check) {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const res = canSwapChords(shortcuts, manager, chainA, chainB, filter)
		if (res.isError) { return res }
	}

	if (check === "only") {
		return Result.Ok(true)
	}

	const { shortcutsA, shortcutsB } = getToSwap(shortcuts, manager, chainA, chainB, filter)

	const wasA = setForceUnequalOnAll(shortcutsA, true, true)
	for (const shortcutB of shortcutsB) {
		setShortcutProp(shortcutB, "chain", [...chainA, ...shortcutB.chain.slice(chainA.length, shortcutB.chain.length)], manager, { check: false })
	}
	setForceUnequalOnAll(shortcutsA, wasA)

	const wasB = setForceUnequalOnAll(shortcutsA, true, true)
	for (const shortcutA of shortcutsA) {
		setShortcutProp(shortcutA, "chain", [...chainB, ...shortcutA.chain.slice(chainB.length, shortcutA.chain.length)], manager, { check: false })
	}
	setForceUnequalOnAll(shortcutsA, wasB, true)

	
	return Result.Ok(true)
}

