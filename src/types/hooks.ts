import type { Result } from "@alanscodelog/utils"

import type { Manager } from "@/classes"

import type { Bases, Collections } from "."


export type BaseHookType<TInstance extends Bases | Manager, TValue, TError, TOld = TValue, TExclude extends boolean = false> = {
	value: TValue
	error: TError
	old: TOld
	self: TInstance
	exclude: TExclude
}

export type CollectionHookType<TInstance extends Collections, TSetValue, TAllowValue, TValues, TAddError = Error | never, TRemoveError = Error | never> = {
	// this is only for the listeners
	// internally we receive allowValue entries which each class turns to setValue for set (set/add/remove) listeners
	setValue: TSetValue
	allowValue: TAllowValue
	values: TValues
	addError: TAddError
	removeError: TRemoveError
	error: TAddError | TRemoveError
	self: TInstance
}

export type BaseHook<
	TType extends "allows" | "set" = "allows" | "set",
	THooks extends
		Record<string, BaseHookType<any, any, any>> =
		Record<string, BaseHookType<any, any, any>>,
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
	TExclude extends
		THooks[TKey]["exclude"] =
		THooks[TKey]["exclude"],
> =
TType extends "allows"
? (
	(
		key: TKey,
		value: TExclude extends true ? never : TValue,
		old: TOld,
		self: TSelf,
	) => Result<true, TError>
)
// set
: TType extends "set"
? (
	(
		key: TKey,
		value: TValue,
		old: TOld,
		self: TSelf,
	) => void
)
: never

export type CollectionHook<
	TType extends
		"add" | "remove" | "allowsAdd" | "allowsRemove" =
		"add" | "remove" | "allowsAdd" | "allowsRemove",
	THook extends
		CollectionHookType<any, any, any, any> =
		CollectionHookType<any, any, any, any>,
	TSelf extends
		THook["self"] =
		THook["self"],
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
		entries: TValues,
		self: TSelf
	) => Result<true, THook["addError"]>
)
: TType extends "allowsRemove"
? (
	(
		entry: TSetValue,
		entries: TValues,
		self: TSelf
	) => Result<true, THook["removeError"]>
)
: TType extends "add"
? (
	(
		entry: TSetValue,
		entries: TValues,
		self: TSelf
	) => void
)
: TType extends "remove"
? (
	(
		entry: TSetValue,
		entries: TValues,
		self: TSelf
	) => void
)
: never

// export type ManagerHook<
// 	TType extends "allowsReplace" | "replace" | "chain",
// 	THook extends ManagerHookType<any, any, any> = ManagerHookType<any, any, any>,
// 	TSelf extends
// 		THook["self"] =
// 		THook["self"],
// 	TReplaceValue extends
// 		THook["replaceValue"] =
// 		THook["replaceValue"],
// 	TChainValue extends
// 		THook["setValue"] =
// 		THook["setValue"],
// > =
// TType extends "allowsReplace"
// ? (value: TReplaceValue, self: TSelf) => Result<true, THook["replaceError"]>
// : TType extends "replace"
// ? (value: TReplaceValue, self: TSelf) => void
// : TType extends "chain"
// ? (value: TChainValue, self: TSelf) => void
// : never
