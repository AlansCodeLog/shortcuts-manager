import type { Manager } from "@/classes"

/**
 * The default callback for the manager which logs the error and clears the chain.
 *
 * @internal
 */
export const defaultManagerCallback: Manager["cb"] = (error, manager): void => {
	// eslint-disable-next-line no-console
	console.log(error)
	manager.clearChain()
}
