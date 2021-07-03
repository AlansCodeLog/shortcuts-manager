import type { Key } from "@/classes"

/**
 * Returns whether a key is a a wheel up/down "key".
 */
export function isWheelKey(key: Key): boolean {
	return [
		"WheelUp",
		"WheelDown",
		"WheelUpOn",
		"WheelDownOn",
		"WheelUpOff",
		"WheelDownOff",
	].includes(key.id)
}
