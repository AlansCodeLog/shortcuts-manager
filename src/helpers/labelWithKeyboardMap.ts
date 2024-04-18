import { setKeyProp } from "../setKeyProp.js"
import type { KeySetEntries, LabelOptions, Manager } from "../types/index.js"

/**
 * Labels keys using the experimental navigator keyboard [map](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardLayoutMap) (you can get it using {@link getKeyboardLayoutMap} which safely gets it if it's available, otherwise you can use [navigator.getLayoutMap](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/navigator.getLayoutMap)).
 *
 * It will check for the key in the map first by the id, then by their variants.
 *
 *It returns a list of key ids that were set.
 *
 * Note that not all keys can be auto labeled with the navigator. Modifier keys and some other keys are not available.
 *
 * You can use {@link labelWithEvent} as a fallback, by using it with a filter and only labeling the keys that were not set by this function.
 */
export function labelWithKeyboardMap<
	THooks extends KeySetEntries["label"]["hooks"],
>(
	manager: Pick<Manager, "keys"> & { hooks?: THooks },
	opts: LabelOptions,
): string[] {
	const set = []
	for (const key of Object.values(manager.keys.entries)) {
		const codes = [key.id, ...(key.variants ?? [])]
		for (const code of codes) {
			const label = opts.map.get(code)
			if (label) {
				if (!opts.labelFilter || opts.labelFilter({ key: label }, key.id, label, manager.keys)) {
				// its fine to ignore any errors even if they're custom errors
					setKeyProp(key, "label", label, manager)
					set.push(key.id)
				}
			}
		}
	}
	return set
}

