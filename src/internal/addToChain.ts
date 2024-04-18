import { Result } from "@alanscodelog/utils/Result.js"

import { checkTrigger } from "./checkTrigger.js"

import { setManagerProp } from "../setManagerProp.js"
import type { AnyInputEvent, Manager, ManagerSetEntries, MultipleErrors } from "../types/index.js"
import { cloneChain } from "../utils/cloneChain.js"


export function addToChain(
	manager: Manager,
	keysList: string[],
	e?: AnyInputEvent,
): Result<true, MultipleErrors<ManagerSetEntries["state.chain"]["error"]>> {
	const sorter = manager.options.sorter
	if (manager.state.isAwaitingKeyup) return Result.Ok(true)
	if (keysList.length === 0) return Result.Ok(true)

	if (manager.state.nextIsChord) {
		// we unwrap when setting the chain because the manager should not be creating invalid states
		// if it does, it's a bug
		setManagerProp(manager, "state.chain", cloneChain([...manager.state.chain, []])).unwrap()
		setManagerProp(manager, "state.nextIsChord", false)
	}
	const length = manager.state.chain.length - 1
	const lastChord = [...(manager.state.chain[length] ?? [])]
	for (const id of keysList) {
		if (!lastChord.includes(id)) {
			lastChord.push(id)
			const res = setManagerProp(manager, "state.chain", cloneChain([
				...manager.state.chain.slice(0, length),
				sorter.sort(lastChord, manager.keys),
			]))
			if (res.isError) return res as any
			checkTrigger(manager, e)
		}
	}
	return Result.Ok(true)
}

