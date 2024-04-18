import { shortcutCanExecuteIn } from "shortcuts-manager/helpers"
import { type Manager } from "shortcuts-manager/types"
import { chainContainsSubset, equalsKeys } from "shortcuts-manager/utils"
import { computed, type Ref } from "vue"


export type Filters <T> = {
	onlyExecutable: T
	onlyEnabled: T
	showPressable: T
	showPressableModOrChords: T
	showExactMatches: T
	showUnpressable: T
}

export const useFilterableShortcutsList = (
	manager: Ref<Manager>,
	filterChain: Ref<string[][]>,
	filters?: Ref<Filters<boolean>>
) => {
	const shortcutsList = computed(() => {
		const list = []
		const f = filters?.value
		const chain = filterChain.value
		const keys = manager.value.keys
		for (const shortcut of manager.value.shortcuts.entries) {
			const executable = shortcutCanExecuteIn(shortcut, manager.value, { allowEmptyCommand: true })
			
			const exactMatch = equalsKeys(shortcut.chain, chain, keys)
			const pressable = chainContainsSubset(shortcut.chain, chain, keys, { onlySubset: false, onlyPressable: true })
			const pressableModOrChord = chainContainsSubset(shortcut.chain, chain, keys, { onlySubset: true, onlyPressable: false }) && !pressable
			const enabled = shortcut.enabled
			if (
				!f
				|| (
					(!f.onlyEnabled || enabled)
					&& (!f.onlyExecutable || executable)
					&& (
						(f.showUnpressable && !pressable && !pressableModOrChord)
						|| (f.showExactMatches && exactMatch)
						|| (f.showPressable && pressable)
						|| (f.showPressableModOrChords && pressableModOrChord)
					)
				)
			) {
				list.push(shortcut)
			}
		}
		return list
	})
	return shortcutsList
}
