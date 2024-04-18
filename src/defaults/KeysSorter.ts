import { getKeyFromIdOrVariant } from "../helpers/getKeyFromIdOrVariant.js"
import { keyOrder } from "../internal/keyOrder.js"
import { type IKeysSorter, KEY_SORT_POS, type Keys, type KeySortPos } from "../types/index.js"


/**
 * The default class based implementation of the {@link IKeysSorter} interface.
 *
 * Creates a keys sorter for shortcut chains.
 *
 * Can either be passed some re-arranged enum of KeySortPos or it's keys, for example:
 * ```ts
 * enum MyKeySortPos = {
 * 	KEY_SORT_POS.modmouse,
 * 	KEY_SORT_POS.mod,
 * 	// or
 * 	"modmouse",
 * 	"mod",
 * 	//...
 * }
 *
 * const mySorter = new KeysSorter(MyKeySortPos)
 * new Shortcut([...keys], {sorter: mySorter})
 * ```
 * They way this works is the enum should contain every possible combination of key "types". All sort does is determine the type and use it's position in the enum to know where to sort it. If two keys are of the same type, they are sorted alphabetically by their id.
 *
 * Or you can extend from the class and implement a custom sort function.
 *
 * Ideally a single sorter should be created and shared amongst all instances. This is already taken care of if you do not pass a custom sorter, a default sorter instance is re-used throughout.
 *
 * The order of the default sorter can be changed without creating a new class by importing it early and changing it's `order` property.
 */
export class KeysSorter implements IKeysSorter {
	private _sort(aId: string, bId: string, keys: Keys, order: KeySortPos): number {
		const a = getKeyFromIdOrVariant(aId, keys).unwrap()[0]
		const b = getKeyFromIdOrVariant(bId, keys).unwrap()[0]
		// -1 = a b
		if (keyOrder(a, order) < keyOrder(b, order)) return -1
		// 1 = b a
		if (keyOrder(b, order) < keyOrder(a, order)) return 1
		return aId.localeCompare(bId) // => alphabetical
	}

	constructor(public order: KeySortPos = KEY_SORT_POS) {
	}

	sort(keyList: string[], keys: Keys): string[] {
		return keyList.sort((a, b) => this._sort!(a, b, keys, this.order))
	}
}

export const defaultSorter = new KeysSorter()
