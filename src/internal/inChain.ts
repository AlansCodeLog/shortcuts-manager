import { shortcutCanExecuteIn } from "../helpers/shortcutCanExecuteIn.js"
import type { Manager } from "../types/index.js"
import { equalsKeys } from "../utils/equalsKeys.js"


/**
	* Returns true if there are shortcuts that could be executed given the state of the manager's chain. That is, except if {@link Manager.isAwaitingKeyup} is true, in which case it returns false.
 */
export function inChain(manager: Manager): boolean {
	if (manager.state.isAwaitingKeyup) return false
	const shortcuts = manager.shortcuts.entries.filter(shortcut => (
		shortcutCanExecuteIn(shortcut, manager, { allowEmptyCommand: true })
		&& manager.state.chain.length < shortcut.chain.length
		&& equalsKeys(
			shortcut.chain,
			manager.state.chain,
			manager.keys,
			manager.state.chain.length,
			{ allowVariants: true }
		)
	))
	if (!shortcuts) return false
	return shortcuts.length > 0
}

