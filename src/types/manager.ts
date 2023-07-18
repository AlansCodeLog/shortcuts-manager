import type { Commands, Key, Keys, Manager, Shortcuts } from "classes/index.js"
import type { KnownError } from "helpers/index.js"

import type { BaseHookType, ChainErrors, ERROR } from "./index.js"


export type AnyInputEvent = (KeyboardEvent | MouseEvent | WheelEvent)


export type ManagerReplaceValue = Partial<Pick<Manager, "shortcuts" | "keys" | "commands">>
export type ManagerReplaceErrors = KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>

export type ManagerHook = {
	"replace": BaseHookType<Manager, ManagerReplaceValue, ManagerReplaceErrors>
	"commands": BaseHookType<Manager, Commands, ManagerReplaceErrors>
	"shortcuts": BaseHookType<Manager, Shortcuts, ManagerReplaceErrors>
	"keys": BaseHookType<Manager, Keys, ManagerReplaceErrors>
	"labelStrategy": BaseHookType<Manager, boolean | "navigator" | "press" | "both", never>
	// cannot be allows hooked
	"checkStateOnAllEvents": BaseHookType<Manager, boolean, never>
	"chain": BaseHookType<Manager, Key[][], KnownError<ChainErrors>, never, true>
}


export type ManagerListener = ({ event, keys, isKeydown }: { event: AnyInputEvent, keys: Key[], isKeydown: boolean }) => void

export type ExportedManager = {
	shortcuts?: ReturnType<Shortcuts["export"]>
	keys?: ReturnType<Keys["export"]>
	commands?: ReturnType<Commands["export"]>
}
