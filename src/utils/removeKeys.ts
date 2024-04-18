import { equalsKey } from "./equalsKey.js"

import type { Keys } from "../types/index.js"

/**
 * Returns a copy of keysList with the keys given to remove, removed, checking equality according to {@link equalsKey}.
 */
export const removeKeys = (
	keysList: readonly string[],
	toRemove: readonly string[],
	keys: Keys,
	opts: { allowVariants?: boolean } = {}
): string[] => keysList
	.filter(key =>
		toRemove.find(_ => equalsKey(key, _, keys, opts)) === undefined
	)
