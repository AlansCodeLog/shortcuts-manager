import type { Key } from "@/classes"

/**
 * Returns whether a key is a mouse key (id = 0-4).
 */
export function isMouseKey(key: Key): boolean {
	return ["0", "1", "2", "3", "4"].includes(key.id)
}
