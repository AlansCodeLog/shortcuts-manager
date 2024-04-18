import { castType } from "@alanscodelog/utils/castType.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { calculateLayoutSize } from "./helpers/calculateLayoutSize.js"
import { KnownError } from "./helpers/KnownError.js"
import { areValidVariants } from "./internal/areValidVariants.js"
import { errorTextAdd } from "./internal/errorTextAdd.js"
import { errorTextInUse } from "./internal/errorTextInUse.js"
import { errorTextRemove } from "./internal/errorTextRemove.js"
import { type CanHookErrors, type CanHookKeysProps, ERROR, type Key, type Keys, type KeysSetEntries, type Manager,type MultipleErrors } from "./types/index.js"
import { containsKey } from "./utils/containsKey.js"


const canHookable: CanHookKeysProps[] = ["entries@add", "entries@remove"]

/**
 * Sets a settable {@link Keys} property.
 */
export function setKeysProp<
	TEntries extends KeysSetEntries ,
	TProp extends keyof KeysSetEntries,
	TEntry extends TEntries[TProp] ,
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,
>(
	prop: TProp,
	val: TEntry["val"],
	manager: TEntry["manager"] & { hooks?: THooks },
	{
		check = true as TCheck,
	}: { check?: TCheck } = {}
): Result<
	TCheck extends "only" ? true : Key,
	MultipleErrors<TEntry["error"]>
		| CanHookErrors<Manager["hooks"] extends never ? never : THooks, "canSetKeysProp">
	> {
	const keys = manager.keys
	if (check) {
		switch (prop) {
			case "entries@add": {
				castType<TEntries["entries@add"]["val"]>(val)
				castType<TEntries["entries@add"]["manager"]>(manager)

				const s = manager.options.stringifier
				const key = val
				// we only need to check .entries at this point
				const existing = keys.entries[key.id]

				if (existing) {
					return Result.Err(new KnownError(
						ERROR.DUPLICATE_KEY,
						errorTextAdd(
							"Key",
							s.stringify(existing, manager),
							s.stringify(existing, manager),
							s.stringify(key, manager)
						),
						{ existing, self: keys }
					))
				}
				const areValidVariantsRes = areValidVariants(key, manager)
				if (areValidVariantsRes.isError) return areValidVariantsRes

				break
			}
			case "entries@remove": {
				castType<TEntries["entries@remove"]["val"]>(val)
				castType<TEntries["entries@remove"]["manager"]>(manager)
				const s = manager.options.stringifier

				const key = val
				if (!keys.entries[key.id]) {
					return Result.Err(new KnownError(
						ERROR.MISSING,
						errorTextRemove(
							"Key",
							s.stringify(key),
							s.stringifyList("keys", Object.values(keys.entries))
						),
						{ entry: key.id, self: keys }
					)) as any
				}

				const inUseShortcuts = manager.shortcuts.entries.filter(shortcut => containsKey(shortcut.chain, key.id, keys))

				if (inUseShortcuts.length > 0) {
					return Result.Err(new KnownError(
						ERROR.KEY_IN_USE,
						errorTextInUse(
							"key",
							s.stringify(key),
							s.stringifyList("shortcuts", inUseShortcuts, manager)),

						{ inUseShortcuts }))
				}

				break
			}
			default: break
		}
		if (manager.hooks && "canSetKeysProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = manager.hooks.canSetKeysProp?.(keys, prop as any, val as any)
			if (canHook instanceof Error) {
				return Result.Err(canHook) as any
			}
		}
	}
	
	if (check === "only") {
		return Result.Ok(true) satisfies Result<true, never> as any
	}

	switch (prop) {
		case "entries@add": {
			castType<TEntries["entries@add"]["val"]>(val)
			castType<TEntries["entries@add"]["manager"]>(manager)

			const key = val
			keys.entries[key.id] = key
			if (key.isToggle === "native") {
				setKeysProp("nativeToggleKeys", [
					...keys.nativeToggleKeys,
					key.id,
				], manager).unwrap()
			}
			if (key.isModifier === "native") {
				setKeysProp("nativeModifierKeys", [
					...keys.nativeModifierKeys,
					key.id,
				], manager).unwrap()
			}
			if (key.isToggle) {
				setKeysProp(`toggles@add@${key.toggleOnId}`, key, manager).unwrap()
				setKeysProp(`toggles@add@${key.toggleOffId}`, key, manager).unwrap()
			}
			if (key.variants) {
				for (const variant of key.variants) {
					setKeysProp(`variants@add@${variant}`, key.id, manager).unwrap()
				}
			}
			if (keys.autoManageLayout) {
				setKeysProp("layout", calculateLayoutSize(keys), manager).unwrap()
			}
			break
		}
		case "entries@remove": {
			const key = val as any as Key
			delete keys.entries[key.id]
			if (key.isToggle === "native") {
				setKeysProp("nativeToggleKeys", keys.nativeToggleKeys.filter(k => k !== key.id), manager).unwrap()
			}
			if (key.isModifier === "native") {
				setKeysProp("nativeModifierKeys", keys.nativeToggleKeys.filter(k => k !== key.id), manager).unwrap()
			}
			
			if (key.isToggle) {
				setKeysProp(`toggles@remove@${key.toggleOnId}`, key, manager).unwrap()
				setKeysProp(`toggles@remove@${key.toggleOffId}`, key, manager).unwrap()
			}
			if (key.variants) {
				for (const variant of key.variants) {
					setKeysProp(`variants@remove@${variant}`, key.id, manager).unwrap()
				}
			}
			if (keys.autoManageLayout) {
				setKeysProp("layout", calculateLayoutSize(keys), manager).unwrap()
			}
			break
		}
		default:
			if (prop.startsWith("toggles@add@")) {
				const name = prop.slice("toggles@add@".length)
				keys.toggles[name] = val as Key
			} else if (prop.startsWith("toggles@remove@")) {
				const name = prop.slice("toggles@remove@".length)
				delete keys.toggles[name]
			} else if (prop.startsWith("variants@add@")) {
				const variant = prop.slice("variants@add@".length)
				const existing = keys.variants[variant]
					? [...keys.variants[variant]]
					: []
				existing.push(val as string)
				keys.variants[variant] = existing
			} else if (prop.startsWith("variants@remove@")) {
				const variant = prop.slice("variants@remove@".length)
				const existing = keys.variants[variant]
					? [...keys.variants[variant]]
					: []
				existing.splice(existing.indexOf(val as string), 1)
				if (existing.length > 0) {
					keys.variants[variant] = existing
				} else {
					delete keys.variants[variant]
				}
			} else {
				(keys as any)[prop] = val
			}
			break
	}

	manager.hooks?.onSetKeysProp?.(keys, prop as any, val as any)
	
	return Result.Ok(keys) satisfies Result<Keys, never> as any
}

