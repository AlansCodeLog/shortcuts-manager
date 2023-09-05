import { pick } from "@alanscodelog/utils"

import { Condition } from "./Condition.js"

import { HookableBase } from "../bases/HookableBase.js"
import { createInstance } from "../helpers/createInstance.js"
import type { CommandHooks, CommandOptions, ExportedCommand, Optional, RawCommand } from "../types/index.js"


export class Command<
	TExec extends
		CommandOptions["execute"] =
		CommandOptions["execute"],
	TCondition extends
		Condition =
		Condition,
	TName extends
		string =
		string,
	TOpts extends
		CommandOptions<TExec, TCondition> =
		CommandOptions<TExec, TCondition>,
> extends HookableBase<CommandHooks> implements CommandOptions {
	/** Unique string to identify the command by. */
	name: TName

	/** @inheritdoc */
	execute?: TExec

	/** @inheritdoc */
	condition: TCondition = new Condition("") as TCondition

	/** @inheritdoc */
	description: string = ""

	/**
	 * # Command
	 * Creates a command.
	 *
	 * It can throw. See {@link ERROR} for why.
	 *
	 * @template TExec  Captures the type of the execute function. See {@link Command.execute}
	 * @template TCondition  Captures the type of the condition. See {@link Command.condition}
	 * @template TName **@internal** See {@link ./README.md Collection Entries}
	 * @template TOpts **@internal** Makes the type of opts match depending on the execute function/condition passed.
	 * @param name See {@link Command.name}
	 * @param opts See {@link CommandOptions}
	 */
	constructor(
		name: TName,
		opts?: Partial<TOpts>,
	)

	constructor(
		name: TName,
		opts: Optional<Partial<TOpts>>,
	)

	constructor(
		name: TName,
		opts: Partial<TOpts> = {},
	) {
		super("Command")
		this.name = name
		if (opts.execute) this.execute = opts.execute as TExec
		if (opts.description) this.description = opts.description as string
		if (opts.condition) this.condition = opts.condition as TCondition
	}

	/**
	 * Returns whether the command passed is equal to this one.
	 *
	 * To return true, their name, execute, and descriptions must be equal, their condition must be equal according to this command's condition.
	 */
	equals(command?: Command): command is Command<TExec, TCondition> {
		if (command === undefined) return false
		return (
			this === command
			||
			(
				this.name === command.name
				&& this.execute === command.execute
				&& this.condition.equals(command.condition)
				&& this.description === command.description
			)
		)
	}

	get opts(): CommandOptions {
		return pick(this, ["description", "execute", "condition"])
	}

	/** Create an instance from a raw entry. */
	static create<T extends Command = Command>(entry: RawCommand): T {
		return createInstance<Command, "name">(Command, "name", entry) as T
	}

	export(): ExportedCommand {
		return {
			name: this.name,
			description: this.description,
			condition: this.condition.export(),
		}
	}
}

