import { crop, mixin } from "@alanscodelog/utils"

import { Command } from "./Command"
import type { Condition } from "./Condition"
import type { Plugin } from "./Plugin"

import { defaultCallback, KnownError } from "@/helpers"
import { Hookable, HookableCollection, Plugable, PlugableCollection } from "@/mixins"
import { CommandsHook, ERROR, ErrorCallback, OnlyRequire, RecordFromArray } from "@/types"


/**
 * Creates a set of commands.
 *
 * It will mutate the object passed. In the case it's already an instance, if plugins are passed, it forces the commands to conform to those (adds missing properties, etc.).
 *
 * @throws (see [[ERROR]] for why):
 * - [[TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES]]
 * - [[ERROR.DUPLICATE_COMMAND]] (because of [[Commands.add]])
 */
export class Commands<
	// See [[Plugable]]
	TPlugins extends
		Plugin<any>[] =
		Plugin<any>[],
	// See [[./README #Collection Entries]] for how this works
	TCommand extends
		Command<any, Condition, TPlugins> =
		Command<any, Condition, TPlugins>,
	TRawCommands extends
		OnlyRequire<TCommand, "name">[] =
		OnlyRequire<TCommand, "name">[],
	TEntries extends
		RecordFromArray<TRawCommands, "name", TCommand> =
		RecordFromArray<TRawCommands, "name", TCommand>,
> {
	entries: TEntries
	readonly plugins?: TPlugins
	constructor(
		commands: TRawCommands,
		plugins?: TPlugins,
	) {
		this._hookableConstructor(["allows", "add"])
		if (plugins) {
			Plugable._canAddPlugins(plugins)
			this.plugins = plugins
		}
		this.entries = {} as TEntries

		commands.forEach(command => {
			this.add(command, defaultCallback)
		})
	}
	protected _add(entry: OnlyRequire<Command, "name">, cb: ErrorCallback<ERROR.DUPLICATE_COMMAND> = defaultCallback): void {
		const instance = Plugable.create<Command, "name">(Command, this.plugins, "name", entry)
		instance.addHook("allows", (type, value, old) => {
			if (type === "name") {
				const existing = this.entries[value as keyof TEntries]
				if (existing !== undefined && existing !== instance) {
					return new KnownError(ERROR.DUPLICATE_COMMAND, crop`
						Command name "${old}" cannot be changed to "${value}" because it would create a duplicate command in a "Commands" instance that this command was added to.
					`, { existing, self: this })
				}
			}
			return true
		})
		instance.addHook("set", (type, value, old) => {
			if (type === "name") {
				const existing = this.entries[old as keyof TEntries]
				delete this.entries[old as keyof TEntries]
				this.entries[value as keyof TEntries] = existing
			}
		})
		HookableCollection._addToDict<Command>(this, this.entries, instance, t => t.name, cb)
	}
	get(name: TRawCommands[number]["name"] | string): TCommand {
		return this.entries[name as keyof TEntries]
	}
	info(id: TRawCommands[number]["name"] | string): TCommand["info"] {
		return this.entries[id as keyof TEntries].info
	}
}
export interface Commands<TPlugins> extends HookableCollection<CommandsHook>, PlugableCollection<TPlugins> { }
mixin(Commands, [Hookable, HookableCollection, Plugable, PlugableCollection])
