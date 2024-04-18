import { last } from "@alanscodelog/utils/last.js"

/**
 * A copy of the last chord in the chain if it exists.
 */
export function cloneLastChord(chain: string[][]): string[] | undefined {
	const lastC = last(chain)
	return lastC ? [...lastC] : undefined
}

