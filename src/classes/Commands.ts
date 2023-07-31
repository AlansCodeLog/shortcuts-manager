import { type AnyClass, crop, Err, Ok, type Result } from "@alanscodelog/utils"
import { HookableCollection } from "../bases/HookableCollection.js"
import { KnownError } from "../helpers/KnownError.js"
import { ERROR } from "../types/enums.js"
import type { CommandsHooks, RawCommand, RecordFromArray } from "../types/index.js"

import { Command } from "./Command.js"
import { canAddToDictErrorText } from "./internal/canAddToDictError.js"


export class Commands<
	TCommand extends
		Command =
		Command,
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

		for (const rawEntry of commands) {
			const entry = this.create(rawEntry)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		}
	}

	protected override _add(rawEntry: RawCommand): void {
		const entry = this.create(rawEntry)
		entry.addHook("allows", (type, value, old) => {
			if (type === "name") {
				const existing = this.entries[value as keyof TEntries]
				if (existing !== undefined && existing !== rawEntry) {
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
		entries[rawEntry.name] = rawEntry
	}

	protected override _canAddToDict(entries: Command[], entry: Command): Result<true, KnownError<ERROR.DUPLICATE_COMMAND>
	> {
		const existingIdentifier = (entry).name
		const existing = (entries as any)[(entry).name]

		if (existing) {
			const text = canAddToDictErrorText("commands", existingIdentifier, this.stringifier.stringify(existing), this.stringifier.stringify(entry))
			const error = new KnownError(ERROR.DUPLICATE_COMMAND, text, { existing, self: this as any as Commands })

			return Err(error) as any
		}

		return Ok(true)
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

	export(): Record<string, ReturnType<Command["export"]>> {
		const commands: Record<string, any> = {}
		for (const id of Object.keys(this.entries)) {
			commands[id] = (this.entries[id as keyof TEntries] as Command).export()
		}
		return commands
	}

	/**
	 * Creates a base instance that conforms to the class.
	 */
	override create<T extends Command = Command>(rawEntry: Command | RawCommand): T {
		if (rawEntry instanceof Command) return rawEntry as T
		return this._basePrototype.create(rawEntry) as T
	}

	/**
	 * Checks if all commands can be removed, if they can, removes them all, otherwise does nothing and returns the error.
	 *
	 * Useful for "emptying" out commands when importing configs.
	 */
	safeRemoveAll(): Result<true, Error> {
		let res: Result<true, Error>
		for (const command of Object.values(this.entries as Record<string, Command>)) {
			res = this.allows("remove", command)
			if (res.isError) return res
		}
		for (const command of Object.values(this.entries as Record<string, Command>)) {
			this.remove(command)
		}
		return Ok(true)
	}
}
