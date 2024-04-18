import type { Manager, PickManager, Shortcut } from "../types/index.js"


export function shortcutCanExecuteIn(
	shortcut: Shortcut,
	manager: Pick<Manager, "context" | "commands" > & PickManager<"options", "evaluateCondition">,
	{
		allowEmptyCommand = false,
	}: {
		allowEmptyCommand?: boolean
	} = {}
): boolean {
	const context = manager.context
	const commands = manager.commands
	const evaluateCondition = manager.options.evaluateCondition

	const fullCommand = shortcut.command ? commands.entries[shortcut.command] : undefined
	return shortcut.enabled && (
		(
			allowEmptyCommand && (fullCommand?.execute === undefined))
		|| (fullCommand !== undefined && evaluateCondition(fullCommand?.condition, context)
		)
	) && shortcut.condition !== undefined && evaluateCondition(shortcut.condition, context)
}
