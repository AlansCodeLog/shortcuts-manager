import { Result } from "@alanscodelog/utils/Result.js"

import { setShortcutsProp } from "./setShortcutsProp.js"
import type { CanHookErrors, Manager, MultipleErrors, Shortcut, ShortcutsSetEntries } from "./types/index.js"


export function addShortcut<
THooks extends Manager["hooks"],
		TCheck extends boolean | "only" = true,
>(
	shortcut: Shortcut,
	manager: ShortcutsSetEntries["entries@add"]["manager"] & { hooks?: THooks },
	opts: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Shortcut,
		MultipleErrors<
			ShortcutsSetEntries["entries@add"]["error"]
		> | CanHookErrors<THooks extends never ? never : THooks, "canSetShortcutsProp">
	>
{
	const res = setShortcutsProp("entries@add", shortcut, manager, opts)
	if (res.isError) return res
	return Result.Ok(shortcut) satisfies Result<Shortcut, never> as any
}
