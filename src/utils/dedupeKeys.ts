import { equalsKey } from "./equalsKey.js"

import type { Keys } from "../types/index.js"

/**
 * Returns a new array deduped according to {@link equalsKey}.
 *
 * This is useful when keys have variants to dedupe them by their variants since a shortcut might contain multiple variants, which can make it hard to check chords satisfy certain conditions (e.g. x amount of modifiers).
 */
export const dedupeKeys = (
	// we take a string to avoid having to deal with toggle keys
	keyList: string[],
	keys: Keys,
	opts: { allowVariants?: boolean } = {}
): string[] => {
	const res: string[] = []
	for (const keyId of keyList) {
		if (res.find(id => equalsKey(id, keyId, keys, opts))) continue
		res.push(keyId)
	}
	return res
}

