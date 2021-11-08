import type { Command, Condition, Shortcut } from "@/classes"
import type { Manager } from "@/classes/Manager"
import type { KnownError } from "@/helpers"
import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { AnyInputEvent } from "./manager"


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

export type CommandFunction = (isKeydown: boolean, command: Command, shortcut?: Shortcut, manager?: Manager, event?: AnyInputEvent) => void

export type CommandOptions<
	TExec extends CommandFunction | undefined = CommandFunction,
	TCondition extends Condition = Condition,
> = {
	/**
	 * The function to execute when a shortcut triggers it's command. It is executed both on keydown and keyup (of the first released key) so be sure to check the isKeydown parameter so you don't trigger commands twice.
	 *
	 * The command itself is passed to it, and if it is managed by a manager it is also passed the shortcut, the manager itself, and the event of the last key that triggered it.
	 *
	 * You should do e.preventDefault if you need it or haven't done so from the manager's filters.
	 *
	 * You should also do {@link Manager.clearChain} for most regular shortcuts. The only exception is modifier only shortcuts. If you want the holding down of a modifier to trigger some action while held, while still being able to trigger other shortcuts without having the user release the key, you do not want to clear the manager's chain.
	 *
	 *
	 * See {@link Manager}.
	 */
	execute: TExec
	/**
	 * Commands may have an additional condition that must be met, apart from the shortcut's that triggered it.
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
