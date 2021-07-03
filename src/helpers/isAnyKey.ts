import { isWheelKey } from "./isWheelKey"

import type { Key } from "@/classes"

import { isMouseKey } from "."


/**
 * Returns whether a key is a key (anot not a mouse button or mouse wheel).
 */
export function isAnyKey(key: Key): boolean {
	return !isWheelKey(key) && !isMouseKey(key)
}
