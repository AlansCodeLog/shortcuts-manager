import { mixin } from "@utils/utils"

import type { Plugin } from "./Plugin"
import { Shortcut } from "./Shortcut"

import { defaultCallback } from "@/helpers"
import { Hookable, HookableCollection, Plugable, PlugableCollection } from "@/mixins"
import type { ERROR, ErrorCallback, OnlyRequire, ShortcutsHook } from "@/types"


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
> {
	entries: TEntries
	readonly plugins?: TPlugins
	// TODO see if we can throw on shortcuts with existing shortcuts
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
	 * @template TInfo **@internal** See {@link PlugableCollection}
	 * @template TShortcut **@internal** Makes it so that all shortcuts in this instance are correctly typed with the plugins of the instance.
	 * @template TRawShortcuts **@internal** Allow passing raw shortcuts.
	 * @template TRawShortcuts **@internal** Allow passing raw shortcuts.
	 * @param keys A list of {@link Key | keys}.
	 * @param opts Set {@link ShortcutOptions}
	 * @param info See {@link Shortcut.info}
	 * @param plugins See {@link Shortcut.plugins}
	 */
	constructor(
		shortcuts: TRawShortcuts,
		plugins?: TPlugins,
	) {
		this._hookableConstructor(["allows", "add"])
		if (plugins) {
			Plugable._canAddPlugins(plugins, { isShortcut: true })
			this.plugins = plugins
		}
		this.entries = [] as any
		shortcuts.forEach(shortcut => {
			this.add(shortcut, defaultCallback)
		})
	}
	protected _add(entry: OnlyRequire<TShortcut, "keys">, cb: ErrorCallback<ERROR.DUPLICATE_SHORTCUT> = defaultCallback): void {
		const instance = Plugable.create<Shortcut, "keys">(Shortcut, this.plugins, "keys", entry)
		HookableCollection._addToDict<Shortcut>(this, this.entries, instance, undefined, cb)
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
	get(filter: (existing: TShortcut) => boolean, all?: true): TShortcut[] | undefined
	get(filter: (existing: TShortcut) => boolean, all?: false): TShortcut | undefined
	get(filter: (existing: TShortcut) => boolean, all: boolean = true): TShortcut[] | TShortcut | undefined {
		return all ? this.entries.filter(filter) : this.entries.find(filter)
	}
	/**
	 * Works like {@link Shortcuts.get}, but returns the info property/s instead.
	 *
	 * @param all If set to true, uses filter and returns all matching entries. Otherwise uses find and only returns the first match.
	 */
	info(filter: (existing: TShortcut) => boolean, all?: true): TShortcut["info"][] | undefined
	info(filter: (existing: TShortcut) => boolean, all?: false): TShortcut["info"] | undefined
	info(filter: (existing: TShortcut) => boolean, all: boolean = true): TShortcut["info"] | TShortcut["info"][] | undefined {
		return all
			? this.entries.filter(filter).map(entry => entry.info)
			: this.entries.find(filter)?.info
	}
}
export interface Shortcuts<TPlugins> extends HookableCollection<ShortcutsHook>, PlugableCollection<TPlugins> { }
mixin(Shortcuts, [Hookable, HookableCollection, Plugable, PlugableCollection])
