import type { AnyClass, Result } from "@alanscodelog/utils"
import { crop, Err, indent, Ok } from "@alanscodelog/utils"

import { canAddToDictErrorText } from "./internal/canAddToDictError.js"
import type { Key } from "./Key.js"
import { defaultSorter } from "./KeysSorter.js"
import { Shortcut } from "./Shortcut.js"
import { defaultStringifier, type Stringifier } from "./Stringifier.js"

import { HookableCollection } from "../bases/HookableCollection.js"
import { equalsKeys } from "../helpers/equalsKeys.js"
import { KnownError } from "../helpers/KnownError.js"
import { mapKeys } from "../helpers/mapKeys.js"
import { ERROR, type RawShortcut, type ShortcutOptions, type ShortcutsHooks, type ShortcutsOptions } from "../types/index.js"


export class Shortcuts<
	TShortcut extends
		Shortcut =
		Shortcut,
	TRawShortcuts extends
		(RawShortcut | TShortcut)[] =
		(RawShortcut | TShortcut)[],
	TEntries extends
		TShortcut[] =
		TShortcut[],
> extends HookableCollection<ShortcutsHooks> implements Pick<ShortcutsOptions, "stringifier" | "sorter" | "ignoreChainConflicts" | "ignoreModifierConflicts"> {
	protected _basePrototype: AnyClass<Shortcut> & { create(...args: any[]): Shortcut } = Shortcut

	override entries: TEntries

	private readonly _boundAllowsHook: any

	/** @inheritdoc */
	sorter: ShortcutOptions["sorter"] = defaultSorter

	/** @inheritdoc */
	ignoreChainConflicts: ShortcutsOptions["ignoreChainConflicts"] = false

	/** @inheritdoc */
	ignoreModifierConflicts: ShortcutsOptions["ignoreModifierConflicts"] = false

	/** @inheritdoc */
	stringifier: Stringifier

	/**
	 * # Shortcut
	 *
	 * Creates a set of shortcuts.
	 *
	 * Conforms instances to have the same stringifier/sorter options.
	 *
	 * Note:
	 * - This will mutate the shortcuts passed to it.
	 * - It can throw. See {@link ERROR} for why.
	 *
	 * @template TShortcut **@internal** Makes it so that all shortcuts in this instance are correctly typed when accesing from `entries`.
	 * @template TRawShortcuts **@internal** Allow passing raw shortcuts.
	 * @template TEntries **@internal** See {@link ./README.md Collection Entries}
	 * @param shortcuts A list of {@link Shortcut | shortcuts}.
	 */
	constructor(
		shortcuts: TRawShortcuts,
		opts: Partial<ShortcutsOptions> = {},
	) {
		super("Shortcuts")
		this.stringifier = opts.stringifier ?? defaultStringifier
		if (opts.sorter) this.sorter = opts.sorter
		if (opts.ignoreChainConflicts) this.ignoreChainConflicts = opts.ignoreChainConflicts
		if (opts.ignoreModifierConflicts) this.ignoreModifierConflicts = opts.ignoreModifierConflicts
		this.entries = [] as any
		this._boundAllowsHook = this._allowsHook.bind(this)
		for (const rawEntry of shortcuts) {
			const properEntry = this.create(rawEntry)
			if (this.allows("add", properEntry).unwrap()) this.add(properEntry)
		}
	}

	// overrides add since shortcuts are in an array
	protected override _add(rawEntry: Shortcut | RawShortcut): void {
		const entry = this.create(rawEntry)

		entry.addHook("allows", this._boundAllowsHook)

		const entries = this.entries as any
		entries.push(entry)
	}

	protected _canAddToDict(entries: Shortcut[], entry: Shortcut): Result<true, KnownError<ERROR.DUPLICATE_SHORTCUT>> {
		const existingIdentifier = JSON.stringify(mapKeys((entry).chain))
		const opts = {
			ignoreModifierConflicts: this.ignoreModifierConflicts,
			ignoreChainConflicts: this.ignoreChainConflicts,
		}
		const existing = (entries).find(item => (entry).equals(item, { ignoreCommand: true }) || entry.conflictsWith(item, opts))

		if (existing) {
			const thisAsString = `[\n${
				this.entries
					.map(_ => this.stringifier.stringify(_)).join("\n")
			}\n]`
			// todo toString
			const text = canAddToDictErrorText("shortcut", existingIdentifier, thisAsString, this.stringifier.stringify(entry))
			const error = new KnownError(ERROR.DUPLICATE_SHORTCUT, text, { existing: (existing as any), self: this as any as Shortcuts })

			return Err(error) as any
		}

		return Ok(true)
	}

	protected _canRemoveFromDict(entries: Shortcut[], entry: Shortcut): Result<true, KnownError<ERROR.MISSING>> {
		const existing = entries.find(item => entry.equals(item))

		if (existing === undefined) {
			return Err(new KnownError(ERROR.MISSING, crop`
			${entry.constructor.name} does not exist in this collection.

			${indent(this.stringifier.stringify(entry), 3)}
			`, { entry, collection: self as any }))
		}
		return Ok(true)
	}

	protected _allowsHook(key: string, value: any, _old: any, instance: Shortcut): Result<true, KnownError<ERROR.DUPLICATE_SHORTCUT>> {
		const proxy = Proxy.revocable(instance, {
			get(target: any, prop: any, receiver: any) {
				if (prop === key) { return value }
				return Reflect.get(target, prop, receiver)
			},
		}) as any
		const opts = {
			ignoreModifierConflicts: this.ignoreModifierConflicts,
			ignoreChainConflicts: this.ignoreChainConflicts,
		}
		// todo use uuid compare so proxies aren't an issue?
		const existing = this.query(entry => entry !== instance && (entry.equals(proxy.proxy, { ignoreCommand: true }) || entry.conflictsWith(proxy.proxy, opts)), false)
		proxy.revoke()
		if (existing !== undefined) {
			return Err(new KnownError(ERROR.DUPLICATE_SHORTCUT, crop`There is already an existing instance in this collection that would conflict when changing the "${key}" prop of this instance to ${this.stringifier.stringifyPropertyValue(value)}.

			Existing: ${this.stringifier.stringify(existing)}
			Instance: ${this.stringifier.stringify(instance)}

			`, { existing, self: instance as any, key, value }))
		}
		return Ok(true)
	}

	protected override _remove(shortcut: Shortcut): void {
		shortcut.removeHook("allows", this._boundAllowsHook)
		const i = this.entries.indexOf(shortcut as any)
		// just in case
		if (i > -1) {
			this.entries.splice(i, 1)
		}
	}

	/**
	 * Query the class for some shortcut/s. Just a simple wrapper around array find/filter
	 *
	 * Note: Unlike other classes, this class does not have a `get` method since shortcuts cannot be indexed by a single property, such as {@link Shortcut.chain}, because it should be perfectly possible to add two shortcuts with the same keys but, for example, where one is active and the other isn't, or where one has one condition and the other another.
	 *
	 * @param all If set to true, uses filter and returns all matching entries. Otherwise uses find and only returns the first match.
	 */
	query(filter: Parameters<TShortcut[]["filter"]>["0"], all?: true): TShortcut[]

	query(filter: Parameters<TShortcut[]["find"]>["0"], all?: false): TShortcut | undefined

	query(filter: Parameters<TShortcut[]["filter"] | TShortcut[]["find"]>["0"], all: boolean = true): TShortcut | TShortcut[] | undefined {
		return all ? this.entries.filter(filter) : this.entries.find(filter)
	}

	/**
	 * Swaps the given chords for all matching shortcuts.
	 *
	 * This is done by using forceUnequal for each set of matching shortcuts in turn.
	 *
	 * EXAMPLES:
	 *
	 * Given the following shortcuts:
	 *
	 * ```
	 * 1 A
	 * 1 B
	 * 2 C
	 * 2 D
	 * ```
	 *
	 * `swapChords([[1]], [[2]])` would result in:
	 *
	 * ```
	 * 2 A
	 * 2 B
	 * 1 C
	 * 1 D
	 * ```
	 *
	 * Multiple chords, and chords of unequal lengths can be safely swapped.
	 *
	 * ```
	 * 1 2 A
	 * 1 2 B
	 * 3 C
	 * 3 D
	 * ```
	 *
	 * `swapChords([[1], [2]], [[3]])`:
	 * ```
	 * 3 A
	 * 3 B
	 * 1 2 C
	 * 1 2 D
	 * ```
	 *
	 * A filter function is provided, to, for example, filter out disabled entries from the swap. Note that it might be unsafe to swap entries with a filter if the new entries can be equal to the ignored ones, hence why `canSwapChords` exists.
	 *
	 * Example of how it might be a problem:
	 * ```
	 * A
	 * B
	 * ```
	 * `swapChords([[A]], [[B]], () => { filter that ignores A })` would result in two A shortcuts.
	 *
	 * But if, for example, you use the filter to ignore disabled shortcuts, this wouldn't be a problem because you'd get two unequal shortcuts (A and A(disabled)), though re/dis-abling one of them would trigger a conflict.
	 *
	 * Note: Certain types of chords cannot be swapped, like empty chords, or chords which share a base. See canSwapChords.
	 *
	 * If using the experimental {@link ignoreModifierConflicts  Shortcuts["ignoreModifierConflicts"]}, note that you cannot use this to swap the base modifiers.
	 *
	 * For example, say you had:
	 * ```
	 * Ctrl+A
	 *	Ctrl
	 * ```
	 * If you do `swapChords([Ctrl],[Shift])`, `Ctrl+A` is not considered to match the `[Ctrl]` chord and you will get:
	 * ```
	 * Ctrl+A
	 *	Shift
	 * ```
	 */
	swapChords(
		chordsA: Key[][], chordsB: Key[][],
		{ check = true }: { check?: boolean } = {},
		filter?: (shortcut: Shortcut) => boolean
	): Result<true, KnownError<ERROR.INVALID_SWAP_CHORDS | ERROR.INVALID_SWAP_CHORDS | ERROR.DUPLICATE_SHORTCUT> | Error> {
		const res = this._assertCorrectSwapParameters(chordsA, chordsB)
		if (res.isError) { return res }

		if (check) {
			// eslint-disable-next-line @typescript-eslint/no-shadow
			const res = this.canSwapChords(chordsA, chordsB, filter)
			if (res.isError) { return res }
		}

		let shortcutsA = this.query(shortcut => shortcut.equalsKeys(chordsA, chordsA.length)) ?? []
		let shortcutsB = this.query(shortcut => shortcut.equalsKeys(chordsB, chordsB.length)) ?? []

		if (filter) {
			shortcutsA = shortcutsA.filter(filter)
			shortcutsB = shortcutsB.filter(filter)
		}

		this._setForceUnequal(shortcutsA, true)
		for (const shortcutB of shortcutsB) {
			shortcutB.set("chain", [...chordsA, ...shortcutB.chain.slice(chordsA.length, shortcutB.chain.length)])
		}
		this._setForceUnequal(shortcutsA, false)
		this._setForceUnequal(shortcutsB, true)
		for (const shortcutA of shortcutsA) {
			shortcutA.set("chain", [...chordsB, ...shortcutA.chain.slice(chordsB.length, shortcutA.chain.length)])
		}
		this._setForceUnequal(shortcutsB, false)
		return Ok(true)
	}

	private _assertCorrectSwapParameters(
		chordsA: Key[][], chordsB: Key[][],
	): Result<true, KnownError<ERROR.INVALID_SWAP_CHORDS>> {
		const canA = this._assertChordsNotEmpty(chordsA)
		if (canA.isError) { return canA }
		const canB = this._assertChordsNotEmpty(chordsB)
		if (canB.isError) { return canB }

		if (equalsKeys(chordsA, chordsB, chordsB.length)
			|| equalsKeys(chordsB, chordsA, chordsA.length)
		) {
			return Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, crop`
			The chords to swap cannot share starting chords.
			Chords:
			${this.stringifier.stringify(chordsA)}
			${this.stringifier.stringify(chordsB)}
			`, { chordsA, chordsB }))
		}
		return Ok(true)
	}

	private _assertChordsNotEmpty(chord: Key[][]): Result<true, KnownError<ERROR.INVALID_SWAP_CHORDS>> {
		let found: undefined | Key[][]
		if (chord.length === 0 || chord.find(keys => keys.length === 0)) {
			found = chord
		}
		if (found) {
			return Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, `Cannot swap with empty chord, but ${this.stringifier.stringify(chord)} contains an empty chord.`, { chord }))
		}
		return Ok(true)
	}

	private _setForceUnequal(shortcuts: Shortcut[], value: boolean): void {
		for (const shortcut of shortcuts) {
			shortcut.forceUnequal = value
		}
	}

	/**
	 * Returns whether swapChords will succeed.
	 *
	 * Uses forceUnequal to be able to check each set of matching shortcuts in turn.
	 *
	 * Also checks the parameters are valid. Certain types of chords cannot be swapped, like empty chords, or chords which share a base.
	 */
	canSwapChords(
		chainA: Key[][], chainB: Key[][],
		filter?: (shortcut: Shortcut) => boolean
	): Result<true, Error | KnownError<ERROR.INVALID_SWAP_CHORDS | ERROR.DUPLICATE_SHORTCUT>> {
		const e = this._assertCorrectSwapParameters(chainA, chainB)
		if (e.isError) {
			return e
		}

		let shortcutsA = this.query(shortcut => shortcut.equalsKeys(chainA, chainA.length)) ?? []
		let shortcutsB = this.query(shortcut => shortcut.equalsKeys(chainB, chainB.length)) ?? []
		if (filter) {
			shortcutsA = shortcutsA.filter(filter)
			shortcutsB = shortcutsB.filter(filter)
		}

		let can: Result<true, any> = Ok(true)

		for (const shortcutA of shortcutsA) {
			shortcutA.forceUnequal = true
		}

		for (const shortcutB of shortcutsB) {
			const newChain = [...chainA, ...shortcutB.chain.slice(chainA.length, shortcutB.chain.length)]
			const res = shortcutB.allows("chain", newChain)
			if (res.isError) {
				can = res as any
				break
			}
		}

		for (const shortcutA of shortcutsA) {
			shortcutA.forceUnequal = false
		}

		if (can.isOk) {
			for (const shortcutB of shortcutsB) {
				shortcutB.forceUnequal = true
			}


			for (const shortcutA of shortcutsA) {
				const res = shortcutA.allows("chain", [...chainB, ...shortcutA.chain.slice(chainB.length, shortcutA.chain.length)])
				if (res.isError) {
					can = res as any
					break
				}
			}

			for (const shortcutB of shortcutsB) {
				shortcutB.forceUnequal = false
			}
		}

		return can
	}

	export(): ReturnType<Shortcut["export"]>[] {
		return this.entries.map(shortcut => shortcut.export())
	}

	/**
	 * @inheritdoc
	 */
	override create<T extends Shortcut = Shortcut>(rawEntry: T | RawShortcut): T {
		if (rawEntry instanceof Shortcut) {
			rawEntry.sorter = this.sorter
			rawEntry.stringifier = this.stringifier
			return rawEntry
		}
		return this._basePrototype.create({
			...rawEntry,
			opts: {
				...rawEntry.opts,
				sorter: this.sorter ?? rawEntry.opts?.sorter,
				stringifier: this.stringifier ?? rawEntry.opts?.stringifier,
			},
		}) as T
	}

	/**
	 * Checks if all shortcuts can be removed, if they can, removes them all, otherwise does nothing and returns the error.
	 *
	 * Useful for "emptying" out shortcuts when importing configs.
	 */
	safeRemoveAll(): Result<true, Error> {
		const res = this.entries.map(shortcut => this.allows("remove", shortcut)).find(res2 => res2.isError) ?? Ok(true)
		if (res.isError) return res
		else {
			for (const shortcut of this.entries) {
				this.remove(shortcut)
			}
		}
		return Ok(true)
	}

	// toString(): string {
	// TODO for strings and keys
	// 	return this.entries.map(_ => this.stringifier.stringify(_)).join("\n")
	// }
}
