import type { Key } from "../types/index.js"


const possibleIds = [
	"WheelUp",
	"WheelDown",
	"WheelUpOn",
	"WheelDownOn",
	"WheelUpOff",
	"WheelDownOff",
]
/**
 * Returns whether a key is a a wheel up/down "key".
 */
export function isWheelKey(key: Key): boolean {
	return possibleIds.includes(key.id)
	|| (key.variants?.some(id => possibleIds.includes(id)) ?? false)
}
