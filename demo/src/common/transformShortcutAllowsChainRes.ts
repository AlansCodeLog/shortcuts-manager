import { type Result } from "@alanscodelog/utils"

import type { Key } from "shortcuts-manager/classes/Key.js"
import type { Stringifier } from "shortcuts-manager/classes/Stringifier.js"
import { equalsKeys, type KnownError } from "shortcuts-manager/helpers/index.js"
import { ERROR } from "shortcuts-manager/types/enums.js"
import type { KeysErrors } from "shortcuts-manager/types/shortcut.js"


export const transformShortcutAllowsChainRes = (
	res: Result<true, any>,
	oldChain: Key[][],
	newChain: Key[][],
	stringifier: Stringifier
): boolean | string => {
	if (res.isOk) return true
	if (res.isError) {
		const isSelf = equalsKeys(oldChain, newChain)
		if (isSelf) return false
		if (res.error.code === ERROR.DUPLICATE_SHORTCUT as KeysErrors) {
			const error = res.error as any as KnownError<ERROR.DUPLICATE_SHORTCUT>

			const chainWanted = stringifier.stringify(error.info.value)
			const chainOfConflicting = stringifier.stringify(error.info.existing.chain)
			return `Cannot move, shortcut to:\n${chainWanted}\nit conflicts in the current context with:\n${chainOfConflicting}`
		} else {
			return res.error.message
		}
	}
	return false
}
