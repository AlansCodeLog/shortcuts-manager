import { Result } from "@alanscodelog/utils/Result.js"

import { isValidChain } from "../internal/isValidChain.js"
import { isValidCommand } from "../internal/isValidCommand.js"
import type { ChainErrors, ERROR, Manager, MultipleErrors, PickManager, Shortcut } from "../types/index.js"


export function isValidShortcut(
	shortcut: Shortcut,
	manager: Pick<Manager, "keys" | "commands"> & PickManager<"options", "stringifier" | "sorter">,
): Result< true, MultipleErrors<
| ChainErrors
| ERROR.UNKNOWN_COMMAND
	>> {
	const resCommandsValid = isValidCommand(shortcut.command, manager, shortcut)
	if (resCommandsValid.isError) return resCommandsValid
	const resChainValid = isValidChain(shortcut.chain, manager)
	if (resChainValid.isError) return resChainValid
	return Result.Ok(true)
}
