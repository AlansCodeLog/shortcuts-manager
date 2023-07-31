import type { Key } from "../classes/index.js"

/**
 * Returns whether the chain contains the given key according to {@link Key["equals"]}.
 */
export function chainContainsKey(chordOrChain: Key[][] | Key[], key: Key, opts: Parameters<Key["equals"]>[1] = {}): boolean {
	return chordOrChain
		.flat()
		.find(existing => existing.equals(key, opts)) !== undefined
}
