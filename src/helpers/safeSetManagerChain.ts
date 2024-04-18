import { pushIfNotIn } from "@alanscodelog/utils"
import { last } from "@alanscodelog/utils/last.js"
import { Result } from "@alanscodelog/utils/Result.js"

import { checkTrigger } from "../internal/checkTrigger.js"
import { checkUntrigger } from "../internal/checkUntrigger.js"
import { getPressedModifierKeys } from "../internal/getPressedModifierKeys.js"
import { getPressedNonModifierKeys } from "../internal/getPressedNonModifierKeys.js"
import { inChain } from "../internal/inChain.js"
import { setManagerProp } from "../setManagerProp.js"
import type { Manager, ManagerSetEntries, MultipleErrors } from "../types/index.js"
import { cloneChain } from "../utils/cloneChain.js"

/**
	* Safely sets the manager's chain.
	*
	* Note that it might seem to do odd things to keep the state consistant and prevent us from getting into invalid states or triggering shorcuts when we shouldn't. Some of these include:
	* 	- If the new chain would trigger a shortcut, the shortcut will be synthetically triggered with a keyup.
 * 	- If the manager is {@link Manager.state.isAwaitingKeyup} to trigger anything ({@link Manager.state.untrigger}), the shortcut will be synthetically triggered with a keyup.
 * 	- If there are still non-modifier keys being pressed, the manager will wait until they are all released before allowing keys to be added to the chained again.
 * 	- Modifiers will stay in the first chord if they are still being pressed according to {@link Key.press}. This makes it possible for the user to trigger multiple shortcuts without releasing a modifier.  This can result in potentially strange behavior for shortcuts longer than one chord, as further chords can be started without releasing the modifiers. If you don't like this, you can pass `{preserveModifiers: false}` to force the user to release the modifiers.
 * 	- If there are still modifier keys being pressed, the manager will add them to the last chord, unless you pass `preserverModifiers: false`.
 *		- **If keys are currently being held ({@link Key.pressed} is true), note that the manager's state and the key state state may not match. This is usually not a problem with normal key presses, but... **
 * 	- If using virtualPress/virtualToggle, the keys might remain pressed, potentially causing issues. In those cases you can use the {@link Manager.listener} to keep track of whether keys are virtually pressed or not (virtually pressed keys have no events), and unpress the ones you should.
 * 	- Setting a `[]` chain is slightly different than setting a `[[]]` chain to keep the behavior of the manager consistent on the next key press.
 * 		- When you set `[]`, the function will also set {@link Manager.state.nextIsChord} to `true`, so it knows to insert a chord on the next key press.
 * 		- When you set `[[]]`, it will set it to `false`, since the chord already exists.
 */
export function safeSetManagerChain(
	manager: Manager,
	chain: string[][],
	{ preserveModifiers = true }: { preserveModifiers?: boolean } = {},
): Result<string[][], MultipleErrors<
		ManagerSetEntries["state.chain"]["error"]
	>> {
	const newChain = cloneChain(chain)
	if (getPressedNonModifierKeys(manager).length > 0) {
		setManagerProp(manager, "state.isAwaitingKeyup", true, { check: false })
	}
	const pressedModifiers = getPressedModifierKeys(manager)
	if (preserveModifiers && pressedModifiers.length > 0) {
		if (newChain.length > 0) {
			pushIfNotIn(last(newChain), pressedModifiers)
		} else {
			newChain.push(pressedModifiers)
		}
	}
		

	const can = setManagerProp(manager, "state.chain", newChain, { check: "only" })
	if (can.isError) return can as any

	checkUntrigger(manager)

	setManagerProp(manager, "state.chain", newChain).unwrap()
	const isEmpty = newChain.length === 0 || (newChain.length === 1 && newChain?.[0].length === 0)
	if (!isEmpty) {
		setManagerProp(manager, "state.nextIsChord", inChain(manager), { check: false })
		checkTrigger(manager)
		checkUntrigger(manager)
	} else {
		setManagerProp(manager, "state.nextIsChord", newChain.length === 0, { check: false })
	}
	return Result.Ok(manager.state.chain)
}

