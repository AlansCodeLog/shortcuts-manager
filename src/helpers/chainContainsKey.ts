import type { Key } from "classes/index.js"

/**
 * Returns whether a shortcut's keys contains the given key.
 */
export function chainContainsKey(chain: Key[][], key: Key): boolean {
	return chain
		.flat()
		.find(existing => existing === key) !== undefined
}
