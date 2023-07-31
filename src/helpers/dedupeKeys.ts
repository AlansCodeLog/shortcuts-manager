import type { Key } from "../classes/Key.js"

/**
 * Returns a new array deduped by the key's equal method with the given opts.
 *
 * This is useful when keys have variants to dedupe them by their variants since a shortcut might contain multiple variants, which can make it hard to check chords satisfy certain conditions (e.g. x amount of modifiers).
 */
export const dedupeKeys = (keys: Key[], opts: Parameters<Key["equals"]>[1] = {}): Key[] => {
	const res: Key[] = []
	for (const key of keys) {
		if (res.find(x => x.equals(key, opts))) continue
		res.push(key)
	}
	return res
}

