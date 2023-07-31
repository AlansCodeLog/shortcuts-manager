import type { Key } from "../classes/index.js"

/**
 * Returns whether a shortcut's keys contains the given key according to {@link Key["equals"]}.
 */
export function chordContainsKey(chord: Key[], key: Key, opts: Parameters<Key["equals"]>[1] = {}): boolean {
	return chord
		.find(existing => existing.equals(key, opts)) !== undefined
}
