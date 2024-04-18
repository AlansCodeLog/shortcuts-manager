import { equalsShortcut } from "./equalsShortcut.js"

import type { Manager, PickManager, Shortcut } from "../types/index.js"
import { equalsKey } from "../utils/equalsKey.js"
import { equalsKeys } from "../utils/equalsKeys.js"

/**
 * A shortcut conflicts with another if their conditions are equal and their chains are in conflict.
 *
 * Chains can be in conflict in any of the following situations:
 *
 * - The shortcuts are the same instance.
 * - All the keys are the same.
 * - They share starting chords and the last shared chord conflicts. (e.g. [[A], [B]] and [[A]]), i.e. they have a chain conflict.
 * - The last chords shares all modifiers and one of the chords is all modifiers. (e.g. [[A], [Ctrl]] and [[A], [Ctrl, A]]), i.e. they have a modifier conflict.
 *
 * Some of these can be ignored with the experimental ignore* options.
 *
 * A context can be passed for a more accurate test, otherwise depending on what type of conditions you use (see {@link ConditionComparer}) you cannot truly tell if shortcuts with complex conditions will conflict. See the option itself for more details.
 */
export function doesShortcutConflict<TShortcut extends Shortcut>(
	shortcutA: TShortcut,
	shortcutB: Shortcut,
	manager: Pick<Manager, "keys" | "commands" | "shortcuts"> & { context?: Manager["context"] }
	& PickManager<"options", "evaluateCondition" | "conditionEquals">
): boolean {
	const context = manager.context
	if (!context && manager.shortcuts.useContextInConflictCheck) {
		throw Error("Manager must have a context if `useContextInConflictCheck` is true.")
	}
	const {
		ignoreChainConflicts,
		ignoreModifierConflicts,
	} = manager.shortcuts
	if (ignoreChainConflicts && ignoreModifierConflicts) return false

	if (shortcutA.forceUnequal || shortcutB.forceUnequal) return false
	if (equalsShortcut(shortcutA, shortcutB, manager)) return true
	const evaluateCondition = manager.options.evaluateCondition
	const conditionEquals = manager.options.conditionEquals
	if (context) {
		if (shortcutA.condition && shortcutB.condition) {
			const shortcutCondition = evaluateCondition(shortcutA.condition, context)
			const otherCondition = evaluateCondition(shortcutB.condition, context)
			if (shortcutCondition !== otherCondition) return false
			if (!shortcutCondition) return false
		}
	} else {
		if	(!conditionEquals(shortcutA.condition, shortcutB.condition)) return false
	}
	const { keys } = manager
	// an empty chain is always in conflict ?
	if (shortcutA.chain.length === 0 || shortcutB.chain.length === 0) {
		return ignoreChainConflicts === true && ignoreModifierConflicts === true
	}
		
	const lastSharedIndex = Math.max(0, Math.min(shortcutA.chain.length - 1, shortcutB.chain.length - 1))
	const lastIsModOnly = shortcutA.chain[lastSharedIndex].find(id => !keys.entries[id].isModifier) === undefined
	const otherLastIsModOnly = shortcutB.chain[lastSharedIndex].find(id => !keys.entries[id].isModifier) === undefined
	const sharedModifiers = shortcutA.chain[lastSharedIndex].filter(id => keys.entries[id].isModifier &&
				shortcutB.chain[lastSharedIndex]
					.some(otherId => equalsKey(otherId, id, keys, { allowVariants: true }))
	)


	const lastSharedChordConflicts = (lastIsModOnly || otherLastIsModOnly) && sharedModifiers.length > 0
	const conflictsWithChain = equalsKeys(shortcutA.chain, shortcutB.chain, keys, lastSharedIndex + 1, { allowVariants: true })
	return (
		(!ignoreChainConflicts && conflictsWithChain) ||
		(!ignoreModifierConflicts && lastSharedChordConflicts)
	)
}
