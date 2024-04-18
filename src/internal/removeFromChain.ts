import { Result } from "@alanscodelog/utils/Result.js"

import { checkTrigger } from "./checkTrigger.js"
import { checkUntrigger } from "./checkUntrigger.js"
import { cloneLastChord } from "./cloneLastChord.js"
import { getPressedNonModifierKeys } from "./getPressedNonModifierKeys.js"

import { setManagerProp } from "../setManagerProp.js"
import type { AnyInputEvent, Manager, ManagerSetEntries, MultipleErrors } from "../types/index.js"
import { cloneChain } from "../utils/cloneChain.js"


export function removeFromChain(
	manager: Manager,
	keys: string[],
	e?: AnyInputEvent,
): Result<true, MultipleErrors<ManagerSetEntries["state.chain"]["error"]>> {
	if (keys.length === 0) return Result.Ok(true)
	if (manager.state.isAwaitingKeyup) {
		checkUntrigger(manager, e)
		if (getPressedNonModifierKeys(manager).length === 0) {
			setManagerProp(manager, "state.isAwaitingKeyup", false)
		}
	}

	if (manager.state.nextIsChord) return Result.Ok(true)
	const lastChord = cloneLastChord(manager.state.chain) ?? []
	for (const id of keys) {
		const key = manager.keys.entries[id]
		const i = lastChord.indexOf(key.id)

		if (i > -1) {
			lastChord.splice(i, 1)
			const chain = manager.state.chain
			const precedingChords = chain.slice(0, chain.length - 1)
			const spreadableLastChord = precedingChords.length === 0 && lastChord.length === 0
					? []
					: [lastChord]
			const res = setManagerProp(manager, "state.chain", cloneChain([...precedingChords, ...spreadableLastChord]))
			if (res.isError) return res as any
		}
	}
	checkTrigger(manager, e)
	return Result.Ok(true)
}

