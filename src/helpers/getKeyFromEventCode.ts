import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "./KnownError.js"

import { ERROR, type Key } from "../types/index.js"


export function getKeyFromEventCode(
	code: string,
	e: { code: string } | { key: string } | { button: number } | { deltaY: number },
	keys: Record<string, Key>,
	{
		pressedState: pressState,
		includeDisabled = false,
	}: {
		includeDisabled?: boolean
		pressedState?: boolean
	} = {}
): Result<string[], KnownError<ERROR.UNKNOWN_KEY_EVENT>> {
	const keyIds = []
	const disabledIds = []
	for (const key of Object.values(keys)) {
		if (
			(pressState === undefined ? true : key.pressed === pressState)
			&& (
				key.id === code
				|| key.variants?.includes(code)
			)
		) {
			if (key.enabled) {
				keyIds.push(key.id)
			} else if (!key.enabled) {
				if (includeDisabled) {
					keyIds.push(key.id)
				} else {
					disabledIds.push(key.id)
				}
			}
		}
	}

	if (keyIds.length === 0 && disabledIds.length === 0) {
		const withCode = "code" in e && e.code !== undefined
			? `code: ${e.code}` : undefined
		const withKey = "key" in e && e.key !== undefined
			? `key: ${e.key}` : undefined
		const withButton = "button" in e && e.button !== undefined
			? `button: ${e.button}` : undefined
		const withDeltaY = "deltaY" in e && e.deltaY !== undefined
			? `deltaY: ${e.deltaY}` : undefined

		const info = [withCode, withKey, withButton, withDeltaY]
			.filter(_ => _ !== "undefined")
			.join(", ")
			
		return Result.Err(new KnownError(
			ERROR.UNKNOWN_KEY_EVENT,
			`An unknown key (${info}) was pressed.`,
			// todo
			{ e: e as any }
		))
	}
	return Result.Ok(keyIds)
}
