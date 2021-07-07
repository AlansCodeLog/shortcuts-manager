import type { Plugin } from "./Plugin"
import { Shortcut } from "./Shortcut"

import { defaultCallback } from "@/helpers"
import { Hookable, HookableCollection, Plugable } from "@/mixins"
import { ERROR, ErrorCallback, HOOKABLE_CONSTRUCTOR_KEY, OnlyRequire, ShortcutsHook, ShortcutsOptions } from "@/types"


/**
 * Creates a shortcut.
 */
export class Shortcuts<
	// See [[Plugable]]
	TPlugins extends
		Plugin<undefined>[] =
		Plugin<undefined>[],
	// See [[./README #Collection Entries - Shortcuts]]
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
	/**
	 * Creates a set of shortcuts.
	 * In the case plugins are passed, forces the shortcuts to conform to those, adds missing properties, etc.
	 * Note:
	 * - This will mutate the shortcuts passed to it.
	 * - It can throw. See [[ERROR]] for why.
	 */
	constructor(
		shortcuts: TRawShortcuts,
		// todo
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_opts: Partial<ShortcutsOptions> = {},
		plugins?: TPlugins,
	) {
		this[HOOKABLE_CONSTRUCTOR_KEY](["allows", "add"])
		if (plugins) {
			Plugable.canAddPlugins(plugins, { isShortcut: true })
			this.plugins = plugins
		}
		this.entries = [] as any
		shortcuts.forEach(shortcut => {
			this.add(shortcut, defaultCallback)
		})
	}
	#add(entry: OnlyRequire<TShortcut, "keys">, cb: ErrorCallback<ERROR.DUPLICATE_SHORTCUT> = defaultCallback): void {
		const instance = Plugable.create<Shortcut, "keys">(Shortcut, this.plugins, "keys", entry)
		HookableCollection._addToDict<Shortcut>(this, this.entries, instance, undefined, cb)
	}
	/**
	 * Query the class for some shortcut/s.
	 * Unlike other classes, shortcuts cannot be indexed by a single property, such as [[Shortcut.keys]], because it should be perfectly possible to add two shortcuts with the same keys but where one is active and the other isn't, or where one is active in one context and the other in another.
	 * Instead they're just kept in an array.
	 * So get is just a wrapper around array filter/find.
	 *
	 * @param all If set to true, uses filter and returns all matching entries. Otherwise uses find and only returns the first match.
	 */
	get(filter: (existing: TShortcut) => boolean, all?: true): TShortcut[] | undefined
	get(filter: (existing: TShortcut) => boolean, all?: false): TShortcut | undefined
	get(filter: (existing: TShortcut) => boolean, all: boolean = true): TShortcut[] | TShortcut | undefined {
		return all ? this.entries.filter(filter) : this.entries.find(filter)
	}
	/** Works like [[Shortcuts.get]] but returns the info property/s instead. */
	info(filter: (existing: TShortcut) => boolean, all?: true): TShortcut["info"][] | undefined
	info(filter: (existing: TShortcut) => boolean, all?: false): TShortcut["info"] | undefined
	info(filter: (existing: TShortcut) => boolean, all: boolean = true): TShortcut["info"] | TShortcut["info"][] | undefined {
		return all
			? this.entries.filter(filter).map(entry => entry.info)
			: this.entries.find(filter)?.info
	}
	get opts(): ShortcutsOptions {
		return {}
	}
}
export interface Shortcuts<TPlugins> extends HookableCollection<ShortcutsHook>, Plugable<TPlugins> { }
mixin(Shortcuts, [Hookable, HookableCollection, Plugable])
