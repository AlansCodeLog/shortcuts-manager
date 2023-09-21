import { castType } from "@alanscodelog/utils"
import { useGlobalResizeObserver } from "@alanscodelog/vue-components/composables"
import { computed, onUnmounted, reactive, type Ref, ref } from "vue"

import { type Keys } from "shortcuts-manager/classes/index.js"


let hook: any

 
export const useKeysLayout = (keys: Keys, keyboardEl: Ref<HTMLElement | null>) => {
	const layout = reactive({ rows: keys.layout.rows, columns: keys.layout.columns })
	
	hook = keys.addHook("set", (prop: string, val: any) => {
		if (prop === "layout") {
			castType<Keys["layout"]>(val)
			layout.rows = val.rows
			layout.columns = val.columns
		}
	})
	onUnmounted(() => keys.removeHook("set", hook))
	const width = ref(0)
	const keyWidth = computed(() => {
		const val = width.value / layout.columns
		return Number.isNaN(val) ? 1 : val
	})
	const ratio = computed(() => layout.columns / layout.rows)
	const height = computed(() => width.value / ratio.value)
	useGlobalResizeObserver(keyboardEl, function updateSize() {
		castType<Ref<HTMLElement>>(keyboardEl.value)
		width.value = Math.max(keyboardEl.value.offsetWidth, 1000)
	})
	return { width, height, ratio, keyWidth, layout }
}

