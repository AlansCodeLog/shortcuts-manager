import type { Context, RecursiveRecord } from "../types/index.js"


function fastIsEqual(obj: RecursiveRecord, other: RecursiveRecord): boolean {
	const keys1 = Object.keys(obj)
	const keys2 = Object.keys(other)
	if (keys1.length !== keys2.length) return false
	for (const key of keys1) {
		const val1 = obj[key]
		const val2 = other[key]
		if (typeof val1 === "object" && typeof val2 === "object") {
			if (!fastIsEqual(val1, val2)) return false
		}
		if (val1 !== val2) {
			return false
		}
	}
	return true
}

/**
 * Returns whether the context passed is equal to this one.
 *
 * The default methods provides a simple comparison that can handle simple flat or nested objects (simple as in it assumes values are not arrays). If you need something more complex you will need to provide your own function.
 */

export function equalsContext(contextA: Context, contextB: Context): boolean {
	return fastIsEqual(contextA.value, contextB.value)
}
