import { type AnyClass, crop, Err, indent, Ok, type Result } from "@alanscodelog/utils"
import { HookableCollection } from "bases/HookableCollection.js"
import { isToggleKey } from "helpers/isToggleKey.js"
import { isToggleRootKey } from "helpers/isToggleRootKey.js"
import { KnownError } from "helpers/KnownError.js"
import { ERROR } from "types/enums.js"
import type { BaseHook, KeyHooks, KeyOptions, KeysBaseHooks, KeysCollectionHooks, KeysOptions, RawKey, RecordFromArray } from "types/index.js"

import { canAddToDictErrorText } from "./internal/canAddToDictError.js"
import { Key } from "./Key.js"
import { defaultStringifier, type Stringifier } from "./Stringifier.js"


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
> extends HookableCollection<KeysCollectionHooks, KeysBaseHooks> implements Pick<KeyOptions, "stringifier">, KeysOptions {
	protected _basePrototype: AnyClass<Key> & { create(...args: any[]): Key } = Key

	private readonly _boundKeyManageLayoutHook: BaseHook<"set", KeyHooks>

	override readonly entries: TEntries

	private _manageLayout: boolean = true

	/** @inheritdoc */
	set manageLayout(val: boolean) {
		this._manageLayout = val
		if (val) this.recalculateLayout()
	}

	get manageLayout(): boolean {
		return this._manageLayout
	}

	/**
	 * If {@link Keys.manageLayout} is true, the size of the keyboard in key units.
	 *
	 * The instance will expand and contract the size of the layout as the position/size of keys are changed. This will only look at keys which are set to ({@link Keys.render}).
	 *
	 * @SetHookable
	 */
	readonly layout: { rows: number, columns: number } = { rows: 0, columns: 0 }

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
		this._boundKeyManageLayoutHook = this._keyManageLayoutHook.bind(this)
		this.stringifier = opts?.stringifier ?? defaultStringifier

		this.entries = {} as TEntries

		this.manageLayout = opts?.manageLayout ?? true

		for (const rawEntry of keys) {
			const entry = this.create(rawEntry)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		}
	}

	stringifier: Stringifier

	protected override _add(rawEntry: RawKey): void {
		const entry = this.create(rawEntry)

		const entries = this.entries as any
		entries[entry.id] = entry
		if (isToggleKey(entry)) {
			entries[entry.on!.id] = entry.on
			entries[entry.off!.id] = entry.off
		}
		entry.addHook("set", this._boundKeyManageLayoutHook)
		if (this.manageLayout) this.recalculateLayout()
	}

	protected _canAddToDict(entries: Key[], entry: Key): Result<true, KnownError<ERROR.DUPLICATE_KEY | ERROR.KEYS_CANNOT_ADD_TOGGLE>
	> {
		if (isToggleKey(entry) && !isToggleRootKey(entry)) {
			return Err(new KnownError(ERROR.KEYS_CANNOT_ADD_TOGGLE, `Toggle keys are automatically added to the key set when the root key is added, on/off instances cannot be added individually.`, { entry })) as any
		}
		const existingIdentifier = (entry as any as Key).id
		const existing = (entries as any)[(entry as any as Key).id]

		if (existing) {
			const text = canAddToDictErrorText("key", existingIdentifier, this.stringifier.stringify(existing), this.stringifier.stringify(entry))
			const error = new KnownError(ERROR.DUPLICATE_KEY, text, { existing, self: this as any as Keys })

			return Err(error) as any
		}

		return Ok(true)
	}

	protected override _remove(entry: Key): void {
		const entries = this.entries as any
		delete entries[entry.id]
		if (isToggleKey(entry)) {
			delete entries[entry.on!.id]
			delete entries[entry.on!.id]
		}
		entry.removeHook("set", this._boundKeyManageLayoutHook)
		if (this.manageLayout) this.recalculateLayout()
	}

	protected _canRemoveFromDict(entries: Keys, entry: Key): Result<true, KnownError<ERROR.MISSING>> {
		const existing = (entries as any)[(entry).id]

		if (existing === undefined) {
			return Err(new KnownError(ERROR.MISSING, crop`
			${entry.constructor.name} does not exist in this collection.

			${indent(this.stringifier.stringify(entry), 3)}
			`, { entry, collection: this }))
		}
		return Ok(true)
	}

	/**
	 * Calculates the layout size.
	 *
	 * See {@link Keys.layout} and {@link Keys.manageLayout}.
	 *
	 * You should not need to call this directly if manageLayout is true.
	 */
	recalculateLayout(): void {
		let rows = 0
		let columns = 0
		for (const key of Object.values<Key>(this.entries)) {
			if (key.render) {
				const xLimit = key.x + key.width
				columns = xLimit > columns ? xLimit : columns
				const yLimit = key.y + key.height
				rows = yLimit > rows ? yLimit : rows
			}
		}
		this.set("layout", { rows, columns })
	}

	private _keyManageLayoutHook(prop: string, _value: any, _old: any, _self: Key): Result<true, never> {
		if (this.manageLayout && ["x", "y", "width", "height", "render"].includes(prop)) {
			this.recalculateLayout()
		}
		return Ok(true)
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

	/**
	 * Creates a base instance that conforms to the class.
	 */
	override create<T extends Key = Key>(rawEntry: T | RawKey): T {
		if (rawEntry instanceof Key) {
			rawEntry.stringifier = this.stringifier
			return rawEntry
		}
		return this._basePrototype.create({
			...rawEntry,
			opts: {
				...rawEntry.opts,
				stringifier: this.stringifier ?? rawEntry.opts?.stringifier,
			},
		}) as T
	}

	export(): Record<string, ReturnType<Key["export"]>> {
		const keys: Record<string, ReturnType<Key["export"]>> = {}
		for (const id of Object.keys(this.entries)) {
			keys[id] = (this.entries[id as keyof TEntries] as Key).export()
		}
		return keys
	}

	/**
	 * Checks if all commands can be removed, if they can, removes them all, otherwise does nothing and returns the error.
	 *
	 * Useful for "emptying" out commands when importing configs.
	 */
	safeRemoveAll(): Result<true, Error> {
		let res: Result<true, Error>
		for (const key of Object.values(this.entries as Record<string, Key>)) {
			res = this.allows("remove", key)
			if (res.isError) return res
		}
		for (const command of Object.values(this.entries as Record<string, Key>)) {
			this.remove(command)
		}
		return Ok(true)
	}
}
