import { castType } from "@alanscodelog/utils/castType.js"
import { crop } from "@alanscodelog/utils/crop.js"
import { indent } from "@alanscodelog/utils/indent.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "./helpers/KnownError.js"
import { errorTextAdd } from "./internal/errorTextAdd.js"
import { setCommandsProp } from "./setCommandsProp.js"
import { setShortcutProp } from "./setShortcutProp.js"
import { type CanHookCommandProps, type CanHookErrors, type Command, type CommandSetEntries, ERROR, type Manager,type MultipleErrors } from "./types/index.js"


const canHookable: CanHookCommandProps[] = ["condition", "execute"]

/**
 * Sets a settable command property.
 *
 * You should not use this to set key state the manager manages (those tagged with @Managed in the docs) unless you've forgone using the manager.
 *
 * Note that while the manager argument is always required, for unmanaged properties you can pass {} and for most others you can pass a partial manager if needed. This is because it's very difficult to keep the heavy per prop types and allow the manager to be optional in these cases.
 *
 */
export function setCommandProp<
	TEntries extends CommandSetEntries ,
	TProp extends keyof CommandSetEntries ,
	TEntry extends TEntries[TProp] ,
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	/** Command is mutated if check is not "only". */
	command: Command,
	prop: TProp,
	val: TEntry["val"],
	manager: (TEntry["manager"] extends never ? unknown : TEntry["manager"]) & { hooks?: THooks },
	{
		check = true as TCheck,
	}: { check?: TCheck } = {}
): Result<
	TCheck extends "only" ? true : Command,
	MultipleErrors<TEntry["error"]>
		| CanHookErrors<Manager["hooks"] extends never ? never : THooks, "canSetCommandProp">
	> {
	if (check) {
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (prop) {
			case "name": {
				castType<TEntries["name"]["manager"]>(manager)
				castType<TEntries["name"]["val"]>(val)
				const s = manager.options.stringifier
				const existing = manager.commands.entries[val as string]
				if (existing) {
					return Result.Err(new KnownError(
						ERROR.DUPLICATE_COMMAND,
						errorTextAdd(
							"Command",
							val as string,
							s.stringify(existing),
							s.stringify(command)
						),
						{ existing, self: manager.commands }
					))
				}
				// note that the old command being missing is NOT an error, see Command.name
				
				// we artificially add the command so we don't get errors that it's unknown
				const managerClone = {
					...manager,
					commands: {
						...manager.commands,
						entries: {
							...manager.commands.entries,
							[val]: { ...command, name: val },
						},
					},
				}

				const shortcutErrors = []
				for (const shortcut of manager.shortcuts.entries) {
					if (shortcut.command === command.name) {
						// we should only receive hook errors
						const res = setShortcutProp(shortcut, "command", val, managerClone, { check: "only" })
						if (res.isError) shortcutErrors.push(res.error)
					}
				}
				if (shortcutErrors.length > 0) {
					return Result.Err(new KnownError(
						ERROR.MULTIPLE_ERRORS,
						crop`
							Received multiple errors attempting to change command name from ${command.name} to ${val}: 
							${indent(shortcutErrors.map(_ => _.message).join("\n"), 7)}
							`,
						{ errors: shortcutErrors }
					))
				}
				break
			}

			default: break
		}
	
		if (manager?.hooks && "canSetCommandProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = manager.hooks.canSetCommandProp?.(command, prop as any, val)
			if (canHook instanceof Error) {
				return Result.Err(canHook) as any
			}
		}
	}
	
	if (check === "only") {
		return Result.Ok(true) satisfies Result<true, never> as any
	}


	if (prop === "name") {
		castType<TEntries["name"]["manager"]>(manager)
		castType<TEntries["name"]["val"]>(val)

		
		setCommandsProp("entries@add", { ...command, name: val }, manager).unwrap()
		const old = command.name
		const oldCommand = manager.commands.entries[old]
		for (const shortcut of manager.shortcuts.entries) {
			if (shortcut.command === old) {
				setShortcutProp(shortcut, "command", val, manager).unwrap()
			}
		}
		// only remove if it existed
		if (manager.commands.entries[old]) {
			setCommandsProp("entries@remove", oldCommand, manager).unwrap()
		}
	} else {
		(command as any)[prop] = val
	}
	if (manager?.hooks && "onSetCommandProp" in manager.hooks!) {
		manager?.hooks?.onSetCommandProp?.(command, prop as any, val)
	}
	
	return Result.Ok(command) satisfies Result<Command, never> as any
}

