import type { Key } from "./Key"

import { keyOrder } from "@/helpers"
import { KEY_SORT_POS, KeysSorterOptions } from "@/types"


const defaultOpts: KeysSorterOptions = {
	order: KEY_SORT_POS,
	sort(a: Key, b: Key): number {
		// -1 = a b
		if (keyOrder(a, this.order) < keyOrder(b, this.order)) return -1
		// 1 = b a
		if (keyOrder(b, this.order) < keyOrder(a, this.order)) return 1
		return a.id.localeCompare(b.id) // => alphabetical
		// Note: technically this doesn't affect "normal" (non-modifier/mouse/wheel/toggle keys) keys since there can only ever be one per chord.
	},
}

function init(self: any, defaults: KeysSorterOptions, opts: Partial<KeysSorterOptions>): asserts self is KeysSorterOptions {
	self = self ?? {}
	self.order = opts.order ?? defaults.order
	self.sort = (opts.sort ?? defaults.sort).bind(self)
}

/**
 * Creates a keys sorter for shortcuts.
 *
 * Can either be passed some re-arranged enum of KeySortPos, for example:
 * ```ts
 * let MyKeySortPos = {
 * 	KeySortPos.modmouse,
 * 	KeySortPos.mod,
 * 	//...
 * }
 * // They way this works is the enum should contain every possible combination of key "types". All sort does is determine the type and use it's position in the enum to know where to sort it.
 * ```
 * Or you can pass a completely custom sort function if you really want to (in which case the order option will remain unused unless you use it).
 */
export class KeysSorter implements KeysSorterOptions {
	order!: KeysSorterOptions["order"]
	sort!: KeysSorterOptions["sort"]
	constructor(opts: Partial<KeysSorterOptions> = {}) {
		init(this, defaultOpts, opts)
	}
	get opts(): KeysSorterOptions {
		return { order: this.order, sort: this.sort }
	}
}

export const defaultSorter = new KeysSorter()
