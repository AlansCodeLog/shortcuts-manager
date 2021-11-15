import { Condition } from "./Condition"
import type { Plugin } from "./Plugin"

import { MixinHookablePlugableBase } from "@/mixins"
import type { CommandHooks, CommandOptions, DeepPartialObj, Optional, PluginsInfo } from "@/types"


export class Command<
	TExec extends
		CommandOptions["execute"] =
		CommandOptions["execute"],
	TCondition extends
		Condition =
		Condition,
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
	TName extends
		string =
		string,
	TOpts extends
		CommandOptions<TExec, TCondition> =
		CommandOptions<TExec, TCondition>,
> extends MixinHookablePlugableBase<CommandHooks, TPlugins, TInfo> implements CommandOptions {
	/** Unique string to identify the command by. */
	name: TName
	/**
	 * See {@link CommandOptions.execute}
	 */
	execute?: TExec
	/**
	 * See {@link CommandOptions.condition}
	 */
	condition: TCondition = new Condition("") as TCondition
	/** A description of what the command does. */
	description: string = ""
	/**
	 * # Command
	 * Creates a command.
	 *
	 * It can throw. See {@link ERROR} for why.
	 *
	 * @template TExec  Captures the type of the execute function. See {@link Command.execute}
	 * @template TCondition  Captures the type of the condition. See {@link Command.condition}
	 * @template TPlugins **@internal** See {@link Plugable}
	 * @template TInfo **@internal** See {@link Plugable}
	 * @template TName **@internal** See {@link ./README.md Collection Entries}
	 * @template TOpts **@internal** Makes the type of opts match depending on the execute function/condition passed.
	 * @param name See {@link Command.name}
	 * @param opts See {@link CommandOptions}
	 * @param info See {@link Command.info}
	 * @param plugins See {@link Command.plugins}
	 */
	constructor(
		name: TName,
		opts?: Partial<TOpts>,
	)
	constructor(
		name: TName,
		opts: Optional<Partial<TOpts>>,
		info: DeepPartialObj<TInfo>,
		plugins: TPlugins
	)
	constructor(
		name: TName,
		opts: Partial<TOpts> = {},
		info?: DeepPartialObj<TInfo>,
		plugins?: TPlugins,
	) {
		super()
		this.name = name
		if (opts.execute) this.execute = opts.execute as TExec
		if (opts.description) this.description = opts.description as string
		if (opts.condition) this.condition = opts.condition as TCondition
		this._mixin({
			hookable: { keys: ["allows", "set"]},
			plugableBase: { plugins, info, key: "name" },
		})
	}
	/**
	 * Returns whether the command passed is equal to this one.
	 *
	 * To return true, their name, execute, and descriptions must be equal, their condition must be equal according to this command's condition, and they must be equal according to their plugins.
	 */
	equals(command?: Command): command is Command<TExec, TCondition, TPlugins, TInfo> {
		if (command === undefined) return false
		return (
			this === command
			||
			(
				this.name === command.name
				&& this.execute === command.execute
				&& this.condition.equals(command.condition)
				&& this.description === command.description
				&& this.equalsInfo(command)
			)
		)
	}
	get opts(): CommandOptions {
		return { description: this.description, execute: this.execute, condition: this.condition }
	}
}

// export interface Command<TExec, TCondition, TPlugins, TInfo> extends HookableBase<CommandHooks>, PlugableBase<TPlugins, TInfo>, IgnoreUnusedTypes<[TExec, TCondition]> { }
// mixin(Command, [Hookable, HookableBase, Plugable, PlugableBase])

