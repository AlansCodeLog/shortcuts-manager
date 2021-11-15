import { crop, indent } from "@alanscodelog/utils/dist/utils"

import type { Command, Commands, Key, Keys, KeysStringifier, Shortcut, Shortcuts } from "@/classes"
import { ERROR } from "@/types"

import { KnownError } from "."


/**
 * Throws if shortcuts contain keys/commands not in the given keys/commands set.
 */
export function checkManagerShortcuts(shortcuts: Shortcuts, keys: Keys, commands: Commands, s: KeysStringifier): void {
	const unknownKeys = shortcuts.entries.map(shortcut =>
		[
			shortcut,
			shortcut.keys
				.flat()
				.map(key => keys.query(known => known === key, false) === undefined
					? key
					: undefined)
				.filter(key => key !== undefined),
		] as [Shortcut, Key[]]
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	).filter(([_shortcut, keys_]) => keys_.length !== 0)

	if (unknownKeys.length > 0) {
		throw new KnownError(ERROR.UNKNOWN_KEYS, crop`
			Some shortcuts contain unknown keys.

			${indent(unknownKeys.map(([shortcut, unknownKeys_]) =>
			`${s.stringify(shortcut.keys)}${shortcut.command ? ` (Command: ${shortcut.command.name})` : ""}: ${s.stringifyKeys(unknownKeys_)}`).join("\n")
			, 3)}

			`, { entries: unknownKeys })
	}

	const unknownCommands = shortcuts.entries.map(shortcut =>
		[
			shortcut,
			shortcut.command
				? commands.query(known => known === shortcut.command, false) === undefined
					? shortcut.command
					: undefined
				: undefined,
		]
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	).filter(([_shortcut, command]) => command !== undefined) as [Shortcut, Command][]

	if (unknownCommands.length > 0) {
		throw new KnownError(ERROR.UNKNOWN_COMMANDS, crop`
			Some shortcuts contain unknown commands.

			${indent(unknownCommands.map(([shortcut, unknownCommand]) =>
			`${s.stringify(shortcut.keys)}: Command ${unknownCommand.name}`
		).join("\n"))}

			`, { entries: unknownCommands })
	}
}
