import type { Key } from "@/classes";
import { isModifierKey, isToggleStateKey } from ".";

/**
 * See {@link Manager} and {@link Manager.pressedNonModifierKeys}.
 */
export function isTriggerKey(key: Key): boolean {
	return !isModifierKey(key) && !isToggleStateKey(key)
}
