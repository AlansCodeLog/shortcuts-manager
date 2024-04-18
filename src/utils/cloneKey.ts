import type { Key } from "../types/index.js"

/** Deep clones a key. */
export function cloneKey(key: Key): Key {
	// cloning like this is just lightining fast.
	const clone: Key = {
		type: key.type,
		id: key.id,
		label: key.label,
		classes: [...key.classes],
		x: key.x,
		y: key.y,
		width: key.width,
		height: key.height,
		enabled: key.enabled,
		pressed: key.pressed,
		isModifier: key.isModifier,
		variants: key.variants ? [...key.variants] : undefined,
		render: key.render,
		updateStateOnAllEvents: key.updateStateOnAllEvents,
		isToggle: key.isToggle,
		...(key.isToggle
		? {
			toggleOnPressed: key.toggleOnPressed,
			toggleOnId: key.toggleOnId,
			toggleOffId: key.toggleOffId,
			toggleOffPressed: key.toggleOffPressed,
		} satisfies Partial<Key<string>> : {}) as any,
	}
	
	return clone
}
