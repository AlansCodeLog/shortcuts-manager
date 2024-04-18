import { isArray } from "@alanscodelog/utils/isArray.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "./KnownError.js"

import { ERROR, type Key, type Keys } from "../types/index.js"


export function getKeyFromIdOrVariant(
	id: string,
	keys: Keys
): Result<Key[], KnownError<ERROR.UNKNOWN_KEY_EVENT>> {
	let k: Key | Key[] = keys.entries[id] ?? keys.toggles[id]
	if (k === undefined) {
		if (keys.variants[id]) {
			const variants = keys.variants[id]
				.map(_ => keys.entries[_] ?? keys.toggles[_])
				.filter(_ => _ !== undefined)
			if (variants.length > 0) k = variants
		}
	}
	if (!isArray(k) && k !== undefined) k = [k]
	if (k === undefined) {
		return Result.Err(new KnownError(
			ERROR.UNKNOWN_KEY_EVENT,
				`Tried to get unknown key (${id}).`,
				{ } as any // todo
		))
	}
	return Result.Ok(k)
}
