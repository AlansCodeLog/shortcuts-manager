import { Key } from "./Key"
import { defaultStringifier } from "./KeysStringifier"
import type { Plugin } from "./Plugin"

import { isToggleKey } from "@/helpers"
import { HookableCollection, MixinHookablePlugableCollection } from "@/mixins"
import type { KeyOptions, KeysHooks, KeysOptions, RawKey, RecordFromArray } from "@/types"


export class Keys<
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	TKey extends
		Key<TPlugins> =
		Key<TPlugins>,
	TRawKeys extends
		RawKey[] =
		RawKey[],
	TEntries extends
		RecordFromArray<TRawKeys, "id", TKey> =
		RecordFromArray<TRawKeys, "id", TKey>,
> extends MixinHookablePlugableCollection<KeysHooks, TPlugins> {
	override entries: TEntries
	stringifier: KeyOptions["stringifier"] = defaultStringifier
	/**
	 * Creates a set of keys.
	 *
	 * In the case plugins forces the keys to conform to those, adds missing properties, etc. Same thing with the stringifier option.
	 *
	 *	All versions of toggle keys are automatically also added to the set.
	 *
	 * Note:
	 * - This will mutate the keys passed to it.
	 * - It can throw. See {@link ERROR} for why.
	 *
	 * @template TPlugins **@internal** See {@link PlugableCollection}
	 * @template TKey **@internal** Makes it so that all keys in this instance are correctly typed with the plugins of the instance.
	 * @template TRawKeys **@internal** Allow passing raw keys.
	 * @template TEntries **@internal** See {@link ./README.md Collection Entries}
	 * @param keys A list of {@link Key | keys}.
	 * @param opts A list of {@link KeysOptions}.
	 * @param plugins See {@link Keys.plugins}
	 */
	constructor(
		keys: TRawKeys,
		opts?: Partial<KeysOptions>,
		plugins?: TPlugins,
	) {
		super()
		if (opts?.stringifier) this.stringifier = opts.stringifier

		this._mixin({
			hookable: { keys: ["add", "remove", "allowsAdd", "allowsRemove"]},
			plugableCollection: { plugins, key: "id" },
		})

		this.entries = {} as TEntries

		keys.forEach(entry => {
			entry = Key.create(entry, this.plugins)
			if (this.allows("add", entry).unwrap()) this.add(entry)
		})
	}
	protected override _add(entry: Key): void {
		if (this.stringifier) entry.stringifier = this.stringifier
		entry = Key.create(entry, this.plugins)

		HookableCollection._addToDict<Key>(this.entries, entry, t => t.id)
		if (isToggleKey(entry)) {
			HookableCollection._addToDict<Key>(this.entries, entry.on as Key, t => t.id)
			HookableCollection._addToDict<Key>(this.entries, entry.off as Key, t => t.id)
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
// export interface Keys<TPlugins> extends HookableCollection<KeysHook>, PlugableCollection<TPlugins> { }
// mixin(Keys, [Hookable, HookableCollection, Plugable, PlugableCollection])
