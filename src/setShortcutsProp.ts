import { castType } from "@alanscodelog/utils/castType.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { doesShortcutConflict } from "./helpers/doesShortcutConflict.js"
import { equalsShortcut } from "./helpers/equalsShortcut.js"
import { isValidShortcut } from "./helpers/isValidShortcut.js"
import { KnownError } from "./helpers/KnownError.js"
import { errorTextAdd } from "./internal/errorTextAdd.js"
import { errorTextRemove } from "./internal/errorTextRemove.js"
import { type CanHookErrors, type CanHookShortcutsProps, ERROR, type Manager,type MultipleErrors, type Shortcut, type Shortcuts, type ShortcutsSetEntries } from "./types/index.js"


const canHookable: CanHookShortcutsProps[] = ["entries@add", "entries@remove"]
/**
 * Sets a settable {@link Shortcuts} property.
 */
export function setShortcutsProp<
	TEntries extends ShortcutsSetEntries ,
	TProp extends keyof ShortcutsSetEntries,
	TEntry extends TEntries[TProp] ,
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	prop: TProp,
	val: TEntry["val"],
	/** Shortcuts is mutated if check is not "only". */
	manager: TEntry["manager"] & { hooks?: THooks },
	{
		check = true as TCheck,
	}: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Shortcut,
		MultipleErrors<TEntry["error"]>
		| CanHookErrors<Manager["hooks"] extends never ? never : THooks, "canSetShortcutsProp">
	>
{
	const s = manager.options.stringifier
	const shortcuts = manager.shortcuts
	if (check) {
		switch (prop) {
			case "entries@add": {
				castType<TEntries["entries@add"]["val"]>(val)
				castType<TEntries["entries@add"]["manager"]>(manager)

				const shortcut = val as any as Shortcut
				const existing = (shortcuts.entries).find(_ =>
					equalsShortcut(shortcut, _, manager, { ignoreCommand: true })
					|| doesShortcutConflict(_, shortcut, manager)
				)

				if (existing) {
					return Result.Err(new KnownError(
						ERROR.DUPLICATE_SHORTCUT,
						errorTextAdd(
							"Shortcut",
							s.stringify(existing, manager),
							s.stringifyList("shortcuts", shortcuts.entries, manager),
							s.stringify(shortcut, manager)
						),
						{ existing: (existing as any), self: shortcuts }
					))
				}
				const isValid = isValidShortcut(shortcut, manager)
				if (isValid.isError) return isValid
				break
			}
			case "entries@remove": {
				const shortcut = val as any as Shortcut
				// note we don't ignore the command here, we want to find an exact match
				const existing = (shortcuts.entries).find(_ =>
					_ === shortcut || equalsShortcut(shortcut, _, manager, { ignoreCommand: false })
				)
				if (existing === undefined) {
					return Result.Err(new KnownError(
						ERROR.MISSING,
						errorTextRemove(
							"Shortcut",
							s.stringify(shortcut, manager),
							s.stringifyList("shortcuts", shortcuts.entries, manager)
						),
						{ entry: shortcut, self: shortcuts }
					))
				}
				break
			}
			
			default: break
		}
		if (manager?.hooks && "canSetShortcutsProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = manager.hooks.canSetShortcutsProp?.(shortcuts, prop as any, val as any)
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
			const shortcut = val
			shortcuts.entries.push(shortcut)
			break
		}
		case "entries@remove": {
			const shortcut = val
			const i = shortcuts.entries.findIndex(_ => _ === shortcut || equalsShortcut(shortcut, _, manager, { ignoreCommand: false }))
			if (i < 0) {
				throw new Error("If used correctly, shortcut should exist at this point, but it does not.")
			}
			shortcuts.entries.splice(i, 1)
			break
		}
		default:
			(shortcuts as any)[prop] = val
			break
	}

	manager.hooks?.onSetShortcutsProp?.(shortcuts, prop as any, val as any)
	
	return Result.Ok(shortcuts) satisfies Result<Shortcuts, never> as any
}

