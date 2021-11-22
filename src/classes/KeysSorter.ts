import type { Key } from "./Key"

import { keyOrder } from "@/helpers"
import { KEY_SORT_POS, KeysSorterOptions } from "@/types"


const sSort = Symbol("sort")
const sDefaultSort = Symbol("defaultSort")
/**
 * Creates a keys sorter for shortcut chains.
 *
 * Can either be passed some re-arranged enum of KeySortPos or it's keys, for example:
 * ```ts
 * let MyKeySortPos = {
 * 	KEY_SORT_POS.modmouse,
 * 	KEY_SORT_POS.mod,
 * 	// or
 * 	"modmouse",
 * 	"mod",
 * 	//...
 * }
 *
 * const mySorter = new KeysSorter({order: MyKeySortPos})
 * new Shortcut([...keys], {sorter: mySorter})
 * ```
 * They way this works is the enum should contain every possible combination of key "types". All sort does is determine the type and use it's position in the enum to know where to sort it. If two keys are of the same type, they are sorted alphabetically by their id.
 *
 * Or you can pass a completely custom sort function if you really want to (in which case the order option will remain unused unless you use it).
 */
export class KeysSorter {
	order: KeysSorterOptions["order"] = KEY_SORT_POS;
	[sSort]: KeysSorterOptions["sort"]
	[sDefaultSort](a: Key, b: Key, order: KeysSorterOptions["order"]): number {
		// -1 = a b
		if (keyOrder(a, order) < keyOrder(b, order)) return -1
		// 1 = b a
		if (keyOrder(b, order) < keyOrder(a, order)) return 1
		return a.id.localeCompare(b.id) // => alphabetical
	}
	constructor(opts: Partial<KeysSorterOptions> = {}) {
		if (opts.order) this.order = opts.order
		if (opts.sort) this[sSort] = opts.sort
	}
	sort(keys: Key[]): Key[] {
		if (this[sSort]) {
			return keys.sort((a, b) => this[sSort]!(a, b, this.order))
		}
		return keys.sort((a, b) => this[sDefaultSort]!(a, b, this.order))
	}
}

export const defaultSorter = new KeysSorter()
