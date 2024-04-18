import { Result } from "@alanscodelog/utils/Result.js"

import { KnownError } from "./helpers/KnownError.js"
import { ERROR, type Key, type MultipleErrors, type RawKey } from "./types/index.js"


/**
 * Creates a key.
 *
 * @template TId **@internal** See {@link ./README.md Collection Entries}
 * @param id See {@link Key.id}
 * @param opts Set {@link Key}.
 */

export function createKey<
	TKey extends RawKey,
>(
	id: TKey["id"],
	rawKey: Omit<TKey, "id"> = {} as any,
): Result<
		Key<TKey["id"]>,
		MultipleErrors<
		| ERROR.INVALID_VARIANT
		>
	> {
	const k = rawKey
	const key: Key = {
		type: "key",
		id,
		label: k.label ?? id,
		classes: [...(k.classes as any ?? [])],
		x: k.x ?? 0,
		y: k.y ?? 0,
		width: k.width ?? 0,
		height: k.height ?? 0,
		enabled: k.enabled ?? true,
		pressed: false,
		isModifier: k.isModifier ?? false,
		isToggle: (k.isToggle ?? false) satisfies Key["isToggle"] as false,
		...(k.isToggle ? {
			toggleOnId: `${id}On`,
			toggleOffId: `${id}Off`,
			toggleOnPressed: false,
			toggleOffPressed: false,
		} satisfies Partial<Key<string>> : {}) as any,
		variants: k.variants ?? [],
		render: k.render ?? true,
		updateStateOnAllEvents: k.updateStateOnAllEvents ?? true,
	}
	if (key.variants?.includes(key.id)) {
		return Result.Err(
			new KnownError(ERROR.INVALID_VARIANT, `A key variant cannot be the key id itself. Attempted to use "${key.id}" in variants:[ ${key.variants.join(",")} ]`, { variants: key.variants as any /* todo*/, id: key.id })
		)
	}
	return Result.Ok(key)
}
