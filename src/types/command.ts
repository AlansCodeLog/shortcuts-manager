import type { Command, Condition } from "@/classes"
import type { KnownError } from "@/helpers"
import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"


/**
 * Same as [[ShortcutOptions]] except you're allowed to only pass the keys property.
 */
export type RawCommand = Pick<Command, "name"> & {
	opts?: Partial<CommandOptions>
}

/**
 * Can be passed to Command/Commands classes to customize what the string property returns for errors, etc.
 * Similar to [[KeysParser]] in that the command function depends on the others, so just one part can be overriden at a time.
 */
export type CommandParserOptions = {
	stringify: {
		name: (name: string) => string
		// condition: (condition: Condition) => string
		description: (description: string) => string
		command: (command: Command) => string
	}
}

export type CommandOptions<
	TExec extends ((...args: any) => any) | undefined = ((...args: any) => any),
	TCondition extends Condition = Condition,
> = {
	/**
	 * See {@link Command.execute}
	 */
	execute: TExec
	/**
	 * See {@link Command.condition}
	 *
	 * If the command is created without a condition, it is assigned a blank condition. If you are using plugins on your commands you should pass a blank condition made with your plugins.
	 */
	condition: TCondition
	/** See {@link Command.description} */
	description: string
}


export type CommandHooks = {
	"name": BaseHookType<Command, string, never>
	"execute": BaseHookType<Command, (...args: any) => void, never>
	"condition": BaseHookType<Command, Condition, never>
}

export type CommandsHook = CollectionHookType<
	RawCommand | Command,
	Record<string, Command>,
	KnownError<ERROR.DUPLICATE_COMMAND>,
	never
>
