import { type Key } from "../classes/Key.js"


export const removeKeys = (
	keys: readonly Key[],
	toRemove: readonly Key[],
	opts: Parameters<Key["equals"]>[1] = {}
): Key[] => keys
	.filter(key =>
		toRemove.find(_ => key.equals(_, opts)) === undefined
	)
