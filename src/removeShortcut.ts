import { Result } from "@alanscodelog/utils/Result.js"

import { setShortcutsProp } from "./setShortcutsProp.js"
import type { CanHookErrors, Manager, MultipleErrors, Shortcut, ShortcutsSetEntries } from "./types/index.js"


export function removeShortcut<
THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	shortcut: Shortcut,
	manager: ShortcutsSetEntries["entries@remove"]["manager"] & { hooks?: THooks },
	opts: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Shortcut,
		MultipleErrors<
			ShortcutsSetEntries["entries@remove"]["error"]
		> | CanHookErrors<THooks extends never ? never : THooks, "canSetShortcutsProp">
	>
{
	const res = setShortcutsProp("entries@remove", shortcut, manager, opts)
	if (res.isError) return res
	return Result.Ok(shortcut) satisfies Result<Shortcut, never> as any
}
