export type BaseHookType<TInstance, TValue, TError, TOld = TValue> = {
	value: TValue
	error: TError
	old: TOld
	self: TInstance
}

export type CollectionHookType<TSetValue, TAllowValue, TValues, TAddError = Error | never, TRemoveError = Error | never> = {
	// this is only for the listeners
	// internally we receive allowValue entries which each class turns to setValue for set (set/add/remove) listeners
	setValue: TSetValue
	allowValue: TAllowValue
	values: TValues
	addError: TAddError
	removeError: TRemoveError
	error: TAddError | TRemoveError
}

export type BaseHook<
	TType extends "allows" | "set",
	THooks extends Record<string, BaseHookType<any, any, any>>,
	TKey extends
		keyof THooks =
		keyof THooks,
	TValue extends
		THooks[TKey]["value"] =
		THooks[TKey]["value"],
	TSelf extends
		THooks[TKey]["self"] =
		THooks[TKey]["self"],
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
		self: TSelf,
	) => true | TError
)
// set
: (
	(
		key: TKey,
		value: TValue,
		old: TOld,
		self: TSelf,
	) => void
)

export type CollectionHook<
	TType extends "add" | "remove" | "allowsAdd" | "allowsRemove",
	THook extends CollectionHookType<any, any, any, any>,
	TAllowsValue extends
		THook["allowValue"] =
		THook["allowValue"],
	TSetValue extends
		THook["setValue"] =
		THook["setValue"],
	TValues extends
		THook["values"] =
		THook["values"],
> =
TType extends "allowsAdd"
? (
	(
		entry: TAllowsValue,
		entries: TValues
	) => true | THook["addError"]
)
: TType extends "allowsRemove"
? (
	(
		entry: TAllowsValue,
		entries: TValues
	) => true | THook["removeError"]
)
: TType extends "add"
? (
	(
		entry: TSetValue,
		entries: TValues,
	) => void
)
: (
	(
		entry: TSetValue,
		entries: TValues,
	) => void
)

