import { setKeyProp } from "../setKeyProp.js"
import type { AnyInputEvent, KeySetEntries, LabelOptions, Manager, MinimalInputEvent, PickManager } from "../types/index.js"
/**
 * Labels keys using events.
 *
 * For keys uses `KeyboardEvent.key`. For mouse buttons it will label them `Button x` where x is `MouseEvent.button`, and for the mouse wheel, `WheelEvent.deltaY` is used to label them `Wheel Up`/`Wheel Down`.
 *
 * This is intended to be used for labeling keys as they are pressed or as a fallback to {@link labelWithKeyboardMap}. See it for the recommended labeling strategy.
 *
 * A filter can be provided to avoid labeling some keys.
 */
export function labelWithEvent<
	T extends MinimalInputEvent | AnyInputEvent = MinimalInputEvent | AnyInputEvent,
	THooks extends KeySetEntries["label"]["hooks"] = KeySetEntries["label"]["hooks"],
>(
	e: T,
	keyIds: string[],
	manager: Pick<Manager, "keys"> & PickManager<"options", "stringifier"> & { hooks?: THooks },
	options: Partial<Omit<LabelOptions, "map">> = {}
): string[] {
	const set = []
	for (const id of keyIds) {
		let label = ""
		// we don't use instanceof so that we can still be compatible with emulated events
		if ("deltaY" in e) {
			label = e.deltaY < 0 ? "Wheel Up" : "Wheel Down"
		} else if ("button" in e) {
			label = `Button ${e.button}`
		} else if ("key" in e) {
			label = e.key
		}
		if (!options.labelFilter || options.labelFilter(e, id, label, manager.keys)) {
			const key = manager.keys.entries[id]
			set.push(key.id)
			// its fine to ignore any errors even if they're custom errors
			setKeyProp(key, "label", label, manager)
		}
	}
	return set
}

