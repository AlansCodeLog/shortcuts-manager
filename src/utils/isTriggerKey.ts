import type { Key } from "../types/index.js"
/**
 * See {@link Manager} and {@link Manager.pressedNonModifierKeys}.
 */
export function isTriggerKey(key: Key): boolean {
	return !key.isModifier && !key.isToggle
}
