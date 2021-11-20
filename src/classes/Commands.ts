import { crop, Err, Ok } from "@alanscodelog/utils"

import { Command } from "./Command"
import type { Condition } from "./Condition"
import type { Plugin } from "./Plugin"

import { KnownError } from "@/helpers"
import { HookableCollection, MixinHookablePlugableCollection } from "@/mixins"
import { CommandsHook, ERROR, RawCommand, RecordFromArray } from "@/types"


export class Commands<
	// See [[Plugable]]
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	// See [[./README #Collection Entries]] for how this works
	TCommand extends
		Command<any, Condition, TPlugins> =
		Command<any, Condition, TPlugins>,
	TRawCommands extends
		RawCommand[] =
		RawCommand[],
	TEntries extends
		RecordFromArray<TRawCommands, "name", TCommand> =
		RecordFromArray<TRawCommands, "name", TCommand>,
> extends MixinHookablePlugableCollection<CommandsHook, TPlugins> {
	override entries: TEntries
	/**
	 * # Commands
	 * Creates a set of commands.
	 *
	 * Note:
	 * - This will mutate the keys passed to it.
	 * - It can throw. See {@link ERROR} for why.
	 *
	 * @template TPlugins **@internal** See {@link PlugableCollection}
	 * @template TCommand **@internal** See {@link ./README.md Collection Entries}
	 * @template TRawCommands **@internal** Allow passing raw commands.
	 * @template TEntries **@internal** See {@link ./README.md Collection Entries}
	 * @param commands A list of {@link Command | commands}.
	 * @param plugins See {@link Commands.plugins}
	 */
	constructor(
		commands: TRawCommands,
		plugins?: TPlugins,
	) {
		super()

		this._mixin({
			hookable: { keys: ["add", "remove", "allowsAdd", "allowsRemove"]},
			plugableCollection: { plugins, key: "name" },
		})
		this.entries = {} as TEntries

		commands.forEach(entry => {
			entry = Command.create(entry, this.plugins)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		})
	}
	protected override _add(entry: Command): void {
		entry = Command.create(entry, this.plugins)
		entry.addHook("allows", (type, value, old) => {
			if (type === "name") {
				const existing = this.entries[value as keyof TEntries]
				if (existing !== undefined && existing !== entry) {
					return Err(new KnownError(ERROR.DUPLICATE_COMMAND, crop`
						Command name "${old}" cannot be changed to "${value}" because it would create a duplicate command in a "Commands" instance that this command was added to.
					`, { existing, self: this }))
				}
			}
			return Ok(true)
		})
		entry.addHook("set", (type, value, old) => {
			if (type === "name") {
				const existing = this.entries[old as keyof TEntries]
				delete this.entries[old as keyof TEntries]
				this.entries[value as keyof TEntries] = existing
			}
		})
		HookableCollection._addToDict<Command>(this.entries, entry, t => t.name)
	}
	get(name: TRawCommands[number]["name"] | string): TCommand {
		return this.entries[name as keyof TEntries]
	}
	/** Query the class. Just a simple wrapper around array find/filter. */
	query(filter: Parameters<TCommand[]["filter"]>["0"], all?: true): TCommand[]
	query(filter: Parameters<TCommand[]["find"]>["0"], all?: false): TCommand | undefined
	query(filter: Parameters<TCommand[]["filter"] | TCommand[]["find"]>["0"], all: boolean = true): TCommand | TCommand[] | undefined {
		return all
			? Object.values(this.entries).filter(filter as any)
			: Object.values(this.entries).find(filter as any)!
	}
}
// export interface Commands<TPlugins> extends HookableCollection<CommandsHook>, PlugableCollection<TPlugins> { }
// mixin(Commands, [Hookable, HookableCollection, Plugable, PlugableCollection])
