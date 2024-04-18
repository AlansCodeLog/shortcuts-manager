import { crop } from "@alanscodelog/utils/crop.js"
import { indent } from "@alanscodelog/utils/indent.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "../helpers/KnownError.js"
import type { Manager, MultipleErrors, PickManager, Shortcut } from "../types/index.js"
import { ERROR } from "../types/index.js"

/**
 * @internal
 */

export function isValidCommand(
	commandName: string | undefined,
	manager: Pick<Manager, "commands"> & Partial<Pick<Manager, "keys">> & PickManager<"options", "stringifier" >,
	/**
	 * Shortcut will only be added to error if the manager contains keys.
	 * Otherwise it will be ignored.
	 */
	shortcut?: Shortcut
): Result<true, MultipleErrors<ERROR.UNKNOWN_COMMAND>> {
	const commands = manager.commands
	const s = manager.options.stringifier
	if (commandName === undefined) return Result.Ok(true)
	const command = commands.entries[commandName]
	if (command === undefined) {
		const shortcutString = shortcut && "keys" in manager ? ` in shortcut ${s.stringify(shortcut, manager as Pick<Manager, "commands" | "keys">)}` : ""
		return Result.Err(new KnownError(ERROR.UNKNOWN_COMMAND, crop`
			Unknown command: ${commandName}${shortcutString}. Cannot find in:

			${indent(s.stringifyList("commands", Object.values(commands.entries)), 3)}
			`, { command: commandName, commands, shortcut }))
	}
	return Result.Ok(true)
}
