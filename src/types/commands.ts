import type { Condition } from "./condition.js"
import type { ERROR, PickManager } from "./index.js"
import type { AnyInputEvent, Manager, MinimalInputEvent } from "./manager.js"
import type { Shortcut } from "./shortcuts.js"


export type RawCommand = Pick<Command, "name"> & Partial<Command>

export type CommandExecute = <T extends AnyInputEvent | MinimalInputEvent = AnyInputEvent | MinimalInputEvent>(args: {
	isKeydown: boolean
	command: Command
	shortcut?: Shortcut | undefined
	/**
	 * The event that triggered the command. It might be undefined if a virtual event triggered the key. It's typed as {@link AnyInputEvent} because you might also receive Emulated events from the {@link Emulator} if you use it. If you don't you can safely ignore the {@link EmulatedEvent} type or type the execute function as `CommandExecute<AnyInputEvent>`
	 */
	event?: T
	/**
	 * The manager might be undefined. This is to allow calling the command manually without it.
	 */
	manager?: Manager
}) => void

export interface Command <
	TName extends
		string =
		string,
	TExec extends CommandExecute = CommandExecute,
	TCondition extends
		Condition =
		Condition,
> {
	readonly type: "command"
	/**
	 * Unique string to identify the command by.
	 *
	 * Note that when changing a command's name, it is not an error for the old command to not exist in the manager. This is to allow for easier checking if a command can be added. If you need it to be an error, you can add a canSetCommand hook.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly name: TName
	/**
	 * The function to execute when a shortcut triggers it's command. It is executed both on keydown and keyup (of the first released key) so be sure to check the isCommanddown parameter so you don't trigger commands twice.
	 *
	 * The command itself is passed to it, and if it is managed by a manager it is also passed the shortcut, the manager itself, and the event of the last key that triggered it. Note the event might not exist when the manager needs to emulate a key release. See {@link Manager.autoReleaseDelay}.
	 *
	 * You should do `e.preventDefault` if you need it or haven't done so from {@link Manager.eventFilter}.
	 *
	 * You should also do {@link safeSetManagerChain} on keyup for most regular shortcuts. See it for details.
	 *
	 * See {@link Manager}.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly execute?: TExec
	/**
	 * Commands may have an additional condition that must be met, apart from the shortcut's that triggered it.
	 *
	 * If the command is created without a condition, it is assigned a blank condition. If you are using a custom condition class, you should probably always pass a blank condition.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly condition: TCondition
	/**
	 * A description of what the command does.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly description: string
}

export type Commands <
		TEntries extends Record<string, Command> = Record<string, Command>,
> = {
	type: "commands"
	/**
	 * The command entries.
	 *
	 * To add/remove entries you should {@link addCommand}/{@link removeCommand} or {@link setCommandsProp} with the synthetic `entries@add/remove` properties.
	 *
	 * The synthetic properties can be hooked into with {@link Manager.hooks}.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */

	entries: TEntries
}
export type RawCommands = Pick<Commands, "entries"> & Partial<Commands>


type GetCommandHooks<T extends keyof CommandSetEntries | keyof CommandsSetEntries> =
T extends CanHookCommandProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetCommandProp" | "onSetCommandProp">>
: T extends OnHookCommandProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "onSetCommandProp">>
: T extends CanHookCommandsProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetCommandsProp" | "onSetCommandsProp">>
: Partial<Pick<NonNullable<Manager["hooks"]>, "onSetCommandsProp">>

type Unmanaged<T extends keyof Command & keyof CommandSetEntries> = {
	val: Command[T]
	manager: never
	hooks: GetCommandHooks<T>
	error: never
}

export type CommandSetEntries = {
	condition: Unmanaged<"condition">
	execute: Unmanaged<"execute">
	description: Unmanaged<"description">
	name: {
		val: string
		manager: Pick<Manager, "commands" | "shortcuts" | "keys"> & PickManager<"options", "stringifier">
		hooks: GetCommandHooks<"name">
		// see name above, missing should NOT be an error
		error: ERROR.COMMAND_IN_USE | ERROR.DUPLICATE_COMMAND | ERROR.MULTIPLE_ERRORS
	}
}
export type OnHookCommandProps = "condition" | "execute" | "description"
export type CanHookCommandProps = OnHookCommandProps

type BaseCommandsManager = PickManager<"options", "stringifier"> & Record<any, any>
& Pick<Manager, "commands">

export type CommandsSetEntries = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"entries@add": {
		val: Command
		hooks: GetCommandHooks<`entries@add`>
		manager: BaseCommandsManager
		error: ERROR.DUPLICATE_COMMAND
	}
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"entries@remove": {
		val: Command
		hooks: GetCommandHooks<`entries@remove`>
		manager: BaseCommandsManager & Pick<Manager, "shortcuts" | "keys">
		error: ERROR.COMMAND_IN_USE | ERROR.MISSING
	}
}

export type SyntheticOnHookCommandsProps = "entries@add" | "entries@remove"
export type CanHookCommandsProps = SyntheticOnHookCommandsProps
export type OnHookCommandsProps = SyntheticOnHookCommandsProps

