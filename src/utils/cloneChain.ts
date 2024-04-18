/** Deep clones a shortcut chain. */
export function cloneChain(chain: string[][]): string[][] {
	const clone = []
	for (const chord of chain) {
		const chordClone = []
		for (const key of chord) {
			chordClone.push(key)
		}
		clone.push(chordClone)
	}
	
	return clone
}
