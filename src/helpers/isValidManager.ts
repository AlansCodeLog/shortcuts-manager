import { Result } from "@alanscodelog/utils/Result.js"

import { isValidShortcut } from "./isValidShortcut.js"

import type { ChainErrors, ERROR, Manager, MultipleErrors } from "../types/index.js"


export function isValidManager(manager: Manager): Result< true, MultipleErrors<
| ChainErrors
| ERROR.UNKNOWN_COMMAND
>> {
	let res
	for (const shortcut of manager.shortcuts.entries) {
		res = isValidShortcut(shortcut, manager)
		if (res.isError) return res
	}

	return Result.Ok(true)
}
