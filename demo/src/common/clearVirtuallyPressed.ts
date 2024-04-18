import type { Manager } from "shortcuts-manager"
import { virtualRelease } from "shortcuts-manager/helpers/virtualRelease.js"


export function clearVirtuallyPressed(
	virtuallyPressedKeys: Record<string, boolean>,
	manager: Manager
): void {
	for (const key of Object.keys(virtuallyPressedKeys)) {
		virtualRelease(manager, key)
	}
}
