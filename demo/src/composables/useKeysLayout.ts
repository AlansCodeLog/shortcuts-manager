import { useGlobalResizeObserver } from "@alanscodelog/vue-components/composables"
import { type Keys } from "shortcuts-manager/types/index.js"
import { computed, reactive, type Ref, ref, watch } from "vue"

 
export const useKeysLayout = (keys: Keys, keyboardEl: Ref<HTMLElement | null>) => {
	const layout = reactive({ x: keys.layout.x, y: keys.layout.y })
	watch([() => keys.layout.x, () => keys.layout.y], ([x, y]) => {
		layout.x = x
		layout.y = y
	})
	
	const width = ref(0)
	const keyWidth = computed(() => {
		const val = width.value / layout.x
		return Number.isNaN(val) ? 1 : val
	})
	const ratio = computed(() => layout.x / layout.y)
	const height = computed(() => width.value / ratio.value)
	useGlobalResizeObserver(keyboardEl, function updateSize() {
		if (keyboardEl.value) {
			width.value = Math.max(keyboardEl.value.offsetWidth, 1000)
		}
	})
	return { width, height, ratio, keyWidth, layout }
}

