import type { Mutable } from "@alanscodelog/utils"

import type { RawCondition } from "./condition"
import type { ERROR } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { AnyInputEvent } from "./manager"

import type { Command, Commands, Condition, Shortcut } from "@/classes"
import type { Manager } from "@/classes/Manager"
import type { KnownError } from "@/helpers"


export type RawCommand = {
	name: Command["name"]
	opts?: Mutable<Partial<CommandOptions>>
}

export type ExportedCommand = {
	name: string
	description?: string
	condition: RawCondition
}

export type CommandFunction = ({ isKeydown, command, shortcut, manager, event }: { isKeydown: boolean, command: Command, shortcut?: Shortcut | undefined, manager?: Manager, event?: AnyInputEvent }) => void

export type CommandOptions<
	TExec extends CommandFunction | undefined = CommandFunction,
	TCondition extends Condition = Condition,
> = {
	/**
	 * The function to execute when a shortcut triggers it's command. It is executed both on keydown and keyup (of the first released key) so be sure to check the isKeydown parameter so you don't trigger commands twice.
	 *
	 * The command itself is passed to it, and if it is managed by a manager it is also passed the shortcut, the manager itself, and the event of the last key that triggered it. Note the event might not exist when the manager needs to emulate a key release. See {@link Manager.autoReleaseDelay}.
	 *
	 * You should do `e.preventDefault` if you need it or haven't done so from {@link Manager.eventFilter}.
	 *
	 * You should also do {@link Manager.smartClearChain} on keyup for most regular shortcuts. See it for details.
	 *
	 * See {@link Manager}.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly execute?: TExec
	/**
	 * Commands may have an additional condition that must be met, apart from the shortcut's that triggered it.
	 *
	 * If the command is created without a condition, it is assigned a blank condition. If you are using a custom condition class, you should probably always pass a blank condition.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly condition: TCondition
	/**
	 * A description of what the command does.
	 */
	description: string
}


export type CommandHooks = {
	"name": BaseHookType<Command, string, never>
	"execute": BaseHookType<Command, ((...args: any) => void) | undefined, never>
	"condition": BaseHookType<Command, Condition, never>
	[key: string]: BaseHookType<any, any, any>
}

export type CommandsHooks = CollectionHookType<
	Commands,
	Command,
	RawCommand | Command,
	Record<string, Command>,
	KnownError<ERROR.DUPLICATE_COMMAND>,
	KnownError<ERROR.COMMAND_IN_USE>
>
