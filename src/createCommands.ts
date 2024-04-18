import { Result } from "@alanscodelog/utils/Result.js"

import { addCommand } from "./addCommand.js"
import { defaultStringifier } from "./defaults/Stringifier.js"
import type { CanHookErrors, Command, Commands, CommandsSetEntries, Manager, MultipleErrors, PickManager } from "./types/index.js"

/**
 * # Commands
 * Creates a set of commands.
 */
export function createCommands<
	THooks extends Manager["hooks"],
	TEntries extends Record<string, Command>,
	TCheck extends boolean | "only" = true,
	
>(
	commandsList: Command[],
	manager: PickManager<"options", "stringifier"> & { hooks?: THooks } = {
		options: { stringifier: defaultStringifier },
	},
	{ check = true as TCheck }: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Commands<TEntries>,
		MultipleErrors<
			CommandsSetEntries["entries@add"]["error"]
		> | CanHookErrors<THooks extends never ? never : THooks, "canSetCommandsProp" >
	>
{
	const commands: Commands = {
		type: "commands",
		entries: {},
	}
	const managerClone = { ...manager, commands }
	if (check) {
		for (const command of commandsList) {
			// we check all first to avoid erroring mid-way through
			const res = addCommand(command, managerClone)
			if (res.isError) return res
		}
	}
	if (check === "only") return Result.Ok(true) satisfies Result<true, never> as any

	return Result.Ok(commands)satisfies Result<Commands, never> as any
}

