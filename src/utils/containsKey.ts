import { equalsKey } from "./equalsKey.js"

import type { Keys } from "../types/index.js"

/**
 * Returns whether a shortcut's chain or chord contains the given key according to {@link equalsKey}.
 */
export function containsKey(
	chordOrChain: string[][] | string[],
	key: string,
	keys: Keys,
	opts: { allowVariants?: boolean } = {}
): boolean {
	return chordOrChain
		.flat()
		.some(existing => equalsKey(existing, key, keys, opts))
}
