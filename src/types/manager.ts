import type { Result } from "@alanscodelog/utils"

import type { Commands, Key, Keys, Manager, Shortcuts } from "@/classes"
import type { KnownError } from "@/helpers"

import type { BaseHookType, ERROR } from "."


export type AnyInputEvent = KeyboardEvent | MouseEvent | WheelEvent


export type ManagerReplaceValue = Partial<Pick<Manager, "shortcuts" | "keys" | "commands">>
export type ManagerReplaceError = Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>>
export type ManagerHook = {
	"replace": BaseHookType<Manager, ManagerReplaceValue, ManagerReplaceError>
	"commands": BaseHookType<Manager, Commands, ManagerReplaceError>
	"shortcuts": BaseHookType<Manager, Shortcuts, ManagerReplaceError>
	"keys": BaseHookType<Manager, Keys, ManagerReplaceError>
	// cannot be allows hooked
	"chain": BaseHookType<Manager, Key[][], never, never, true>
}
