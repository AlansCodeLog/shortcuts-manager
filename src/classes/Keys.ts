import { mixin } from "@alanscodelog/utils"

import { Key } from "./Key"
import type { Plugin } from "./Plugin"

import { defaultCallback } from "@/helpers"
import { Hookable, HookableCollection } from "@/mixins"
import { ERROR, ErrorCallback, HOOKABLE_CONSTRUCTOR_KEY, KeysHook, KeysOptions, OnlyRequire, RecordFromArray } from "@/types"


export class Keys<
	// See [[./README #Plugins]] for how TPlugins and TPluginsBase work
	TPlugins extends
		Plugin<any>[] =
		Plugin<any>[],
	TKey extends
		Key<TPlugins> =
		Key<TPlugins>,
	TRawKeys extends
		OnlyRequire<TKey, "id">[] =
		OnlyRequire<TKey, "id">[],
	// See [[./README #Collection Entries]] for how this works
	TEntries extends
		RecordFromArray<TRawKeys, "id", TKey> =
		RecordFromArray<TRawKeys, "id", TKey>,
> implements KeysOptions {
	entries: TEntries
	private readonly plugins?: TPlugins
	/**
	 * Creates a set of keys.
	 * In the case plugins are passed, forces the keys to conform to those, adds missing properties, etc.
	 * Note:
	 * - This will mutate the keys passed to it.
	 * - It can throw. See [[ERROR]] for why.
	 */
	constructor(
		keys: TRawKeys,
		// opts: Partial<KeysOptions> = {},
		plugins?: TPlugins,
	) {
		this[HOOKABLE_CONSTRUCTOR_KEY](["allows", "add"])
		if (plugins) {
			Plugable.canAddPlugins(plugins)
			this.plugins = plugins
		}

		this.entries = {} as TEntries

		keys.forEach(key => {
			this.add(key)
		})
	}
	#add(entry: OnlyRequire<Key, "id">, cb: ErrorCallback<ERROR.DUPLICATE_KEY> = defaultCallback): void {
		const instance = Plugable.create<Key, "id">(Key, this.plugins, "id", entry)
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Keys<TPlugins> extends HookableCollection<KeysHook>, PlugableCollection<TPlugins> { }
mixin(Keys, [Hookable, HookableCollection, PlugableCollection])
