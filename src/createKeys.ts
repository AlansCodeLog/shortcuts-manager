import { Result } from "@alanscodelog/utils/Result.js"
import type { RecordFromArray } from "@alanscodelog/utils/types"

import { addKey } from "./addKey.js"
import { defaultStringifier } from "./defaults/Stringifier.js"
import { calculateLayoutSize } from "./helpers/calculateLayoutSize.js"
import { type ERROR, type Key, type Keys, type MultipleErrors, type PickManager } from "./types/index.js"


export function createKeys<
	TKey extends
		Key =
		Key,
	TKeys extends
		(Key)[] =
		(Key)[],
	TEntries extends
		RecordFromArray<TKeys, "id", TKey> =
		RecordFromArray<TKeys, "id", TKey>,
TCheck extends boolean | "only" = true,
>(
	entries: TKeys,
	manager: PickManager<"options", "stringifier"> = {
		options: { stringifier: defaultStringifier },
	},
	rawKeys: Partial<Pick<Keys, "autoManageLayout" | "layout">> = {} as any,
	{
		check = true as TCheck,
	}: { check?: TCheck } = {}
): Result<
	TCheck extends "only" ? true : Keys<TEntries>,
		MultipleErrors<
			ERROR.DUPLICATE_KEY
		>
	> {
	const keysList = entries
	const keys: Keys = {
		type: "keys",
		// prevent multiple calculations when initially adding keys
		autoManageLayout: false,
		...rawKeys,
		layout: { y: 0, x: 0, ...(rawKeys.layout ?? {}) },
		entries: {},
		nativeToggleKeys: [],
		nativeModifierKeys: [],
		variants: {},
		toggles: {},
	}
	// clone anything addKey might touch, see below
	const managerClone = { ...manager, keys }
	if (check) {
		for (const key of keysList) {
			// this one is a bit weird
			// we don't use check = "only" because we actually want keys.entries to be modified to error on duplicate keys
			// the entire keys object isn't the user's rawKey copy anymore anyways
			const res = addKey(key, managerClone)
			if (res.isError) return res as any
		}
	}
	if (check === "only") return Result.Ok(true) satisfies Result<true, never> as any

	
	if (rawKeys?.autoManageLayout) {
		keys.autoManageLayout = true
		keys.layout = calculateLayoutSize(keys)
	}
	return Result.Ok(keys) satisfies Result<Keys, never> as any
}
