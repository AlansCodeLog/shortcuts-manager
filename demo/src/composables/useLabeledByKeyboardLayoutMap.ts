import { getKeyboardLayoutMap } from "shortcuts-manager/helpers/getKeyboardLayoutMap.js"
import { labelWithKeyboardMap } from "shortcuts-manager/helpers/labelWithKeyboardMap.js"
import { onKeyboardLayoutChange } from "shortcuts-manager/helpers/onKeyboardLayoutChange.js"
import type { Manager } from "shortcuts-manager/types/manager.js"
import { ref } from "vue"


export function useLabeledByKeyboardLayoutMap(manager: Manager) {
	const labeledByMap = ref<string[]>([])

	void getKeyboardLayoutMap().then(map => {
		if (map) {
			labeledByMap.value = labelWithKeyboardMap(manager, { map })
		}
	})
	void onKeyboardLayoutChange(async () => {
		const map = await getKeyboardLayoutMap()
		if (map) {
			labeledByMap.value = labelWithKeyboardMap(manager, { map })
		}
	})
	return labeledByMap
}
