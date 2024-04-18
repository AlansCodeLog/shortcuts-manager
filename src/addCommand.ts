import { Result } from "@alanscodelog/utils/Result.js"

import { setCommandsProp } from "./setCommandsProp.js"
import type { CanHookErrors, Command, CommandsSetEntries, Manager, MultipleErrors } from "./types/index.js"


export function addCommand<
THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	command: Command,
	manager: CommandsSetEntries["entries@add"]["manager"] & { hooks?: THooks },
	opts: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Command,
		MultipleErrors<
			CommandsSetEntries["entries@add"]["error"]
		> | CanHookErrors<THooks extends never ? never : THooks, "canSetCommandsProp">
	>
{
	const res = setCommandsProp("entries@add", command, manager, opts)
	if (res.isError) return res
	return Result.Ok(command) satisfies Result<Command, never> as any
}
