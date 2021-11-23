import { AnyClass, Err, Ok, Result } from "@alanscodelog/utils"

import { defaultStringifier } from "./KeysStringifier"

import { HookableCollection } from "@/bases"
import { castType, isToggleKey, KnownError } from "@/helpers"
import { ERROR, KeyOptions, KeysHooks, KeysOptions, RawKey, RecordFromArray } from "@/types"

import { Key } from "."


export class Keys<
	TKey extends
		Key =
		Key,
	TRawKeys extends
		RawKey[][] =
		RawKey[][],
	TEntries extends
		RecordFromArray<TRawKeys[number], "id", TKey> =
		RecordFromArray<TRawKeys[number], "id", TKey>,
> extends HookableCollection<KeysHooks> implements Pick<KeyOptions, "stringifier"> {
	protected _basePrototype: AnyClass<Key> & { create(...args: any[]): Key } = Key
	override entries: TEntries
	/** @inheritdoc */
	stringifier: KeyOptions["stringifier"] = defaultStringifier
	layout: Key[][]
	/**
	 * Creates a set of keys.
	 *
	 * ```ts
	 * const Escape = new Key("Escape")
	 * // ...
	 * const keys = new Keys([Escape, ...])
	 * // access individually later
	 * keys.entries.Escape
	 * ```
	 *
	 * Conforms instances to have the same stringifier option.
	 *
	 *	All versions of toggle keys are automatically also added to the set.
	 *
	 * Note:
	 * - This will mutate the keys passed to it.
	 * - It can throw. See {@link ERROR} for why.
	 *
	 * @template TKey **@internal** Makes it so that all keys in this instance are correctly typed when accesing from `entries`.
	 * @template TRawKeys **@internal** Allow passing raw keys.
	 * @template TEntries **@internal** See {@link ./README.md Collection Entries}
	 * @param keys A list of {@link Key | keys}.
	 * @param opts A list of {@link KeysOptions}.
	 */
	constructor(
		keys: TRawKeys,
		opts?: Partial<KeysOptions>,
	) {
		super()
		if (opts?.stringifier) this.stringifier = opts.stringifier

		this.entries = {} as TEntries
		this.layout = []
		for (let r = 0; r < keys.length; r++) {
			const row = keys[r]
			this.layout.push([])
			for (let c = 0; c < row.length; c++) {
				let entry = row[c]
				entry = this._basePrototype.create(entry)
				if (this.allows("add", entry, r, c).unwrap()) this.add(entry, r, c)
			}
		}
	}
	protected override _add(entry: Key | RawKey, row: number = 0, col: number = 0): void {
		entry = this._basePrototype.create(entry)
		castType<Key>(entry)

		if (this.stringifier) entry.stringifier = this.stringifier

		const entries = this.entries as any
		entries[entry.id] = entry
		if (isToggleKey(entry)) {
			entries[entry.on!.id] = entry.on
			entries[entry.off!.id] = entry.off
		}
		this.layout[row].splice(col, 0, entry)
	}
	protected override _remove(entry: Key): void {
		const entries = this.entries as any
		const pos = this.position(entry.id)
		if (pos.isOk) {
			this.layout[pos.value.row].splice(pos.value.col, 1)
			delete entries[entry.id]
			if (isToggleKey(entry)) {
				delete entries[entry.on!.id]
				delete entries[entry.on!.id]
			}
		} // else user did not check first, do nothing
	}
	get(id: TRawKeys[number][number]["id"] | string): TKey {
		return this.entries[id as keyof TEntries]
	}
	position(id: TRawKeys[number][number]["id"] | string): Result<{ row: number, col: number }, KnownError<ERROR.MISSING>> {
		for (let r = 0; r < this.layout.length; r++) {
			const row = this.layout[r]
			for (let c = 0; c < row.length; c++) {
				const key = row[c]
				if (key.id === id) {
					return Ok({ row: r, col: c })
				}
			}
		}
		return Err(new KnownError(ERROR.MISSING, `Could not find key ${id} in layout.`, { entry: id, collection: this }))
	}
	/** Query the class. Just a simple wrapper around array find/filter. */
	query(filter: Parameters<TKey[]["filter"]>["0"], all?: true): TKey[]
	query(filter: Parameters<TKey[]["find"]>["0"], all?: false): TKey | undefined
	query(filter: Parameters<TKey[]["filter"] | TKey[]["find"]>["0"], all: boolean = true): TKey | TKey[] | undefined {
		return all
			? Object.values(this.entries).filter(filter as any)
			: Object.values(this.entries).find(filter as any)!
	}
}
