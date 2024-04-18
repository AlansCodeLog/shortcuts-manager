import { checkUntrigger } from "./checkUntrigger.js"
import { cloneLastChord } from "./cloneLastChord.js"
import { inChain } from "./inChain.js"

import { getTriggerableShortcut } from "../helpers/getTriggerableShortcut.js"
import { KnownError } from "../helpers/KnownError.js"
import { setManagerProp } from "../setManagerProp.js"
import { type AnyInputEvent, ERROR,type Manager } from "../types/index.js"
import { isTriggerKey } from "../utils/isTriggerKey.js"


export function checkTrigger(
	manager: Manager,
	e?: AnyInputEvent,
): void {
	checkUntrigger(manager, e)
	const hadUntrigger = manager.state.untrigger
	const cb = manager.options.cb
	if (!manager.options.enableShortcuts) return
	const res = getTriggerableShortcut(manager)
	if (res.isError) {
		cb(manager, res.error as KnownError<ERROR.MULTIPLE_MATCHING_SHORTCUTS>, e)
	} else if (res.value && res.value !== hadUntrigger) {
		setManagerProp(manager, "state.untrigger", res.value)
		setManagerProp(manager, "state.nextIsChord", false)
		const command = manager.commands.entries[res.value.command]
		command.execute?.({ isKeydown: true, command, shortcut: res.value, event: e, manager })
	}
	const triggerKey = cloneLastChord(manager.state.chain)?.find(id => isTriggerKey(manager.keys.entries[id]))
	const nonTriggerKey = cloneLastChord(manager.state.chain)?.find(id => !isTriggerKey(manager.keys.entries[id]))
	if (triggerKey) {
		if (inChain(manager) || manager.state.isRecording) {
			setManagerProp(manager, "state.nextIsChord", true)
			if (nonTriggerKey) {
				setManagerProp(manager, "state.isAwaitingKeyup", true)
			}
		} else if (!manager.state.isRecording && !inChain(manager) && (res.isOk && !res.value) && manager.state.chain.length > 1) {
			const error = new KnownError(
				ERROR.NO_MATCHING_SHORTCUT,
				"A chord containing a non-modifier key was pressed while in a chord chain, but no shortcut found to trigger.",
				{ chain: manager.state.chain }
			)
			
			cb(manager, error, e)
		}
	}
}

