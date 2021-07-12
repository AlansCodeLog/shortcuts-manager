import type { KnownError } from "@/helpers"
import { defaultCallback } from "@/helpers"
import { HookableCollection, MixinHookablePlugableCollection, Plugable } from "@/mixins"
import { internalPlugableCollectionAllowsHook } from "@/mixins/PlugableCollection"
import type { ERROR, ErrorCallback, OnlyRequire, ShortcutOptions, ShortcutsHook, ShortcutsOptions } from "@/types"
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
		OnlyRequire<TShortcut, "keys">[] =
		OnlyRequire<TShortcut, "keys">[],
	TEntries extends
		TShortcut[] =
		TShortcut[],
> extends MixinHookablePlugableCollection<ShortcutsHook, TPlugins> {
	entries: TEntries
	/** See {@link KeysStringifier} */
	stringifier: ShortcutOptions["stringifier"] = defaultStringifier
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
		plugins?: TPlugins,
		opts: Partial<ShortcutsOptions> = {}
	) {
		super()
		if (opts.stringifier) this.stringifier = opts.stringifier
		this._mixin({
			hookable: { keys: ["allows", "add"] },
			plugableCollection: { plugins, key: ""}
		})
		this.entries = [] as any
		shortcuts.forEach(shortcut => {
			this.add(shortcut, defaultCallback)
		})
	}
	protected override _add(entry: OnlyRequire<TShortcut, "keys"> | Shortcut, cb: ErrorCallback<ERROR.DUPLICATE_SHORTCUT> = defaultCallback): void {
		const instance = Plugable.create<Shortcut, "keys">(Shortcut, this.plugins, "keys", entry)
		HookableCollection._addToDict<Shortcut>(this, this.entries, instance, undefined, cb)
	}
	protected override _allows(entry: OnlyRequire<TShortcut, "keys"> | Shortcut): true | KnownError<ERROR.DUPLICATE_SHORTCUT | ERROR.CONFLICTING_ENTRY_PLUGINS> {
		return internalPlugableCollectionAllowsHook(this, entry)
	}
	/**
	 * Query the class for some shortcut/s.
	 *
	 * Unlike other classes, shortcuts cannot be indexed by a single property, such as {@link Shortcut.keys}, because it should be perfectly possible to add two shortcuts with the same keys but, for example, where one is active and the other isn't, or where one has one condition and the other another.
	 *
	 * Instead they're just kept in an array.
	 *
	 * So this is just a wrapper around array filter/find.
	 *
	 * @param all If set to true, uses filter and returns all matching entries. Otherwise uses find and only returns the first match.
	 */
	get(filter: Parameters<Array<TShortcut>["filter"]>["0"], all?: true): TShortcut[] | undefined
	get(filter: Parameters<Array<TShortcut>["find"]>["0"], all?: false): TShortcut | undefined
	get(filter: Parameters<Array<TShortcut>["filter"] | Array<TShortcut>["find"]>["0"], all: boolean = true): TShortcut| TShortcut[] | undefined {
		return all ? this.entries.filter(filter) : this.entries.find(filter)
	}
	/**
	 * Works like {@link Shortcuts.get}, but returns the info property/s instead.
	 *
	 * @param all If set to true, uses filter and returns all matching entries. Otherwise uses find and only returns the first match.
	 */
	info(filter: Parameters<Array<TShortcut>["filter"]>["0"], all?: true): TShortcut["info"][] | undefined
	info(filter: Parameters<Array<TShortcut>["find"]>["0"], all?: false): TShortcut["info"] | undefined
	info(filter: Parameters<Array<TShortcut>["filter"] | Array<TShortcut>["find"]>["0"], all: boolean = true): TShortcut["info"] | TShortcut["info"][] | undefined {
		return all ? this.entries.filter(filter).map(entry => entry.info) : this.entries.find(filter)?.info
	}
}
// export interface Shortcuts<TPlugins> extends HookableCollection<ShortcutsHook>, PlugableCollection<TPlugins> { }
// mixin(Shortcuts, [Hookable, HookableCollection, Plugable, PlugableCollection])
