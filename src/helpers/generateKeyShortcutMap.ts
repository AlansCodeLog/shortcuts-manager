import { last } from "@alanscodelog/utils/last.js"

import { getKeyFromIdOrVariant } from "./getKeyFromIdOrVariant.js"

import type { KeyInfo, Manager, Shortcut, ShortcutInfo } from "../types/index.js"
import type { Key } from "../types/keys.js"
import { chainContainsSubset } from "../utils/chainContainsSubset.js"
import { equalsKeys } from "../utils/equalsKeys.js"
import { removeKeys } from "../utils/removeKeys.js"


/**
 * Given a chain, a shortcut list, and a manager, this will return a record with information for each key id regarding what shortcuts can be pressed and some additional information useful for visual displaying them on a keyboard (See {@link KeyInfo}).
 *
 * The record will contain all renderable keys by their id (see {@link Key.render}). It will not contain variants or toggle states, only full keys (i.e. {@link Keys.entries}).
 *
 * It is recommended you pre-filter the shortcut's list to remove any shortcuts that are disabled or not executable.
 *
 * You can also post filter depending on the generated {@link ShortcutInfo} entry. See the postFilter param.
 */

export function generateKeyShortcutMap(
	chain: string[][],
	shortcutsList: Shortcut[],
	manager: Manager,
	/**
		* Filter entries by their {@link ShortcutInfo}, before adding/modifying the corresponding keys. Return false to filter the entry out, true to keep it.
		*
		* The second argument also provides some additional info the function looks at to generate the result.
		*/
	postFilter?: (
		entry: ShortcutInfo,
		info: {
			pressableKeys: Key[]
			unpressedModifiers: Key[]
			isPressed: boolean
			containsSubset: boolean
		}
	) => boolean
): Record<Key["id"], KeyInfo> {
	const obj: Record<string, KeyInfo> = {}
	const nextIsChord = manager.state.nextIsChord
	
	const isEmpty = chain.length === 0 || (chain.length === 1 && chain?.[0].length === 0)
	const index = isEmpty ? 0 : nextIsChord ? chain.length : chain.length - 1
	for (const shortcut of shortcutsList) {
		const containsSubset = chainContainsSubset(shortcut.chain, chain, manager.keys, { onlySubset: true, onlyPressable: false })
		const isPressed = equalsKeys(shortcut.chain, chain, manager.keys)
		if (!containsSubset && !isPressed) continue

		const keysLeftInChord = removeKeys((shortcut.chain[index] ?? []), (chain[index] ?? []), manager.keys)
			// normalize to Key[] so that we are only looking at "full" keys
			.map(_ => getKeyFromIdOrVariant(_, manager.keys).unwrap()[0])
				
		const isPressableChord = keysLeftInChord.length === 1
		const isPressable = isPressableChord && shortcut.chain.length - 1 === index
		const isPressableChain = isPressableChord && shortcut.chain.length - 1 > index

		const unpressedModifiers = keysLeftInChord.length > 1 ? keysLeftInChord.filter(_ => _.isModifier) : []
		const hasUnpressedModifiers = unpressedModifiers.length > 0

		if (!isPressable && !isPressableChain && !isPressed && unpressedModifiers.length <= 0) continue

		const pressableKeys = isPressed
		? (last(shortcut.chain) ?? []).map(_ => getKeyFromIdOrVariant(_, manager.keys).unwrap()[0])
		: unpressedModifiers.length === 0
		? keysLeftInChord
		: []

		const entry = {
			shortcut,
			isPressed,
			isPressable,
			isPressableChain,
			hasUnpressedModifiers,
		}
		if (postFilter !== undefined && !postFilter(entry, { unpressedModifiers, pressableKeys, isPressed, containsSubset })) continue
		if (!hasUnpressedModifiers || isPressed) {
			for (const k of pressableKeys) {
				if (k.render) {
					obj[k.id] ??= {
						pressableEntries: [] as ShortcutInfo[],
						modifierEntries: [] as ShortcutInfo[],
						containsConflicting: false,
						isModifierHint: false,
					}
					if (!obj[k.id].containsConflicting) {
						const containsConflicting = obj[k.id].pressableEntries
							.some(_ => _.isPressable || _.isPressableChain)
						obj[k.id].containsConflicting = containsConflicting
					}
					obj[k.id].pressableEntries.push({ ...entry })
				}
			}
		}
		if (!isPressed && !isPressable && !isPressableChain) {
			for (const k of unpressedModifiers) {
				if (k.render) {
					obj[k.id] ??= {
						pressableEntries: [] as ShortcutInfo[],
						modifierEntries: [] as ShortcutInfo[],
						containsConflicting: false,
						isModifierHint: false,
					}
					obj[k.id].modifierEntries.push({ ...entry })
					obj[k.id].isModifierHint ||= true
				}
			}
		}
	}

	return obj
}
