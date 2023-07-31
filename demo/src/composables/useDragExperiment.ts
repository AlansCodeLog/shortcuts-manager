import { keys } from "@alanscodelog/utils"
import { onMounted, onUnmounted, type Ref, watch } from "vue"


export const useDrag = <K extends keyof HTMLElementEventMap, K2 extends K> ({
	container,
	listeners,
	autoMountUnmount,
}: {
	container: Ref<HTMLElement | null>
	listeners: Record<K, [
		listener: ((this: HTMLElement, e: HTMLElementEventMap[K]) => any),
		listenerOpts?: AddEventListenerOptions,
		opts?: {
			attach?: [Document | Element, K2][]
			detach?: [ Document | Element, K2][]
			immediate?: boolean
		},
	]>
	autoMountUnmount?: boolean

}): { add: () => void, remove: () => void } => {
	const map = new Map<string, (...any: any) => any>()
	
	const add = (): void => {
		for (const eventType of Object.keys(listeners) as K[]) {
			const listener = listeners[eventType]
			const func = listener[0]
			const listeneropts = listener[1]
			const opts = listener[2]
			if (opts?.immediate) {
				const wrapperFunc = function(this: any, e: any): void {
					func.call(this, e)
					if (opts.attach) {
						for (const attach of opts.attach) {
							const el = attach[0]
							const attachEl = attach[1]
							const attachListener = listeners[attachEl as any as K]
							const attachListenerOpts = attachListener[2]
							const attachWrapperFunc = function(this: any, e: any): void {
								attachListener[0].call(this, e)
								if (attachListenerOpts?.detach) {
									for (const detach of attachListenerOpts.detach) {
										const detachEl = detach[0]
										const detachName = detach[1]
										if (map.has(detachName)) {
											const detachListener =	map.get(detachName)
											detachEl.removeEventListener(detachName, detachListener as any)
											map.delete(detachName)
											console.log({ detachName })
										}
									}
								}
							}
							map.set(attachEl, attachWrapperFunc)
							el.addEventListener(attachEl, attachWrapperFunc, attachListener[1])
						}
					}
				}
				if (container.value) {
					container.value.addEventListener(eventType, wrapperFunc, listeneropts)
					map.set(eventType, wrapperFunc)
				}
			}
		}
	}
	const remove = (): void => {
		for (const eventType of Object.keys(listeners) as K[]) {
			const listener = listeners[eventType]
			const opts = listener[2]
			if (opts?.immediate) {
				if (!map.has(eventType)) continue
				if (container.value) {
					container.value.removeEventListener(eventType, map.get(eventType)! as any)
					map.delete(eventType)
				}
			}
			if (opts?.attach) {
				for (const attach of opts.attach) {
					const el = attach[0]
					const listenerName = attach[1]
					if (!map.has(listenerName)) continue
					el.removeEventListener(listenerName, map.get(listenerName)! as any)
				}
			}
			if (opts?.detach) {
				for (const detach of opts.detach) {
					const el = detach[0]
					const listenerName = detach[1]
					if (!map.has(listenerName)) continue
					el.removeEventListener(listenerName, map.get(listenerName)! as any)
				}
			}
		}
	}
	watch(container, () => {
		if (container.value) {
			add()
		} else {
			remove()
		}
	})
	if (autoMountUnmount) {
		onMounted(() => add())
		onUnmounted(() => remove())
	}
	return { add, remove }
}

// const {add:addListeners, remove:removeListeners} = useDrag( {
// 	container: keyboardEl,
// 	listeners: {
// 		pointerdown: [
// 			onDragStart,
// 			{ passive:false },
// 			{ immediate:true, attach:[ [ document, "pointerover" ], [ document, "pointerup" ] ] },
// 		],
// 		pointerover: [onDragMove],
// 		pointerup: [onDragEnd, {} , {detach: [[document, "pointerover",], [document, "pointerup"]]}],
// 		// touchstart: [onDragStart,
// 		// 	{ passive:false },
// 		// 	{ immediate:true, attach:[ [ document, "touchmove" ], [ document, "touchend" ] ] },
// 		// ],
// 		// mousemove: [onDragMove],
// 		// touchmove: [onDragMove],
// 		// mouseup: [onDragEnd, {} , {detach: [[document, "mousemove",], [document, "mouseup"]]}],
// 		// touchend: [onDragEnd, {}, {detach: [[document, "touchmove",], [document, "touchend"]]}],
// 	},
// 	autoMountUnmount:true
// })
// useDrag({
// 	container,
// 	listeners: {
// 		dragStart: [(e) => {
//
// 		}, {
// 			passive: false,
// 		}, {
// 			immediate: true,
// 			attach: ["dragMove", "dragEnd"],
// 		}],
// 		dragMove: [(e) => {
//
// 		}],
// 		dragEnd: [(e) => {
//
// 		}, {}, {detach: ["dragMove", "dragEnd"]}],
//
// 	}
// })
