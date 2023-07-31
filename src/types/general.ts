import type { Command, Commands, Condition, Key, Keys, Shortcut, Shortcuts } from "../classes/index.js"


export type Collections = Commands | Shortcuts | Keys
export type Bases = Command | Shortcut | Key | Condition


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
	addEventListener: HTMLElement["addEventListener"]
	removeEventListener: HTMLElement["removeEventListener"]
}
