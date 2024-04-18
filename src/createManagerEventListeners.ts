import { getKeyFromEventCode } from "./helpers/getKeyFromEventCode.js"
import { addToChain } from "./internal/addToChain.js"
import { removeFromChain } from "./internal/removeFromChain.js"
import { setKeysState } from "./internal/setKeysState.js"
import { updateNativeKeysState } from "./internal/updateNativeKeysState.js"
import type { EventListenerTypes, EventTypes, Manager } from "./types/index.js"


export function createManagerEventListeners<T extends EventTypes, TTypes extends T[]>(
	manager: Manager,
	types: TTypes = ["keydown", "keyup", "keypress", "wheel", "mousedown", "mouseup", "mouseenter"] as TTypes,
): EventListenerTypes<TTypes[number]> {
	const listeners: Partial<EventListenerTypes<EventTypes>> = {}
	for (const type of types) {
		switch (type) {
			case "keydown": {
				listeners.keydown = (e: KeyboardEvent): void => {
					if (!manager.options.enableListeners) return
					const keyIds = getKeyFromEventCode(e.code, e, manager.keys.entries)
					if (keyIds.isError) {
						manager.options.cb(manager, keyIds.error, e)
						return
					}

					const ids = keyIds.value
					manager.listener?.({ event: e, isKeydown: true, keys: ids, manager })
					setKeysState(ids, manager, true)
					updateNativeKeysState(manager, e, ids)
					const res = addToChain(manager, ids, e)
					if (res.isError) {manager.options.cb(manager, res.error, e)}
				}
				break
			}
			case "keyup": {
				listeners.keyup = (e: KeyboardEvent): void => {
					if (!manager.options.enableListeners) return
					const keyIds = getKeyFromEventCode(e.code, e, manager.keys.entries)

					if (keyIds.isError) {
						manager.options.cb(manager, keyIds.error, e)
						return
					}
						
					const ids = keyIds.value
					manager.listener?.({ event: e, isKeydown: false, keys: ids, manager })
					setKeysState(ids, manager, false)
					updateNativeKeysState(manager, e, ids)
					const res = removeFromChain(manager, ids, e)
					if (res.isError) {manager.options.cb(manager, res.error, e)}
				}
				break
			}
			case "wheel": {
				listeners.wheel = (e: WheelEvent): void => {
					if (!manager.options.enableListeners) return
					const dir = e.deltaY < 0 ? "Up" : "Down"
					const code = `Wheel${dir}`
					const keyIds = getKeyFromEventCode(code, e, manager.keys.entries, { pressedState: false })

					if (keyIds.isError) {
						manager.options.cb(manager, keyIds.error, e)
						return
					}
					const ids = keyIds.value
					manager.listener?.({ event: e, isKeydown: true, keys: ids, manager })
					setKeysState(ids, manager, true)
					updateNativeKeysState(manager, e, ids)
					addToChain(manager, ids, e)
					manager.listener?.({ event: e, isKeydown: false, keys: ids, manager })
					setKeysState(ids, manager, false)
					const res = removeFromChain(manager, ids, e)
					if (res.isError) {manager.options.cb(manager, res.error, e)}
				}
				break
			}
			case "mousedown": {
				listeners.mousedown = (e: MouseEvent): void => {
					if (!manager.options.enableListeners) return
					const button = e.button.toString()

					const keyIds = getKeyFromEventCode(button, e, manager.keys.entries, { pressedState: false })
					if (keyIds.isError) {
						manager.options.cb(manager, keyIds.error, e)
						return
					}
					const ids = keyIds.value
					manager.listener?.({ event: e, isKeydown: true, keys: ids, manager })
					setKeysState(ids, manager, true)

					updateNativeKeysState(manager, e, ids)
					const res = addToChain(manager, ids, e)
					if (res.isError) {manager.options.cb(manager, res.error, e)}
				}

				break
			}
			case "mouseup": {
				listeners.mouseup = (e: MouseEvent): void => {
					if (!manager.options.enableListeners) return
					const button = e.button.toString()
					const keyIds = getKeyFromEventCode(button, e, manager.keys.entries, { pressedState: true })

					if (keyIds.isError) {
						manager.options.cb(manager, keyIds.error, e)
						return
					}
					const ids = keyIds.value
					manager.listener?.({ event: e, isKeydown: false, keys: ids, manager })
					setKeysState(ids, manager, false)
					updateNativeKeysState(manager, e, ids)
					const res = removeFromChain(manager, ids, e)
					if (res.isError) {manager.options.cb(manager, res.error, e)}
				}

				break
			}
			case "mouseenter": {
				listeners.mouseenter = (e: MouseEvent): void => {
					if (!manager.options.enableListeners) return
					manager.listener?.({ event: e, isKeydown: true, keys: [], manager })
					updateNativeKeysState(manager, e, [])
				}

				break
			}
		}
	}
	return listeners as EventListenerTypes<EventTypes>
}

