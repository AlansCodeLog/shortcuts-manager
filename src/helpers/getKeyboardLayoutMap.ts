import type { KeyboardLayoutMap } from "../types/general.js"

/**
 * Safely get the [KeyboardLayoutMap](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardLayoutMap) with [navigator.getLayoutMap](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/navigator.getLayoutMap).
 */
export async function getKeyboardLayoutMap(): Promise<KeyboardLayoutMap | undefined> {
	// castType<Navigator>(navigator) // not working during build
	if (typeof navigator !== "undefined" && "keyboard" in navigator) {
		return (navigator.keyboard as any).getLayoutMap()
	} else {
		return undefined
	}
}
