import type { createManager } from "./createManager.js"
import { defaultConditionEquals } from "./defaults/defaultConditionEquals.js"
import { defaultManagerCallback } from "./defaults/defaultManagerCallback.js"
import { defaultSorter } from "./defaults/KeysSorter.js"
import { defaultStringifier } from "./defaults/Stringifier.js"
import type { Manager } from "./types/index.js"


/**
 * Many methods require some of the manager's options, but not the entire manager. Also it's easier to create a manager from scratch by first creating it's options
 *
 * This can be used to create the base manager options.
 */
export function createManagerOptions(
	rawOpts: Parameters<typeof createManager>[0]["options"],
): Manager["options"] {
	const options: Manager["options"] = {
		sorter: defaultSorter,
		stringifier: defaultStringifier,
		conditionEquals: defaultConditionEquals,
		cb: defaultManagerCallback,
		enableShortcuts: true,
		enableListeners: true,
		updateStateOnAllEvents: true,
		...rawOpts,
	}
	return options
}
