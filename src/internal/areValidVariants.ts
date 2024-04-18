import { crop } from "@alanscodelog/utils/crop.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { getKeyFromIdOrVariant } from "../helpers/getKeyFromIdOrVariant.js"
import { KnownError } from "../helpers/KnownError.js"
import { ERROR, type Key, type KeysSetEntries } from "../types/index.js"


export function areValidVariants(
	key: Key,
	manager: KeysSetEntries["entries@add"]["manager"]
): Result<true, KnownError<ERROR.INVALID_VARIANT_PAIR>> {
	const keys = manager.keys
	const s = manager.options.stringifier
	const existingVariants = (keys.variants?.[key.id]?.map(id => keys.entries[id]) ?? [])

	const keysVariants = key.variants
		? key.variants
			.flatMap(id => {
				const res = getKeyFromIdOrVariant(id, keys)
				if (res.isOk) return res.value
				// it's fine for a key's variants to not exist / have been added yet
				return []
			})
		: []

	const variants = [...existingVariants, ...keysVariants]
	for (const k of variants) {
		if (!!key.isToggle !== !!k.isToggle) {
			const stringKey = s.stringify(key, manager)
			const stringOtherKey = s.stringify(k, manager)
			return Result.Err(new KnownError(ERROR.INVALID_VARIANT_PAIR, crop`
				Key ${stringKey} specifies a variant or matches an existing key's variant (${stringOtherKey}), but their functionality is not the same.

				Key ${stringKey} "isToggle" is "${key.isToggle}" while key ${stringOtherKey} "isToggle" is "${k.isToggle}".
			`, {
				variants,
				key,
				otherKey: k,

			}))
		}

		if (!!key.isModifier !== !!k.isModifier) {
			const stringKey = s.stringify(key, manager)
			const stringOtherKey = s.stringify(k, manager)
			return Result.Err(new KnownError(ERROR.INVALID_VARIANT_PAIR, crop`
				Key ${stringKey} specifies a variant or matches an existing key's variant (${stringOtherKey}), but their functionality is not the same.

				Key ${stringKey} "isModifier" is "${key.isModifier}" while key ${stringOtherKey} "isModifier" is "${k.isModifier}".
			`, {
				variants,
				key,
				otherKey: k,
			}))
		}
	}
	return Result.Ok(true)
}
