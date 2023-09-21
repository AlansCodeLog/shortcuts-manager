import { computed, reactive } from "vue"
/**
 * Returns a set of coordinates that includes an initial offset.
 *
 * For use with drag or similar events.
 *
 * `setInitialOffset` should be called at drag start.
 *
 * `setPointerCoords` can then be called on drag move.
 *
 * And `coords` will reflect the coordinates of the event + the initial offset.
 *
 * This can then be used to position an element and it won't jump, it will stay grabbed from where the user initially grabbed it.
 */

 
export const usePointerCoords = () => {
	const pointerCoords = reactive<{ x: number, y: number }>({ x: 0, y: 0 })
	const offsetCoords = reactive<{ x: number, y: number }>({ x: 0, y: 0 })
	const coords = computed(() => ({ x: pointerCoords.x - offsetCoords.x, y: pointerCoords.y - offsetCoords.y }))

	const setPointerCoords = (e: { clientX: number, clientY: number }): void => {
		pointerCoords.x = e.clientX
		pointerCoords.y = e.clientY
	}

	const setInitialPointerOffset = (e: { clientX: number, clientY: number }, el: HTMLElement): void => {
		setPointerCoords(e)
		const clientRect = el.getBoundingClientRect()
		offsetCoords.x = pointerCoords.x - clientRect.x
		offsetCoords.y = pointerCoords.y - clientRect.y
	}

	return { pointerCoords, coords, setPointerCoords, setInitialPointerOffset }
}
