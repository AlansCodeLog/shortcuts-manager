export interface RecursiveRecord {
	[key: string]: any | RecursiveRecord
}
/**
 * # Context
 *
 * Like {@link Condition}, provides a way to describe contexts. How contexts look and work is up to you.
 *
 * Contexts describe the relevant application state. They are what {@link Condition}s are evaluated against.
 *
 * @template TValue **@internal** Captures the type of the context value.
 */

export type Context<TValue extends object = any> = {
	type: "context"
	/** Where the context object is stored. */
	value: TValue
}
export type RawContext = Pick<Context, "value"> & Partial<Context>
