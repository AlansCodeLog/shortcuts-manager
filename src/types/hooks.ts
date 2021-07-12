
export type BaseHookType<TValue, TError, TOld = TValue> = {
	value: TValue
	error: TError
	old: TOld
}

export type CollectionHookType<TValue, TValues, TError> = {
	value: TValue
	values: TValues
	error: TError
}

export type BaseHook<
	TType extends "allows" | "set",
	THooks extends Record<string, BaseHookType<any, any>>,
	TKey extends
		keyof THooks =
		keyof THooks,
	TValue extends
		THooks[TKey]["value"] =
		THooks[TKey]["value"],
	TOld extends
		THooks[TKey]["old"] =
		THooks[TKey]["old"],
	TError extends
		Error | never =
		Error | never,
> = TType extends "allows"
? (
	(
		key: TKey,
		value: TValue,
		old: TOld,
	) => true | TError
)
// set
: (
	(
		key: TKey,
		value: TValue,
		old: TOld,
		cb: (e: TError) => void,
	) => void
)

export type CollectionHook<
	TType extends "allows" | "add",
	THook extends CollectionHookType<any, any, any>,
	TValue extends
		THook["value"] =
		THook["value"],
	TValues extends
		THook["values"] =
		THook["values"],
	TError extends
		Error | never =
		Error | never,
> = TType extends "allows"
? (
	(
		entry: TValue,
		entries: TValues
	) => true | TError
)
// add
: (
	(
		entry: TValue,
		entries: TValues,
		cb: (e: TError) => void,
	) => void
)


// export abstract class HookableCollectionImplementation<THook extends CollectionHookType<any, any, any>> {
// 	protected abstract _add (_value: THook["value"], _cb: ErrorCallback<any>): void;
// 	protected abstract  _allows(_value: THook["value"], _cb: ErrorCallback<any>): void
// }
