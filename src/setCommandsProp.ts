import { castType } from "@alanscodelog/utils/castType.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "./helpers/KnownError.js"
import { errorTextAdd } from "./internal/errorTextAdd.js"
import { errorTextInUse } from "./internal/errorTextInUse.js"
import { errorTextRemove } from "./internal/errorTextRemove.js"
import { type CanHookCommandsProps, type CanHookErrors, type Command, type Commands, type CommandsSetEntries, ERROR, type Manager,type MultipleErrors } from "./types/index.js"


const canHookable: CanHookCommandsProps[] = ["entries@add", "entries@remove"]


/**
 * Sets a settable command property.
 *
 * You should not use this to set command state the manager manages (those tagged with @Managed in the docs) unless you've forgone using the manager.
 *
 */
export function setCommandsProp<
	TEntries extends CommandsSetEntries ,
	TProp extends keyof CommandsSetEntries ,
	TEntry extends TEntries[TProp],
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	prop: TProp,
	val: TEntry["val"],
	/** Commands is mutated if check is not "only". */
	manager: TEntry["manager"] & { hooks?: THooks },
	{
		check = true as TCheck,
	}: { check?: TCheck } = {}
): Result<
	TCheck extends "only" ? true : Command,
	MultipleErrors<TEntry["error"]>
	| CanHookErrors<Manager["hooks"] extends never ? never : THooks, "canSetCommandsProp">
	> {
	const commands = manager.commands
	const s = manager.options.stringifier
	if (check) {
		switch (prop) {
			case "entries@add": {
				castType<TEntries["entries@add"]["val"]>(val)
				castType<TEntries["entries@add"]["manager"]>(manager)
				const command = val
				const existing = commands.entries[command.name]

				if (existing) {
					return Result.Err(new KnownError(
						ERROR.DUPLICATE_COMMAND,
						errorTextAdd(
							"Command",
							s.stringifyCommand(existing.name, manager),
							s.stringifyCommand(existing.name, manager),
							s.stringifyCommand(command.name, manager)
						),
						{ existing, self: commands }
					))
				}

				break
			}
			case "entries@remove": {
				castType<TEntries["entries@remove"]["val"]>(val)
				castType<TEntries["entries@remove"]["manager"]>(manager)

				const command = val
				if (!commands.entries[command.name]) {
					return Result.Err(new KnownError(
						ERROR.MISSING,
						errorTextRemove(
							"Command",
							s.stringify(command),
							s.stringifyList("commands", Object.values(commands.entries))
						),
						{ entry: command.name, self: commands }
					))
				}

				const inUseShortcuts = manager.shortcuts.entries.filter(shortcut => shortcut.command === command.name)
				if (inUseShortcuts.length > 0) {
					return Result.Err(new KnownError(
						ERROR.COMMAND_IN_USE,
						errorTextInUse(
							"command",
							s.stringify(command),
							s.stringifyList("shortcuts", inUseShortcuts, manager)
						),
						{ inUseShortcuts }))
				}
				break
			}
			default: break
		}
		if (manager?.hooks && "canSetCommandsProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = manager.hooks?.canSetCommandsProp?.(commands, prop as any, val as any)
			if (canHook instanceof Error) {
				return Result.Err(canHook) as any
			}
		}
	}
	
	if (check === "only") {
		return Result.Ok(true) satisfies Result<true, never> as any
	}

	switch (prop) {
		case "entries@add": {
			const command = val as any as Command
			commands.entries[command.name] = command
			break
		}
		case "entries@remove": {
			const command = val as any as Command
			delete commands.entries[command.name]
			break
		}
		default:
			(commands as any)[prop] = val
			break
	}

	manager.hooks?.onSetCommandsProp?.(commands, prop as any, val as any)
	
	return Result.Ok(commands) satisfies Result<Commands, never> as any
}

