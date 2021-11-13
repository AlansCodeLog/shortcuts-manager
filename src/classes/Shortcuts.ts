import { KnownError } from "@/helpers"
import { HookableCollection, MixinHookablePlugableCollection, Plugable } from "@/mixins"
import { ERROR, RawShortcut, ShortcutOptions, ShortcutsHook, ShortcutsOptions } from "@/types"
import { crop, indent, pretty } from "@alanscodelog/utils"
import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import type { Plugin } from "./Plugin"
import { Shortcut } from "./Shortcut"


export class Shortcuts<
	TPlugins extends
		Plugin<any, undefined>[] =
		Plugin<any, undefined>[],
	TShortcut extends
		Shortcut<TPlugins> =
		Shortcut<TPlugins>,
	TRawShortcuts extends
		(RawShortcut | TShortcut)[] =
		(RawShortcut | TShortcut)[],
	TEntries extends
		TShortcut[] =
		TShortcut[],
> extends MixinHookablePlugableCollection<ShortcutsHook, TPlugins> {
	override entries: TEntries
	private _boundAllowsHook: any
	/** See {@link KeysStringifier} */
	stringifier: ShortcutOptions["stringifier"] = defaultStringifier
	sorter: ShortcutOptions["sorter"] = defaultSorter
	/**
	 * # Shortcut
	 *
	 * Creates a set of shortcuts.
	 *
	 * If existing shortcuts and plugins are passed, forces the shortcuts to conform to those. It is not a good idea to pass existing shortcuts with plugins already added that are different from the plugins passed to the class.
	 *
	 * Note:
	 * - This will mutate the shortcuts passed to it.
	 * - It can throw. See {@link ERROR} for why.
	 *
	 * @template TPlugins **@internal** See {@link PlugableCollection}
	 * @template TShortcut **@internal** Makes it so that all shortcuts in this instance are correctly typed with the plugins of the instance.
	 * @template TRawShortcuts **@internal** Allow passing raw shortcuts.
	 * @template TEntries **@internal** See {@link ./README.md Collection Entries}
	 * @param shortcuts A list of {@link Shortcut | shortcuts}.
	 * @param plugins See {@link Shortcuts.plugins}
	 */
	constructor(
		shortcuts: TRawShortcuts,
		opts: Partial<ShortcutsOptions> = {},
		plugins?: TPlugins,
	) {
		super()
		if (opts.stringifier) this.stringifier = opts.stringifier
		if (opts.sorter) this.sorter = opts.sorter
		this._mixin({
			hookable: { keys: ["add", "remove", "allowsAdd", "allowsRemove"] },
			plugableCollection: { plugins, key: ""}
		})
		this.entries = [] as any
		this._boundAllowsHook = this._allowsHook.bind(this)
		shortcuts.forEach(shortcut => {
			this.add(shortcut)
		})
	}
	protected override _add(entry: RawShortcut | TShortcut): void {
		if (this.stringifier) {
			if (entry instanceof Shortcut) {
				entry.stringifier = this.stringifier
			} else {
				//@ts-ignore
				entry.opts = {...(entry.opts ?? {}), stringifier: this.stringifier}
			}
		}
		if (this.sorter) {
			if (entry instanceof Shortcut) {
				entry.sorter = this.sorter
			} else {
				//@ts-ignore
				entry.opts = { ...(entry.opts ?? {}), sorter: this.sorter }
			}
		}
		const instance = Plugable.create<Shortcut, "keys">(Shortcut, this.plugins, "keys", entry)
		HookableCollection._addToDict<Shortcut>(this, this.entries, instance, undefined)
		instance.addHook("allows", this._boundAllowsHook)
	}
	protected _allowsHook(key: string, value: any, _old: any, instance: Shortcut): true | KnownError<ERROR.DUPLICATE_SHORTCUT> {
		const proxy = Proxy.revocable(instance, {
			get: function (target, prop, receiver) {
				if (prop === key) { return value }
				return Reflect.get(target, prop, receiver)
			}
		}) as any
		const existing = this.query((existing) => existing.equals(proxy.proxy) && existing !== instance, false)
		proxy.revoke()
		if (existing !== undefined) {
			return new KnownError(ERROR.DUPLICATE_SHORTCUT, crop`There is already an existing instance in this collection that would conflict when changing the "${key}" prop of this instance to ${value}.
			Existing:
			${indent(pretty(existing), 4)}

			Instance:
			${indent(pretty(instance), 4)}

			Change:
			${indent(pretty({ key, value }), 4)}

			`, { existing, self: instance as any })
		}
		return true
	}

	protected override _remove(shortcut: Shortcut): void {
		shortcut.removeHook("allows", this._boundAllowsHook)
		HookableCollection._removeFromDict<Shortcut>(this, this.entries, shortcut, undefined)
	}
	/**
	 * Query the class for some shortcut/s. Just a simple wrapper around array find/filter
	 *
	 * Note: Unlike other classes, this class does not have a `get` method since shortcuts cannot be indexed by a single property, such as {@link Shortcut.keys}, because it should be perfectly possible to add two shortcuts with the same keys but, for example, where one is active and the other isn't, or where one has one condition and the other another.
	 *
	 * @param all If set to true, uses filter and returns all matching entries. Otherwise uses find and only returns the first match.
	 */
	query(filter: Parameters<Array<TShortcut>["filter"]>["0"], all?: true): TShortcut[] | undefined
	query(filter: Parameters<Array<TShortcut>["find"]>["0"], all?: false): TShortcut | undefined
	query(filter: Parameters<Array<TShortcut>["filter"] | Array<TShortcut>["find"]>["0"], all: boolean = true): TShortcut| TShortcut[] | undefined {
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
	): void {

		const e = this._assertCorrectSwapParameters(chordsA, chordsB)
		if (e instanceof Error) { throw e }

		if (check) {
			const e = this.canSwapChords(chordsA, chordsB, filter)
			if (e instanceof Error) { throw e }
		}

		let shortcutsA = this.query((shortcut) => shortcut.equalsKeys(chordsA, chordsA.length)) ?? []
		let shortcutsB = this.query((shortcut) => shortcut.equalsKeys(chordsB, chordsB.length)) ?? []

		if (filter) {
			shortcutsA = shortcutsA.filter(filter)
			shortcutsB = shortcutsB.filter(filter)
		}

		this._setForceUnequal(shortcutsA, true)
		for (let shortcutB of shortcutsB) {
			shortcutB.set("keys", [...chordsA, ...shortcutB.keys.slice(chordsA.length, shortcutB.keys.length)])
		}
		this._setForceUnequal(shortcutsA, false)
		this._setForceUnequal(shortcutsB, true)
		for (let shortcutA of shortcutsA) {
			shortcutA.set("keys", [...chordsB, ...shortcutA.keys.slice(chordsB.length, shortcutA.keys.length)])
		}
		this._setForceUnequal(shortcutsB, false)
	}
	private _assertCorrectSwapParameters(
		chordsA: Key[][], chordsB: Key[][],
	): Error | true {
		const canA = this._assertChordsNotEmpty(chordsA)
		if (canA instanceof Error) { return canA }
		const canB = this._assertChordsNotEmpty(chordsB)
		if (canB instanceof Error) { return canB }

		if (Shortcut.equalsKeys(chordsA, chordsB, chordsB.length)
			|| Shortcut.equalsKeys(chordsB, chordsA, chordsA.length)
		) {
			return new KnownError(ERROR.INVALID_SWAP_CHORDS, crop`
			The chords to swap cannot share starting chords.
			Chords:
			${indent(pretty(chordsA.map(keys => keys.map(key => this.stringifier.stringify(key))), { oneline: true }), 4)}
			${indent(pretty(chordsB.map(keys => keys.map(key => this.stringifier.stringify(key))), { oneline: true }), 4)}
			`, {chordsA, chordsB})
		}
		return true
	}
	private _assertChordsNotEmpty(chord: Key[][]): Error | true {
		let found: undefined | Key[][]
		if (chord.length === 0 || chord.find(keys => keys.length === 0)) {
			found = chord
		}
		if (found) {
			console.log(found);

			return new KnownError(ERROR.INVALID_SWAP_CHORDS, `Cannot swap with empty chord, but ${pretty(chord.map(keys => keys.map(key => this.stringifier.stringify(key))), {oneline: true})} contains an empty chord.`, {chord})
		}
		return true
	}
	private _setForceUnequal(shortcuts: Shortcut[], value: boolean) {
		for (let shortcut of shortcuts) {
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
		chordsA: Key[][], chordsB: Key[][],
		filter?: (shortcut: Shortcut) => boolean
	): true | Error | KnownError<ERROR.INVALID_SWAP_CHORDS | ERROR.DUPLICATE_SHORTCUT> {

		const e = this._assertCorrectSwapParameters(chordsA, chordsB)
		if (e instanceof Error) {
			return e
		}

		let shortcutsA = this.query((shortcut) => shortcut.equalsKeys(chordsA, chordsA.length)) ?? []
		let shortcutsB = this.query((shortcut) => shortcut.equalsKeys(chordsB, chordsB.length)) ?? []
		if (filter) {
			shortcutsA = shortcutsA.filter(filter)
			shortcutsB = shortcutsB.filter(filter)
		}

		let can: true | Error = true

		for (let shortcutA of shortcutsA) {
			shortcutA.forceUnequal = true
		}

		for (let shortcutB of shortcutsB) {
			const allowed = shortcutB.allows("keys", [...chordsA.filter(chord => chord.length > 0), ...shortcutB.keys.slice(chordsA.length, shortcutB.keys.length)])
			if (allowed instanceof Error) {
				can = allowed
				break
			}
		}

		for (let shortcutA of shortcutsA) {
			shortcutA.forceUnequal = false
		}

		if (can === true) {
			for (let shortcutB of shortcutsB) {
				shortcutB.forceUnequal = true
			}


			for (let shortcutA of shortcutsA) {
				const allowed = shortcutA.allows("keys", [...chordsB.filter(chord => chord.length > 0), ...shortcutA.keys.slice(chordsB.length, shortcutA.keys.length)])
				if (allowed instanceof Error) {
					can = allowed
					break
				}
			}

			for (let shortcutB of shortcutsB) {
				shortcutB.forceUnequal = false
			}
		}

		return can
	}
}
// export interface Shortcuts<TPlugins> extends HookableCollection<ShortcutsHook>, PlugableCollection<TPlugins> { }
// mixin(Shortcuts, [Hookable, HookableCollection, Plugable, PlugableCollection])
