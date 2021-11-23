import { AnyClass, crop, Err, Ok } from "@alanscodelog/utils"

import type { Condition } from "./Condition"

import { HookableCollection } from "@/bases"
import { castType, KnownError } from "@/helpers"
import { CommandsHooks, ERROR, RawCommand, RecordFromArray } from "@/types"

import { Command } from "."


export class Commands<
	TCommand extends
		Command<any, Condition> =
		Command<any, Condition>,
	TRawCommands extends
		RawCommand[] =
		RawCommand[],
	TEntries extends
		RecordFromArray<TRawCommands, "name", TCommand> =
		RecordFromArray<TRawCommands, "name", TCommand>,
> extends HookableCollection<CommandsHooks> {
	protected _basePrototype: AnyClass<Command> & { create(...args: any[]): Command } = Command
	override entries: TEntries
	/**
	 * # Commands
	 * Creates a set of commands.
	 *
	 * Note:
	 * - This will mutate the keys passed to it.
	 * - It can throw. See {@link ERROR} for why.
	 *
	 * @template TCommand **@internal** See {@link ./README.md Collection Entries}
	 * @template TRawCommands **@internal** Allow passing raw commands.
	 * @template TEntries **@internal** See {@link ./README.md Collection Entries}
	 * @param commands A list of {@link Command | commands}.
	 */
	constructor(
		commands: TRawCommands,
	) {
		super()
		this.entries = {} as TEntries

		for (let entry of commands) {
			entry = this._basePrototype.create(entry)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		}
	}
	protected override _add(entry: Command | RawCommand): void {
		entry = this._basePrototype.create(entry)
		castType<Command>(entry)
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
		const entries = this.entries as any
		entries[entry.name] = entry
	}
	protected override _remove(entry: Command): void {
		const entries = this.entries as any
		delete entries[entry.name]
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
