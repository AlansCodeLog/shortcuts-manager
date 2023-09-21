import { onUnmounted, shallowRef } from "vue"

import { type Key, type Manager } from "shortcuts-manager/classes/index.js"


let hook: any

export const useManagerChain = (manager: Manager) => {
	const chain = shallowRef<Key[][]>([])
	
	hook = manager.addHook("set", (prop: string, val: any) => {
		if (prop === "chain") {
			chain.value = [...val]
		}
	})
	onUnmounted(() => manager.removeHook("set", hook))
	return chain
}

