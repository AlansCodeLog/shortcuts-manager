import type { Commands, Keys, KeysStringifier, Shortcut, Shortcuts } from "@/classes"
import { ERROR } from "@/types"
import { crop, Err, indent, Ok, Result } from "@alanscodelog/utils"
import { KnownError } from "."
import { checkShortcutCommands } from "./checkShortcutCommands"
import { checkShortcutKeys } from "./checkShortcutKeys"





/**
 * Throws if shortcuts contain keys/commands not in the given keys/commands set.
 */
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys, commands: Commands, s: KeysStringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>>
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys, commands: undefined, s: KeysStringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS>>
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: undefined, commands: Commands, s: KeysStringifier): Result<true, KnownError<ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>>
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys | undefined, commands: Commands | undefined, s: KeysStringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>> {
	if (keys) {
		const keyErrors: { shortcut: Shortcut, err: KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUT> }[] = []
		for (const shortcut of shortcuts.entries) {
			const res = checkShortcutKeys(shortcut, keys, s)

			if (res.isError) {
				keyErrors.push({ shortcut, err: res.error })
			}
		}

		if (keyErrors.length > 0) {
			return Err(new KnownError(ERROR.UNKNOWN_KEYS_IN_SHORTCUTS, crop`
			Some shortcuts contain unknown keys.

			${indent(keyErrors.map(({ err }) => err.message).join("\n"), 3)}

			`, { entries: keyErrors.map(({ shortcut, err }) => ({ shortcut, keys: err.info.keys })) }))
		}
	}
	if (commands) {
		const commandErrors: { shortcut: Shortcut, err: KnownError<ERROR.UNKNOWN_COMMAND_IN_SHORTCUT> }[] = []
		for (const shortcut of shortcuts.entries) {
			const res = checkShortcutCommands(shortcut, commands, s)
			if (res.isError) {
				commandErrors.push({ shortcut, err: res.error })
			}
		}
		if (commandErrors.length > 0) {
			return Err(new KnownError(ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS, crop`
			Some shortcuts contain unknown commands.

			${indent(commandErrors.map(({ err }) => err.message).join("\n"), 3)}

			`, { entries: commandErrors.map(({ shortcut, err }) => ({ shortcut, command: err.info.command })) }))
		}
	}
	return Ok(true)
}

