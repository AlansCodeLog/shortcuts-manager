import type { Command, Commands, Condition, Key, Keys, Shortcut, Shortcuts } from "@/classes"


export type Collections = Commands | Shortcuts | Keys
export type Bases = Command | Shortcut | Key | Condition

/**
 * @internal
 * See https://github.com/typescript-eslint/typescript-eslint/issues/3573
 */
// @ts-expect-error See above.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type IgnoreUnusedTypes<T = any[]> = {}
/**
 * @internal
 * See https://github.com/typescript-eslint/typescript-eslint/issues/3573
 */
// @ts-expect-error See above.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class IgnoreClassUnusedTypes<T = any[]> {}


// eslint-disable-next-line @typescript-eslint/naming-convention
export type NavigatorWKeyboard = {
	keyboard?: {
		getLayoutMap(): Promise<KeyboardLayoutMap>
	}
}
export type KeyCode = string
export type KeyLabel = string
export type KeyboardLayoutMap = Map<KeyCode, KeyLabel>
export type AttachTarget = {
	addEventListener: HTMLElement["addEventListener"],
	removeEventListener: HTMLElement["removeEventListener"]
}
