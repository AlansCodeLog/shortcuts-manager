import type { Command, Condition, Key, Shortcut } from "classes/index.js"
import type { RawCommand, RawKey, RawShortcut } from "types/index.js"

/**
 * Can create a key, command, shortcut, or condition from a raw entry. Can also just be passed an existing instance and it will return it.
 */
export function createInstance<
	T extends Condition | Command | Shortcut | Key,
	TKey extends keyof T,
	TClass extends new (...args: any[]) => T = new (...args: any[]) => T,
	TEntry extends RawCommand | RawKey | RawShortcut = RawCommand | RawKey | RawShortcut,
>(type: TClass, key: TKey, entry: TEntry): T {
	const arg = entry[key as keyof TEntry]

	const opts = (entry as any).opts

	return new type(arg, opts)
}
