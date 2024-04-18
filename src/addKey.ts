import { Result } from "@alanscodelog/utils/Result.js"

import { setKeysProp } from "./setKeysProp.js"
import type { CanHookErrors, Key, KeysSetEntries, Manager, MultipleErrors } from "./types/index.js"


export function addKey<
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	key: Key,
	manager: KeysSetEntries["entries@add"]["manager"] & { hooks?: THooks },
	opts: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Key,
		MultipleErrors<
			KeysSetEntries["entries@add"]["error"]
		> | CanHookErrors<THooks extends never ? never : THooks, "canSetKeysProp">
	>
{
	const res = setKeysProp("entries@add", key, manager, opts)
	if (res.isError) return res
	return Result.Ok(key) satisfies Result<Key, never> as any
}

