import { AnyClass, crop, indent, pretty } from "@alanscodelog/utils"
import type { Result } from "@alanscodelog/utils/dist/utils"
import { Err, Ok } from "@alanscodelog/utils/dist/utils"

import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import { Shortcut } from "./Shortcut"

import { HookableCollection } from "@/bases"
import { castType, KnownError } from "@/helpers"
import { ERROR, RawShortcut, ShortcutOptions, ShortcutsHooks, ShortcutsOptions } from "@/types"


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
> extends HookableCollection<ShortcutsHooks> implements Pick<ShortcutOptions, "stringifier" | "sorter"> {
	protected _basePrototype: AnyClass<Shortcut> & { create(...args: any[]): Shortcut } = Shortcut
	override entries: TEntries
	private readonly _boundAllowsHook: any
	/** @inheritdoc */
	stringifier: ShortcutOptions["stringifier"] = defaultStringifier
	/** @inheritdoc */
	sorter: ShortcutOptions["sorter"] = defaultSorter
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
		super()
		if (opts.stringifier) this.stringifier = opts.stringifier
		if (opts.sorter) this.sorter = opts.sorter
		this.entries = [] as any
		this._boundAllowsHook = this._allowsHook.bind(this)
		for (let entry of shortcuts) {
			entry = this._basePrototype.create(entry)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		}
	}
	protected override _add(entry: Shortcut | RawShortcut): void {
		if (this.stringifier) entry.stringifier = this.stringifier
		if (this.sorter) entry.sorter = this.sorter
		entry = this._basePrototype.create(entry)
		castType<Shortcut>(entry)

		entry.addHook("allows", this._boundAllowsHook)

		const entries = this.entries as any
		entries.push(entry)
	}
	protected _allowsHook(key: string, value: any, _old: any, instance: Shortcut): Result<true, KnownError<ERROR.DUPLICATE_SHORTCUT>> {
		const proxy = Proxy.revocable(instance, {
			get(target: any, prop: any, receiver: any) {
				if (prop === key) { return value }
				return Reflect.get(target, prop, receiver)
			},
		}) as any
		const existing = this.query(entry => entry.equals(proxy.proxy) && entry !== instance, false)
		proxy.revoke()
		if (existing !== undefined) {
			return Err(new KnownError(ERROR.DUPLICATE_SHORTCUT, crop`There is already an existing instance in this collection that would conflict when changing the "${key}" prop of this instance to ${value}.
			Existing:
			${indent(pretty(existing), 4)}

			Instance:
			${indent(pretty(instance), 4)}

			Change:
			${indent(pretty({ key, value }), 4)}

			`, { existing, self: instance as any }))
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

		if (Shortcut.equalsKeys(chordsA, chordsB, chordsB.length)
			|| Shortcut.equalsKeys(chordsB, chordsA, chordsA.length)
		) {
			return Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, crop`
			The chords to swap cannot share starting chords.
			Chords:
			${indent(pretty(chordsA.map(keys => keys.map(key => this.stringifier.stringify(key))), { oneline: true }), 4)}
			${indent(pretty(chordsB.map(keys => keys.map(key => this.stringifier.stringify(key))), { oneline: true }), 4)}
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
			return Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, `Cannot swap with empty chord, but ${pretty(chord.map(keys => keys.map(key => this.stringifier.stringify(key))), { oneline: true })} contains an empty chord.`, { chord }))
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
	 * Also checks the parameters are valid (Certain types of chords cannot be swapped, like empty chords, or chords which share a base. See canSwapChords.)
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
			const res = shortcutB.allows("chain", [...chainA.filter(chord => chord.length > 0), ...shortcutB.chain.slice(chainA.length, shortcutB.chain.length)])
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
				const res = shortcutA.allows("chain", [...chainB.filter(chord => chord.length > 0), ...shortcutA.chain.slice(chainB.length, shortcutA.chain.length)])
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
}
