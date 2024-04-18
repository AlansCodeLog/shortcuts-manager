import { setManagerProp } from "../setManagerProp.js"
import type { Manager } from "../types/index.js"


/**
 * The default callback for the manager which logs the error, the event that caused it, and clears the chain.
 *
 * @internal
 */
export const defaultManagerCallback: Manager["options"]["cb"] = (manager: Manager, error, e): void => {
	// eslint-disable-next-line no-console
	console.warn(error, e)
	setManagerProp(manager, "state.chain", [])
}
