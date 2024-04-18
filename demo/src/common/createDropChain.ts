import { last } from "@alanscodelog/utils/last.js"
import { type Manager } from "shortcuts-manager"
import { cloneChain } from "shortcuts-manager/utils"


export const createDropChain = (
	manager: Manager,
	chain: string[][],
	dropKey: string | undefined,
	partLength: number | undefined = chain.length
): string[][] | undefined => {
	if (dropKey) {
		const nextIsChord: boolean = manager.state.nextIsChord
		const newChain = cloneChain(partLength !== undefined ? chain.slice(0, partLength) : chain)
		const lastChord = last(newChain)
		if (nextIsChord || lastChord === undefined) newChain.push([dropKey])
		else lastChord.push(dropKey)
		return newChain
	}
	return undefined
}
