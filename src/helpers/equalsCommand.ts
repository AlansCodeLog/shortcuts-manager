import type { Command, PickManager } from "../types/index.js"

/**
 * Returns whether the command passed is equal to this one.
 *
 * The name, execute, description, and conditions must be equal.
 */
export function equalsCommand<TCommand extends Command>(
	commandA: TCommand,
	commandB: Command,
	manager: PickManager<"options", "conditionEquals">
): commandB is TCommand {
	if (commandA === commandB) return true
	return commandA.name === commandB.name
			&& commandA.execute === commandB.execute
			&& manager.options.conditionEquals(commandA.condition, commandB.condition)
			&& commandA.description === commandB.description
}
