import { type Result } from "@alanscodelog/utils/Result.js"
import { type KnownError } from "shortcuts-manager/helpers"
import { ERROR, type Manager, type ManagerSetEntries, type MultipleErrors, type PickManager, type ShortcutSetEntries } from "shortcuts-manager/types"
import { equalsKeys } from "shortcuts-manager/utils"


export const transformShortcutAllowsChainRes = (
	res: Result<
		any,
		Error | MultipleErrors<
			| ShortcutSetEntries["chain"]["error"]
			| ManagerSetEntries["state.chain"]["error"]
		>
	>,
	oldChain: string[][],
	newChain: string[][],
	manager: Pick<Manager, "keys"> & PickManager<"options", "stringifier">
): boolean | string => {
	if (res.isOk) return true
	if (res.isError) {
		const s = manager.options.stringifier
		const isSelf = equalsKeys(oldChain, newChain, manager.keys)
		if (isSelf) return false
		if ("code" in res.error && res.error.code === ERROR.DUPLICATE_SHORTCUT) {
			const err = res.error as KnownError<ERROR.DUPLICATE_SHORTCUT>

			const chainWanted = s.stringify(newChain, manager)
			const chainOfConflicting = s.stringify(err.info.existing, manager)
			return `Cannot move, shortcut to:\n${chainWanted}\nit conflicts in the current context with:\n${chainOfConflicting}`
		} else {
			return res.error.message
		}
	}
	return false
}
