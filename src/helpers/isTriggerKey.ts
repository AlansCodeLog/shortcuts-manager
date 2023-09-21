import { isModifierKey } from "./isModifierKey.js"
import { isToggleStateKey } from "./isToggleStateKey.js"

import type { Key } from "../classes/index.js"
/**
 * See {@link Manager} and {@link Manager.pressedNonModifierKeys}.
 */
export function isTriggerKey(key: Key): boolean {
	return !isModifierKey(key) && !isToggleStateKey(key)
}
