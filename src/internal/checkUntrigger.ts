import { setManagerProp } from "../setManagerProp.js"
import type { AnyInputEvent, Manager, TriggerableShortcut } from "../types/index.js"


export function checkUntrigger(
	manager: Manager,
	e?: AnyInputEvent
): void {
	if (manager.state.untrigger) {
		const untrigger: TriggerableShortcut = manager.state.untrigger
		// MUST be set to false first or we can get into an infinite loop if the user uses `set(chain)` from inside the command execute function
		setManagerProp(manager, "state.untrigger", false)
		setManagerProp(manager, "state.nextIsChord", false)
		if (!manager.options.enableShortcuts) return
		const command = manager.commands.entries[untrigger.command]
		command.execute?.({ isKeydown: false, command, shortcut: untrigger, event: e, manager })
	}
}

