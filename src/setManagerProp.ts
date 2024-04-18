import { castType } from "@alanscodelog/utils/castType.js"
import { Result } from "@alanscodelog/utils/Result.js"
import { set } from "@alanscodelog/utils/set.js"

import { isValidManager } from "./helpers/isValidManager.js"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type safeSetManagerChain } from "./helpers/safeSetManagerChain.js"
import { areValidKeys } from "./internal/areValidKeys.js"
import type { CanHookErrors, CanHookManagerProps, Manager, ManagerSetEntries, MultipleErrors } from "./types/index.js"
import { cloneChain } from "./utils/cloneChain.js"


const canHookable: CanHookManagerProps[] = ["state.chain", "shortcuts", "commands", "keys"]

/**
 * Safely sets a settable manager property.
 *
 * You should not use this to set properties the manager manages (those tagged with @Managed in the docs) unless you've forgone using the manager.
 *
 * If you need to set the chain, use {@link safeSetManagerChain}.
 *
 * If enabling/disabling {@link Manager.state.isRecording} it's suggested you use {@link safeSetManagerChain} just before.
 *
 * # How to set multiple manager properties safely (i.e. batch replace shortcuts/commands/keys)
 *
 * This can be an issue because there isn't a way to tell the manager you want to replace *multiple* properties and it might be impossible to, for example, replace commands with a smaller subset but not have it error even if you're planning to replace the shortcuts so they don't contain missing commands.
 *
 * To achieve this, you can shallow clone the manager, change all the properties you want directly, then validate it's state by using isValidManager which is what this function does internally.
 *
 * Once you know it's valid, detach the old manager and attach the new one.
 * ```ts
 * const clone = {...manager, keys: newKeys, shortcuts: newShortcuts}
 *
 * if (isValidManager(manager)) {
 * detach(manager, ...)
 * 	attach(clone, ...)
 * }
 * ```
 */

export function setManagerProp<
	TEntries extends ManagerSetEntries,
	TProp extends keyof ManagerSetEntries,
	TEntry extends TEntries[TProp] ,
	THooks extends Manager["hooks"],
	TCheck extends boolean | "only" = true,

>(
	/** Manager is mutate if check is not "only" */
	manager: TEntry["manager"] & { hooks?: THooks },
	prop: TProp,
	val: TEntry["val"],
	{ check = true as TCheck }: { check?: TCheck } = {}
): Result<
		TCheck extends "only" ? true : Manager,
		MultipleErrors<TEntry["error"]>
	| CanHookErrors<Manager["hooks"] extends never ? never : THooks, "canSetManagerProp">
	>
{
	// castType is used extensively because of https://github.com/microsoft/TypeScript/issues/50652
	if (check) {
		switch (prop) {
			case "state.chain": {
				castType<TEntries["state.chain"]["val"]>(val)
				castType<TEntries["state.chain"]["manager"]>(manager)
				
				const resIsValid = areValidKeys(val, manager)
				if (resIsValid.isError) return resIsValid satisfies Result<never, MultipleErrors<TEntries["state.chain"]["error"]>>
				break
			}
			case "commands":
			case "keys":
			case "shortcuts": {
				castType<TEntries["commands" | "shortcuts" | "keys"]["val"]>(val)
				castType<TEntries["commands" | "shortcuts" | "keys"]["manager"]>(manager)

				const managerClone = { ...manager, [prop as any]: val }
				const res = isValidManager(managerClone)
				if (res.isError) return res
				break
			}
			default:
				break
		}
		if (manager?.hooks && "canSetManagerProp" in manager.hooks && canHookable.includes(prop as any)) {
			const canHook = manager.hooks?.canSetManagerProp?.(manager, prop as any, val as any)
			if (canHook instanceof Error) {
				return Result.Err(canHook) as any
			}
		}
	}
	if (check === "only") {
		return Result.Ok(true) satisfies Result<true, never> as any
	}


	if ((prop as string).includes(".")) {
		if (prop === "state.chain") {
			val = cloneChain(val as any) satisfies Manager["state"]["chain"] as any
		}
		set(manager, (prop as string).split("."), val)
	} else {
		(manager as any)[prop] = val
	}

	manager.hooks?.onSetManagerProp?.(manager, prop, val)

	return Result.Ok(manager) satisfies Result<Manager, never> as any
}

