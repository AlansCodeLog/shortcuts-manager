import { crop, Err, Ok, type Result } from "@alanscodelog/utils"

import { KnownError } from "./KnownError.js"

import type { Key, Keys, Shortcut, Stringifier } from "../classes/index.js"
import { ERROR } from "../types/index.js"


export function checkShortcutKeys(shortcut: Shortcut, keys: Keys, s: Stringifier): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUT>>
export function checkShortcutKeys(shortcut: Pick<Shortcut, "chain" | "command">, keys: Keys, s: Stringifier, realShortcut: Shortcut): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUT>>
export function checkShortcutKeys(shortcut: Pick<Shortcut, "chain" | "command">, keys: Keys, s: Stringifier, realShortcut?: Shortcut): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUT>> {
	const unknownKeys = shortcut.chain
		.flat()
		.map(key => keys.query(known => known === key, false) === undefined
			? key
			: undefined)
		.filter(key => key !== undefined) as Key[]

	if (unknownKeys.length > 0) {
		return Err(new KnownError(ERROR.UNKNOWN_KEYS_IN_SHORTCUT, crop`
		${s.stringify(shortcut.chain)}${shortcut.command ? ` (Command: ${shortcut.command.name})` : ""} contains unknown keys: ${s.stringifyKeys(unknownKeys)}
		`, { shortcut: (realShortcut ? realShortcut : shortcut) as Shortcut, keys: unknownKeys }))
	}
	return Ok(true)
}
