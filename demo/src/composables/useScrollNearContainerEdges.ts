import { reactive, type Ref, ref } from "vue"

/**
 * Creates a function `scrollContainer` that allows scrolling a container manually when the coordinates are near it's edges.
 * Supports scrolling faster the closer one is to the edge, and configuing an inner and outer margin.
 *
 * It can be used in any *move event.
 *
 * By default it sets a setInterval timer to continue scrolling even when the user does not move.
 * An `endScroll` function is provided which should be called on the *up event to cleanup the timer and variables properly (there is also the individual `clearScrollInterval` and `resetCanScroll` functions.
 *
 * It also provides an `isScrolling` ref and a `scrollIndicator` reactive object for styling the element. They can be force cleared with the `resetCanScroll` function.
 *
 * ```ts
 * const {
 * 	scrollEdges,
 * 	isScrolling,
 * 	scrollIndicator,
 * 	endScroll,
 * } = useScrollNearContainerEdges({
 * 	containerEl,
 * 	scrollMargin,
 * 	outerScrollMargin,
 * })
 *
 * const onPointerMove = (e: PointerEvent): void => {
 * 	scrollEdges(e.clientX, e.clientY)
 * 	if (isScrolling.value) {
 * 		e.preventDefault()
 * 		return
 * 	}
 * 	//...
 *}
 * const onPointerUp = (_e: PointerEvent): void => {
 * 	endScroll()
 * 	//...
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useScrollNearContainerEdges = ({
	containerEl,
	scrollMargin = 10,
	outerScrollMargin,
	fastPixelAmount = 2,
	useTimer = true,
	timerInterval = 1,
}: {
	containerEl: Ref< HTMLElement | null>
	scrollMargin?: number
	outerScrollMargin?: number
	fastPixelAmount?: number
	useTimer?: boolean
	timerInterval?: number
}) => {
	const scrollIndicator = reactive({ left: false, right: false, down: false, up: false })
	const isScrolling = ref(false)
	const resetScrollIndicator = (): void => {
		scrollIndicator.right = false
		scrollIndicator.left = false
		scrollIndicator.up = false
		scrollIndicator.down = false
		isScrolling.value = false
	}
	let timer: number | NodeJS.Timer | undefined

	const scrollContainerRelative = (x: number, y: number): void => {
		const el = containerEl.value
		if (!el) return
		const leftSpace = el.scrollLeft
		const topSpace = el.scrollTop
		el.scroll(leftSpace + x, topSpace + y)
	}

	const move = { x: 0, y: 0 }
	const resetMove = (): void => {
		move.x = 0; move.y = 0
	}
	const m = scrollMargin
	const M = outerScrollMargin ?? 0

	const tryScrollContainer = (x: number, y: number): void => {
		const el = containerEl.value
		if (!el) return
		const box = el.getBoundingClientRect()
		
		/*
		     rightRightLimit│
		                    │
		  rightLeftLimit│   │
		                │   ▼
		┌───────────────┼───┐
		│OuterLimit     │   │
		│ ┌─────────────┴─┐ │
		│ │Container    ▼ │ │
		│ │ ┌───────────┐ │ │
		│ │ │InnerLimit │ │ │
		│ │ └───────────┘ │ │
		│ └───────────────┘ │
		└───────────────────┘
		*/
		const leftLimit = box.x
		const rightLimit = box.x + box.width
		const topLimit = box.y
		const bottomLimit = box.y + box.height

		const leftLeftLimit = leftLimit - M
		const leftRightLimit = leftLimit + m
		const rightLeftLimit = rightLimit - M
		const rightRightLimit = rightLimit + m

		const topTopLimit = topLimit - M
		const topBottomLimit = topLimit + m
		const bottomTopLimit = bottomLimit - m
		const bottomBottomLimit = bottomLimit + M

		resetScrollIndicator()
		resetMove()

		if (x > leftLeftLimit && x < leftRightLimit) {
			const leftSpace = el.scrollLeft
			if (leftSpace > 0) {
				const edgeOffset = ((leftLimit + m) - x) / m
				move.x = -edgeOffset * fastPixelAmount
			}
		} else if (x > rightLeftLimit && x < rightRightLimit) {
			const rightSpace = (el.scrollWidth - el.scrollLeft) - Math.round(box.width)
			if (rightSpace > 0) {
				const edgeOffset = (x - (rightLimit - m)) / m
				move.x = edgeOffset * fastPixelAmount
			}
		}
		if (y > topTopLimit && y < topBottomLimit) {
			const topSpace = el.scrollTop
			if (topSpace > 0) {
				const edgeOffset = ((topLimit + m) - y) / m
				move.y = -edgeOffset * fastPixelAmount
			}
		} else if (y > bottomTopLimit && y < bottomBottomLimit) {
			const bottomSpace = (el.scrollHeight - el.scrollTop) - Math.round(box.height)
			if (bottomSpace > 0) {
				const edgeOffset = (y - (bottomLimit - m)) / m
				move.y = edgeOffset * fastPixelAmount
			}
		}
		if (move.x !== 0 || move.y !== 0) {
			isScrolling.value = true
			scrollIndicator.right = move.x > 0
			scrollIndicator.left = move.x < 0
			scrollIndicator.up = move.y < 0
			scrollIndicator.down = move.y > 0
			scrollContainerRelative(move.x, move.y)
		}
	}
	const clearScrollInterval = (): void => {
		clearInterval(timer)
	}

	const scrollEdges = (clientX: number, clientY: number, overrideUseTimer?: boolean): void => {
		clearInterval(timer)
		tryScrollContainer(clientX, clientY)

		if (overrideUseTimer ? overrideUseTimer : useTimer) {
			timer = setInterval(() => {
				tryScrollContainer(clientX, clientY)
			}, timerInterval)
		}
	}
	const endScroll = (): void => {
		clearScrollInterval()
		resetScrollIndicator()
		resetMove()
	}
	return {
		 scrollEdges,
		scrollIndicator,
		 resetScrollIndicator,
		 clearScrollInterval,
		isScrolling,
		 endScroll,
		/* resetMove does not need to be returned since the user cannot call the timer interval manually and the scrollContainer function resets it before starting. */
	}
}

