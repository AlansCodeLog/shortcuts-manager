import { shortcutCanExecuteIn } from "./shortcutCanExecuteIn.js"

import type { Manager, PickManager, Shortcut } from "../types/index.js"
import { equalsKeys } from "../utils/equalsKeys.js"


export function shortcutIsTriggerableBy(
	chain: string[][],
	shortcut: Shortcut,
	manager: Pick<Manager, "context" | "commands" | "keys"> & PickManager<"options", "evaluateCondition">,
): boolean {
	return shortcutCanExecuteIn(shortcut, manager, { allowEmptyCommand: true }) &&
	equalsKeys(shortcut.chain, chain, manager.keys, undefined, { allowVariants: true })
}

