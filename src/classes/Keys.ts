import { defaultCallback } from "@/helpers"
import { HookableCollection, MixinHookablePlugableCollection, PlugableCollection } from "@/mixins"
import type { ERROR, ErrorCallback, KeysHook, KeysOptions, OnlyRequire, RecordFromArray } from "@/types"
import { Key } from "./Key"
import { defaultStringifier } from "./KeysStringifier"
import type { Plugin } from "./Plugin"



export class Keys<
	TPlugins extends
		Plugin<any>[] =
		Plugin<any>[],
	TKey extends
		Key<TPlugins> =
		Key<TPlugins>,
	TRawKeys extends
		OnlyRequire<TKey, "id">[] =
		OnlyRequire<TKey, "id">[],
	TEntries extends
		RecordFromArray<TRawKeys, "id", TKey> =
		RecordFromArray<TRawKeys, "id", TKey>,
> extends MixinHookablePlugableCollection<KeysHook, TPlugins> {
	entries: TEntries
	stringifier: KeysOptions["stringifier"] = defaultStringifier
	/**
	 * Creates a set of keys.
	 * In the case plugins are passed, forces the keys to conform to those, adds missing properties, etc.
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
			hookable: { keys: ["allows", "add"] },
			plugableCollection: {plugins, key:"id"}
		})
		if (plugins) {
			PlugableCollection._canAddPlugins(plugins)
			this.plugins = plugins
		}

		this.entries = {} as TEntries

		keys.forEach(key => {
			this.add(key)
		})
	}
	protected override _add(entry: OnlyRequire<Key, "id">, cb: ErrorCallback<ERROR.DUPLICATE_KEY> = defaultCallback): void {
		const instance = PlugableCollection.create<Key, "id">(Key, this.plugins, "id", entry)
		HookableCollection._addToDict<Key>(this, this.entries, instance, t => t.id, cb)
	}
	get(id: TRawKeys[number]["id"] | string): TKey {
		return this.entries[id as keyof TEntries]
	}
	/** Returns whether some key matches a custom filter. */
	exists(filter: (existing: Key) => boolean): boolean {
		return this.find(filter) !== undefined
	}
	/** Find a key with a custom filter. */
	find(filter: (existing: Key) => boolean): Key {
		return Object.values(this.entries).find(existing => filter(existing as Key)) as Key
	}
	/** Filter keys with a custom filter. */
	filter(filter: (existing: Key) => boolean): Key[] {
		return Object.values(this.entries).filter(existing => filter(existing as Key)) as Key[]
	}
	info(id: TRawKeys[number]["id"] | string): TKey["info"] {
		return this.entries[id as keyof TEntries].info
	}
}
// export interface Keys<TPlugins> extends HookableCollection<KeysHook>, PlugableCollection<TPlugins> { }
// mixin(Keys, [Hookable, HookableCollection, Plugable, PlugableCollection])
