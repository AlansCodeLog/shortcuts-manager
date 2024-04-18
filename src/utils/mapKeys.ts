import { isArray } from "@alanscodelog/utils/isArray.js"

/**
 * Map keys of a chain or chord\* by the given function.
 *
 * Useful for inspecting a chain/chord when debugging.
 *
 * \*This is determined by checking if the first element is an array or not.
 */
export function mapKeys<
	TType extends any[] | any[][],
	TReturn = string,
>(
	chainOrChord: TType,
	func: (key: TType extends any[][] ? TType[number][number] : TType[number]) => TReturn = key => (key as any)?.id
): TType extends any[][] ? TReturn[][] : TReturn[] {
	if (chainOrChord.length === 0) return []
	return isArray(chainOrChord[0])
		? (chainOrChord as TType[][]).map(chord => chord.map(key => func(key as any))) as any
		: (chainOrChord as TType[]).map(key => func(key as any)) as any
}
