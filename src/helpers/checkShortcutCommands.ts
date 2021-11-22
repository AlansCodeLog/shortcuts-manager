import { crop, Err, Ok, Result } from "@alanscodelog/utils"

import type { Commands, KeysStringifier, Shortcut } from "@/classes"
import { ERROR } from "@/types"

import { KnownError } from "."


export function checkShortcutCommands(shortcut: Shortcut, commands: Commands, s: KeysStringifier): Result<true, KnownError<ERROR.UNKNOWN_COMMAND_IN_SHORTCUT>>
export function checkShortcutCommands(shortcut: Pick<Shortcut, "chain" | "command">, commands: Commands, s: KeysStringifier, realShortcut: Shortcut): Result<true, KnownError<ERROR.UNKNOWN_COMMAND_IN_SHORTCUT>>
export function checkShortcutCommands(shortcut: Pick<Shortcut, "chain" | "command">, commands: Commands, s: KeysStringifier, realShortcut?: Shortcut): Result<true, KnownError<ERROR.UNKNOWN_COMMAND_IN_SHORTCUT>> {
	const unknownCommand = (shortcut.command
		? commands.query(known => known === shortcut.command, false) === undefined
			? shortcut.command
			: undefined
		: undefined)

	if (unknownCommand) {
		return Err(new KnownError(ERROR.UNKNOWN_COMMAND_IN_SHORTCUT, crop`
			${s.stringify(shortcut.chain)} contains unknown command: ${unknownCommand.name}
		`, { shortcut: (realShortcut ? realShortcut : shortcut) as Shortcut, command: unknownCommand }))
	}
	return Ok()
}
