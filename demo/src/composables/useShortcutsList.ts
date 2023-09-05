import { computed, type Ref } from "vue"

import type { Key } from "shortcuts-manager/classes/Key.js"
import type { Manager } from "shortcuts-manager/classes/Manager.js"
import type { Shortcut } from "shortcuts-manager/classes/Shortcut.js"
import { chordContainsKey } from "shortcuts-manager/helpers/chordContainsKey.js"
import { removeKeys } from "shortcuts-manager/helpers/removeKeys.js"


export type ShortcutInfo = { entry: Shortcut, isPressableChain: boolean, isPressable: boolean }
 
export const useShortcutsList = (manager: Ref<Manager>, keys: Ref<Ref< Key >[]>, shortcuts: Ref<Ref<Shortcut>[]>, chain: Ref<Key[][]>) => {
	const shortcutsList = computed(() => {
		const nextIsChord = manager.value._nextIsChord
		const index = chain.value.length === 0 ? 0 : nextIsChord ? chain.value.length : chain.value.length - 1
		// const stringify = manager.value?.stringifier.stringify.bind(manager.value?.stringifier)
		const obj: Record<string, ({ entries: ShortcutInfo[], containsConflicting: boolean, isModifierHint: boolean })> = {}
		for (const { value: shortcut } of shortcuts.value) {
			for (const { value: key } of keys.value) {
				const isExecutable = shortcut.canExecuteIn(manager.value.context, { allowEmptyCommand: true })
				const containsSubset = shortcut.containsSubset(chain.value, { onlySubset: true, onlyPressable: false })
				
				if (!isExecutable) continue
				if (!containsSubset) continue

				const keysLeftInChord = removeKeys((shortcut.chain[index] ?? []), (chain.value[index] ?? []) as Key[])
				const isPressableChord = keysLeftInChord.length === 1 && keysLeftInChord[0].equals(key, { allowVariants: true })

				const isPressable = isPressableChord && shortcut.chain.length - 1 === index
				const isPressableChain = isPressableChord && shortcut.chain.length - 1 > index
				const isModifierHint = key.is.modifier && keysLeftInChord.length > 1 && chordContainsKey(keysLeftInChord, key, { allowVariants: true })
				if (!isPressable && !isPressableChain && !isModifierHint) continue

				obj[key.id] ??= { entries: [] as ShortcutInfo[], containsConflicting: false, isModifierHint: false }
				obj[key.id].isModifierHint ||= isModifierHint
				
				if (isPressable || isPressableChain) {
					if (!obj[key.id].containsConflicting) {
					// todo conflicting modifier ?
						const containsConflicting = (isPressable || isPressableChain) &&
obj[key.id].entries.some(_ => _.isPressable || _.isPressableChain)
						obj[key.id].containsConflicting = containsConflicting
					}
					obj[key.id].entries.push({ entry: shortcut, isPressable, isPressableChain })
				}
			}
		}
		return obj
	})
	return shortcutsList
}
