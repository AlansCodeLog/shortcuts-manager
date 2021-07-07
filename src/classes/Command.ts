import { mixin } from "@alanscodelog/utils"

import { Condition } from "./Condition"
import type { Plugin } from "./Plugin"

import { Hookable, HookableBase, Plugable } from "@/mixins"
import type { CommandHooks, CommandOptions, DeepPartialObj, Optional, PluginsInfo } from "@/types"
import { HOOKABLE_CONSTRUCTOR_KEY, PLUGABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


/**
 * Creates a command.
 */
export class Command<
	// capture the types of the execute function and the condition passed
	TExec extends
		CommandOptions["execute"] =
		CommandOptions["execute"],
	TCondition extends
		Condition =
		Condition,
	// See [[Plugable]]
	TPlugins extends
		Plugin<any>[] =
		Plugin<any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
	// See [[./README #Collection Entries]] for why this is here
	TName extends
		string =
		string,
	// make the type of opts match depending on the execute function/condition the user passed
	TOpts extends
		Partial<CommandOptions<TExec, TCondition>> =
		Partial<CommandOptions<TExec, TCondition>>,
> implements CommandOptions {
	/** Unique string to identify the command by. */
	name: TName
	execute!: TExec
	condition!: TCondition
	description: CommandOptions["description"]
	// parser!: CommandOptions["parser"]
	constructor(
		name: TName,
		opts?: TOpts,
	)
	constructor(
		name: TName,
		opts: Optional<TOpts>,
		info: DeepPartialObj<TInfo>,
		plugins: TPlugins
	)
	/**
	 * @param name See [[Command.id]]
	 * @param info See [[Command.info]]
	 * @param plugins See [[Command.plugins]]
	 *
	 * Note: You cannot add more plugins or change the structure of info after creating an instance. TODO
	 */
	constructor(
		name: TName,
		opts: Partial<TOpts> = {},
		info?: DeepPartialObj<TInfo>,
		plugins?: TPlugins,
	) {
		this.name = name
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		init(this, defaultOpts, opts)
		this[PLUGABLE_CONSTRUCTOR_KEY](plugins, info, "name")
		this[HOOKABLE_CONSTRUCTOR_KEY](["allows", "set"])
	}
	get executable(): boolean {
		return this.execute !== undefined
	}
	/**
	 * Returns whether two commands are functionally the same for our purposes.
	 *
	 * Note that this might return false negatives because conditions might be written differently (e.g. `a && b` and `b && a`) but be functionally the same.
	 */
	equals(command: Command): command is Command<TExec, TCondition, TPlugins, TInfo> {
		return (
			this === command
			||
			(
				this.name === command.name
				&& this.execute === command.execute
				&& (
					this.condition === command.condition
					|| this.condition?.equals(command.condition)
					|| false
				)
				&& this.description === command.description
				&& this.equalsInfo(command)
			)
		)
	}
	// get string(): string {
	// 	return this.parser.stringify.command(this)
	// }
	get opts(): CommandOptions {
		const { description, execute, condition } = this
		return { description, execute, condition }
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Command<TExec, TCondition, TPlugins, TInfo> extends HookableBase<CommandHooks>, Plugable<TPlugins, TInfo> { }
mixin(Command, [Hookable, HookableBase, Plugable])


export const defaultOpts: CommandOptions = {
	execute: undefined,
	description: undefined,
	condition: new Condition(""),
}

function init(self: any, defaults: CommandOptions, opts: Partial<CommandOptions>): asserts self is CommandOptions {
	self = self ?? {}
	self.execute = opts.execute ?? defaults.execute
	self.description = opts.description ?? defaults.description
}
