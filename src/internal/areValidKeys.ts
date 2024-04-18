import { crop } from "@alanscodelog/utils/crop.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { getKeyFromIdOrVariant } from "../helpers/getKeyFromIdOrVariant.js"
import { KnownError } from "../helpers/KnownError.js"
import type { Manager, MultipleErrors, PickManager, Shortcut } from "../types/index.js"
import { ERROR } from "../types/index.js"

/**
 * @internal
 */
export function areValidKeys(
	chain: string[][] | Shortcut,
	manager: Pick<Manager, "keys"> & PickManager<"options", "stringifier">,
	
): Result<true, MultipleErrors<ERROR.UNKNOWN_KEY>> {
	const s = manager.options.stringifier
	const keys = manager.keys

	const shortcut = "type" in chain ? chain : undefined
	chain = "type" in chain ? chain.chain : chain
	const unknownKeys = []
	for (const key of chain.flat()) {
		const res = getKeyFromIdOrVariant(key, keys)
		if (res.isError) {
			unknownKeys.push(key)
		}
	}

	if (unknownKeys.length > 0) {
		const stringified = s.stringifyList("keys", unknownKeys, { keys })
		return Result.Err(new KnownError(ERROR.UNKNOWN_KEY, crop`
			${s.stringify(shortcut ?? chain, manager)} contains unknown keys: ${stringified}
			`, {
			shortcut: shortcut ? shortcut : { chain },
			keys: unknownKeys,
		}))
	}
	return Result.Ok(true)
}
