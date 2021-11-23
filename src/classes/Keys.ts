import type { AnyClass } from "@alanscodelog/utils"

import { defaultStringifier } from "./KeysStringifier"

import { HookableCollection } from "@/bases"
import { castType, isToggleKey } from "@/helpers"
import type { KeyOptions, KeysHooks, KeysOptions, RawKey, RecordFromArray } from "@/types"

import { Key } from "."


export class Keys<
	TKey extends
		Key =
		Key,
	TRawKeys extends
		(RawKey | Key)[] =
		(RawKey | Key)[],
	TEntries extends
		RecordFromArray<TRawKeys, "id", TKey> =
		RecordFromArray<TRawKeys, "id", TKey>,
> extends HookableCollection<KeysHooks> implements Pick<KeyOptions, "stringifier"> {
	protected _basePrototype: AnyClass<Key> & { create(...args: any[]): Key } = Key
	override entries: TEntries
	/** @inheritdoc */
	stringifier: KeyOptions["stringifier"] = defaultStringifier
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
		for (let entry of keys) {
			entry = this._basePrototype.create(entry)
			castType<Key>(entry)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		}
	}
	protected override _add(entry: Key | RawKey): void {
		entry = this._basePrototype.create(entry)
		castType<Key>(entry)

		if (this.stringifier) entry.stringifier = this.stringifier

		const entries = this.entries as any
		entries[entry.id] = entry
		if (isToggleKey(entry)) {
			entries[entry.on!.id] = entry.on
			entries[entry.off!.id] = entry.off
		}
	}
	protected override _remove(entry: Key): void {
		const entries = this.entries as any
		delete entries[entry.id]
		if (isToggleKey(entry)) {
			delete entries[entry.on!.id]
			delete entries[entry.on!.id]
		}
	}
	get(id: TRawKeys[number]["id"] | string): TKey {
		return this.entries[id as keyof TEntries]
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
