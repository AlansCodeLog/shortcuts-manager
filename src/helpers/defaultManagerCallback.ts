import type { ERROR, ManagerErrorCallback } from "@/types"

/**
 * The default callback for the manager which logs the error and return true to clear the chain.
 *
 * @internal
 */
export const defaultManagerCallback: ManagerErrorCallback<ERROR.MULTIPLE_MATCHING_SHORTCUTS | ERROR.NO_MATCHING_SHORTCUT> = (error, manager): void => {
	// eslint-disable-next-line no-console
	console.log(error)
	manager.clearChain()
}
