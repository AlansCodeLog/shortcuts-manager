import { crop, Err, indent, Ok, type Result } from "@alanscodelog/utils"
import type { Commands, Keys, Shortcut, Shortcuts, Stringifier } from "../classes/index.js"
import { ERROR } from "../types/index.js"

import { checkShortcutCommands } from "./checkShortcutCommands.js"
import { checkShortcutKeys } from "./checkShortcutKeys.js"
import { KnownError } from "./KnownError.js"


/**
 * Throws if shortcuts contain keys/commands not in the given keys/commands set.
 */
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys, commands: Commands, s: Stringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>>
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys, commands: undefined, s: Stringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS>>
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: undefined, commands: Commands, s: Stringifier): Result<true, KnownError<ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>>
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys | undefined, commands: Commands | undefined, s: Stringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>> {
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

