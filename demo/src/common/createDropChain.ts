import { last } from "@alanscodelog/utils"

import type { Key } from "shortcuts-manager/classes/Key.js"
import { Manager } from "shortcuts-manager/classes/Manager.js"


export const createDropChain = (
	manager: Manager,
	chain: Key[][],
	dropKey: Key | undefined,
	partLength: number | undefined = chain.length
) => {
	if (dropKey) {
		// @ts-expect-error todo expose this?
		const nextIsChord: boolean = manager._nextIsChord
		const newChain = Manager.cloneChain(partLength !== undefined ? chain.slice(0, partLength) : chain)
		const lastChord = last(newChain)
		if (nextIsChord || lastChord === undefined) newChain.push([dropKey])
		else lastChord.push(dropKey)
		return newChain
	}
	return undefined
}
//
// export const createChainBaseDropChain = (
// 	manager: Manager,
// 	chain: Key[][],
// 	dropKey: Key | undefined,
// 	partLength: number,
// ) => {
// 	if (dropKey) {
// 		// @ts-expect-error todo expose this?
// 		const nextIsChord: boolean = manager._nextIsChord
// 		const newChain = chain.slice(0, partLength)
// 		if (!nextIsChord) {newChain.push([dropKey])}
// 		return Manager.cloneChain(newChain)
// 	}
// 	return undefined
// }
