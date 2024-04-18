// /* UTILITY TYPES */
// export type MakeOptional<T, TKey extends keyof T> = Omit<T, TKey> & Partial<Pick<T, TKey>>
// export type OnlyRequire<T, TKey extends keyof T> = Pick<T, TKey> & Partial<Omit<T, TKey>>
// /**
//  * Converts a union/or type to an intersection/and.
//  * TypeA | TypeB => TypeA & TypeB
//  */
// export type OrToAnd<TUnion> = (TUnion extends any
// 	? (k: TUnion) => void : never) extends ((k: infer I) => void)
// 	? I : never
//
// export type DeepPartialArr<T> = {
// 	[P in keyof T]?: DeepPartialArr<T>[]
// }
//
// export type DeepPartialObj<T> = {
// 	[P in keyof T]?: DeepPartialObj<T[P]> | T[P];
// }
//
// export type Optional<T> = T | undefined
//
// /** Remove a type/s from a union. */
// export type Remove<T, TKey> = T extends TKey ? never : T
//
// /**
//  * Creates record from Array (of objects) T, keyed by it's object's K property value, with values of type B.
//  */
// export type RecordFromArray<
// 	T extends any[],
// 	TKey extends string & keyof T[number],
// 	TValue extends
// 		T[number] =
// 		T[number],
// > = Record<T[number][TKey], TValue>
//
// /**
//  * Expand a record type. By default expands the record to accept any string key.
//  * See any "collection" class's `add` method for example.
//  */
// export type ExpandRecord<T, TKey extends string | number = keyof T & string, TValue = T[keyof T]> = T & {[ Key in TKey ]: TValue }
