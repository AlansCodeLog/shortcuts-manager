import { castType } from "@alanscodelog/utils/castType.js"
import { crop } from "@alanscodelog/utils/crop.js"
import { Result } from "@alanscodelog/utils/Result.js"
import { set } from "@alanscodelog/utils/set.js"

import { KnownError } from "./helpers/KnownError.js"
import type { CanHookErrors, Key, KeySetEntries, Manager, MultipleErrors, OnHookKeyProps } from "./types/index.js"
import { ERROR } from "./types/index.js"


const canHookable: OnHookKeyProps[] = ["x", "y", "width", "height", "label", "enabled", "render", "classes"]
/**
 * Sets a settable key property.
 *
 * You should not use this to set key state the manager manages (those tagged with @Managed in the docs) unless you've forgone using the manager.
 *
 * Note that while the manager argument is always required, for unmanaged properties you can pass {} and for most others you can pass a partial manager if needed. This is because it's very difficult to keep the heavy per prop types and allow the manager to be optional in these cases.
 */
export function setKeyProp<
	TEntries extends KeySetEntries ,
	TProp extends keyof KeySetEntries,
	TEntry extends TEntries[TProp],
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	/** Key is mutated if check is not "only". */
	key: Key,
	prop: TProp,
	val: TEntry["val"],
	manager: (TEntry["manager"] extends never ? unknown : TEntry["manager"]) & { hooks?: THooks },
	{
		check = true as TCheck,
	}: { check?: TCheck } = {}
): Result<
	TCheck extends "only" ? true : Key,
	MultipleErrors<TEntry["error"]>
	| CanHookErrors<THooks extends never ? never : THooks, "canSetKeyProp">
	> {
	if (check) {
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (prop) {
			case "toggleOnPressed":
			case "toggleOffPressed":
			case "pressed": {
				castType<TEntries["pressed"]["manager"]>(manager)
				const s = manager.options.stringifier
				if (!key.enabled && val === true) {
					return Result.Err(
						new KnownError(ERROR.CANNOT_SET_WHILE_DISABLED, crop`
							The "${prop}" property cannot be set to true while a key is disabled. (Key: ${s.stringify(key, manager)})
						`, { key })
					)
				}
				break
			}
			default: break
		}
		
		if (manager?.hooks && "canSetKeyProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = manager.hooks.canSetKeyProp?.(key, prop as any, val as any)
			if (canHook instanceof Error) {
				return Result.Err(canHook) as any
			}
		}
	}
	
	if (check === "only") {
		return Result.Ok(true) satisfies Result<true, never> as any
	}

	if (prop.includes(".")) {
		set(key, prop.split("."), val)
	} else {
		(key as any)[prop] = val
	}

	manager?.hooks?.onSetKeyProp?.(key, prop, val)
	
	return Result.Ok(key) satisfies Result<Key, never> as any
}

