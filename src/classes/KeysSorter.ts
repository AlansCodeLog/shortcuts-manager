import { keyOrder } from "@/helpers"
import { KeysSorterOptions, KEY_SORT_POS } from "@/types"
import type { Key } from "./Key"


/**
 * Creates a keys sorter for shortcut chords.
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
	order: KeysSorterOptions["order"] = KEY_SORT_POS
	#sort: KeysSorterOptions["sort"]
	#defaultSort(a: Key, b: Key, order: KeysSorterOptions["order"]): number {
		// -1 = a b
		if (keyOrder(a, order) < keyOrder(b, order)) return -1
		// 1 = b a
		if (keyOrder(b, order) < keyOrder(a, order)) return 1
		return a.id.localeCompare(b.id) // => alphabetical
	}
	constructor(opts: Partial<KeysSorterOptions> = {}) {
		if (opts.order) this.order = opts.order
		if (opts.sort) this.#sort = opts.sort
	}
	sort(keys: Key[]): Key[] {
		if (this.#sort) {
			return keys.sort((a, b) => this.#sort!(a, b, this.order))
		}
		return keys.sort((a, b) => this.#defaultSort!(a, b, this.order))
	}
}

export const defaultSorter = new KeysSorter()
