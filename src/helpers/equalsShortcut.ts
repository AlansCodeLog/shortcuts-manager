import { equalsCommand } from "./equalsCommand.js"

import type { Manager, PickManager, Shortcut } from "../types/index.js"
import { equalsKeys } from "../utils/equalsKeys.js"

/**
 * Returns whether the shortcut passed is equal to shortcutA one.
 *
 * To return true, their keys and command must be equal (unless ignoreCommand is passed), their condition must be equal according to shortcutA shortcut's condition.
 */
export function equalsShortcut<TShortcut extends Shortcut>(
	shortcutA: TShortcut,
	shortcutB: Shortcut,
	manager: Pick<Manager, "keys" | "commands" > & PickManager<"options", | "evaluateCondition" | "conditionEquals" >,
	{ ignoreCommand = false }: { ignoreCommand?: boolean } = {}
): shortcutB is TShortcut {
	if (shortcutA.forceUnequal || shortcutB.forceUnequal) return false
	if (shortcutA === shortcutB) return true
	return (
		equalsKeys(shortcutA.chain, shortcutB.chain, manager.keys, undefined, { allowVariants: true })
				&& manager.options.conditionEquals(shortcutA.condition, shortcutB.condition)
				&& (ignoreCommand
					|| (
						shortcutA.command === shortcutB.command
						&& shortcutA.command === undefined
					)
					|| (shortcutA.command !== undefined
						&& shortcutB.command !== undefined
						&& equalsCommand(manager.commands.entries[shortcutA.command], manager.commands.entries[shortcutB.command], manager)
					)
				)
	)
}

