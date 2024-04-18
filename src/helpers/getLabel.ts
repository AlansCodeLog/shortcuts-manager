import type { Key } from "../types/index.js"
/**
	* Returns the label, adding an `(On)` or `(Off)` suffix to any toggle keys.
	*
	* If the key has not label, uses the id
	*
	* Used by the {@link defaultStringifier}
	*/
export function getLabel(id: string | undefined, key: Key): string {
	const name = key.label ?? key.id
	if (id === key.toggleOnId) return `${name} (On)`
	if (id === key.toggleOffId) return `${name} (Off)`

	return name
}
