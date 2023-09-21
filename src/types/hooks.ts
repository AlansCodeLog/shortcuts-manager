import type { Result } from "@alanscodelog/utils"

import type { Bases, Collections } from "./index.js"

import type { Manager } from "../classes/index.js"


export type BaseHookType<
	TInstance extends Bases | Manager,
	TValue,
	TError,
	TOld = TValue,
	TExclude extends boolean = false,
	TExcludeExternalSet extends boolean = false,
> = {
	value: TValue
	error: TError
	old: TOld
	self: TInstance
	excludeAllows: TExclude
	excludeSet: TExcludeExternalSet
}

export type CollectionHookType<TInstance extends Collections, TSetArgs, TAllowArgs, TValues, TAddError = Error | never, TRemoveError = Error | never, TRemoveArgs = TSetArgs> = {
	// this is only for the hooks
	// internally we receive allowValue entries which each class turns to setValue for set (set/add/remove) hooks
	setArgs: TSetArgs
	removeArgs: TRemoveArgs
	allowArgs: TAllowArgs
	values: TValues
	addError: TAddError
	removeError: TRemoveError
	error: TAddError | TRemoveError
	self: TInstance
}

export type BaseHook<
	TType extends "allows" | "set" = "allows" | "set",
	THooks extends
		Record<string, BaseHookType<any, any, any, any, any, any>> =
		Record<string, BaseHookType<any, any, any, any, any, any>>,
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
		THooks[TKey]["excludeAllows"] =
		THooks[TKey]["excludeAllows"],
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
	TAllowsArgs extends
		THook["allowArgs"] =
		THook["allowArgs"],
	TSetArgs extends
		THook["setArgs"] =
		THook["setArgs"],
	TRemoveArgs extends
		THook["removeArgs"] =
		THook["removeArgs"],
	TValues extends
		THook["values"] =
		THook["values"],
> =
TType extends "allowsAdd"
? (
	(
		self: TSelf,
		entries: TValues,
		entry: TAllowsArgs
	) => Result<true, THook["addError"]>
)
: TType extends "allowsRemove"
? (
	(
		self: TSelf,
		entries: TValues,
		entry: TRemoveArgs
	) => Result<true, THook["removeError"]>
)
: TType extends "add"
? (
	(
		self: TSelf,
		entries: TValues,
		entry: TSetArgs
	) => void
)
: TType extends "remove"
? (
	(
		self: TSelf,
		entries: TValues,
		entry: TRemoveArgs
	) => void
)
: never

