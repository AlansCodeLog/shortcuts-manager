import { Result } from "@alanscodelog/utils/Result.js"

import { isValidShortcut } from "./helpers/isValidShortcut.js"
import type { ChainErrors, ERROR, Manager, MultipleErrors, PickManager, RawShortcut, Shortcut } from "./types/index.js"


/**
 * Creates a {@link Shortcut} object from a {@link RawShortcut}.
 *
 * If the raw shortcut has no condition, a new blank empty condition is created. If you will be following the suggestion of not having any conditions equal eachother (see {@link ConditionComparer}), you can fallback to passing the same instance of an empty condition without issues.
 */
export function createShortcut(
	// chain: RawShortcut["chain"],
	rawShortcut: RawShortcut,
	manager: Pick<Manager, "keys" | "commands">
	& PickManager<"options", "stringifier" | "sorter">,
): Result< Shortcut, MultipleErrors<
| ChainErrors
| ERROR.UNKNOWN_COMMAND
	>> {
	const sorter = manager.options.sorter

	const finalChain = []
	for (const chord of rawShortcut.chain) {
		const stringChord = chord.map(key => typeof key === "object" ? key.id : key)
		sorter.sort(stringChord, manager.keys)
		finalChain.push(stringChord)
	}
	const command = typeof rawShortcut.command === "object" ? rawShortcut.command.name : rawShortcut.command

	const shortcut: Shortcut = {
		type: "shortcut",
		enabled: rawShortcut.enabled ?? true,
		command,
		chain: finalChain,
		condition: rawShortcut.condition ?? { type: "condition", text: "" },
		forceUnequal: false,
	}
	const res = isValidShortcut(shortcut, manager)
	if (res.isError) return res
	

	return Result.Ok(shortcut)
}
