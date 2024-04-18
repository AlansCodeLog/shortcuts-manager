import { castType } from "@alanscodelog/utils/castType.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { addShortcut } from "./addShortcut.js"
import { isValidChain } from "./internal/isValidChain.js"
import { isValidCommand } from "./internal/isValidCommand.js"
import { removeShortcut } from "./removeShortcut.js"
import { type CanHookErrors, type CanHookShortcutProps, ERROR, type Hooks, type Manager, type MultipleErrors, type Shortcut, type Shortcuts, type ShortcutSetEntries } from "./types/index.js"


const canHookable: CanHookShortcutProps[] = ["chain", "command", "condition", "enabled"]

/* Sets a settable shortcut property.
 *
 * You should not use this to set properties the manager manages (those tagged with @Managed in the docs) unless you've forgone using the manager.
 */


export function setShortcutProp<
	TEntries extends ShortcutSetEntries,
	TProp extends keyof ShortcutSetEntries,
	TEntry extends TEntries[TProp],
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	/** Shortcut is mutated if check is not "only". */
	shortcut: Shortcut,
	prop: TProp,
	val: TEntry["val"],
	manager: (TEntry["manager"] extends never ? unknown : TEntry["manager"]) & { hooks?: THooks },
	{ check = true as TCheck }: { check?: TCheck } = {}
):
	Result<
		TCheck extends "only" ? true : Shortcut,
		MultipleErrors<
			TEntry["error"]
		>
		| CanHookErrors<Manager["hooks"] extends never ? never : THooks, "canSetShortcutProp">
	>
{
	if (check) {
		switch (prop) {
			case "chain": {
				castType<TEntries["chain"]["val"]>(val)
				castType<TEntries["chain"]["manager"]>(manager)

				const res = isValidChain(val, manager)
				if (res.isError) return res

				const shortcutsShallowClone: Shortcuts = { ...manager.shortcuts, entries: [...manager.shortcuts.entries]}
				const managerClone = { ...manager, shortcuts: shortcutsShallowClone } as any as Manager
				// todo better way
				const resRemove = removeShortcut(shortcut, managerClone)
				// we could be setting a shortcut not in the set
				if (resRemove.isError && "code" in resRemove.error && resRemove.error.code !== ERROR.MISSING) return resRemove as any
				const resAdd = addShortcut({ ...shortcut, chain: val }, managerClone)
				if (resAdd.isError) return resAdd as any
				break
			}
			case "command": {
				castType<TEntries["command"]["val"]>(val)
				castType<TEntries["command"]["manager"]>(manager)

				const res = isValidCommand(val, manager, shortcut)
				if (res.isError) return res
				break
			}
			default: {
				break
			}
		}
		if (manager?.hooks && "canSetShortcutProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = (manager.hooks as Hooks).canSetShortcutProp?.(shortcut, prop as any, val)
			if (canHook instanceof Error) {
				return Result.Err(canHook) as any
			}
		}
	}
	if (check === "only") {
		return Result.Ok(true) satisfies Result<true, never> as any
	}
	shortcut[prop] = val as any

	(manager?.hooks as Hooks)?.onSetShortcutProp?.(shortcut, prop, val)
	manager?.hooks?.onSetShortcutProp?.(shortcut, prop, val)

	return Result.Ok(shortcut) satisfies Result<Shortcut, never> as any
}

