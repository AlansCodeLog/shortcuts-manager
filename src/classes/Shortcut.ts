import { KnownError } from "@/helpers"
import { throwIfImpossibleToggles } from "@/helpers/throwIfImpossibleToggles"
import { throwIfInvalidChord } from "@/helpers/throwIfInvalidChord"
import { MixinHookablePlugableBase } from "@/mixins"
import type { DeepPartialObj, Optional, PluginsInfo, RawShortcut, ShortcutHooks, ShortcutOptions } from "@/types"
import type { Command } from "./Command"
import { Condition } from "./Condition"
import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import type { Plugin } from "./Plugin"




export class Shortcut<
	// See [[Plugable]]
	TPlugins extends
		Plugin<any, undefined>[] =
		Plugin<any, undefined>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
> extends MixinHookablePlugableBase<ShortcutHooks, TPlugins, TInfo> implements ShortcutOptions {
	/** The keys that make up the shortcut. Note that this is NOT a unique identifier for shortcuts and cannot be used to compare them if you are making use of the when/context/active options. */
	keys: Key[][] = []
	/** See {@link KeysStringifier} */
	stringifier: ShortcutOptions["stringifier"] = defaultStringifier
	/** See {@link KeysSorter} */
	sorter: ShortcutOptions["sorter"] = defaultSorter
	/** The {@link Command} to associate with the shortcut. */
	command?: Command
	/** The {@link Condition} a shortcut is allowed to be triggered on. If both the command and the shortcut have a condition, both must be met. */
	condition: Condition = new Condition("")
	/** Whether the shortcut is enabled. Defaults to true. */
	enabled: boolean = true
	/** It is sometimes useful for some shortcuts to not equal eachother temporarily. For example, inside allow hooks when swapping, this makes it easier to return the correct answer without making major modifications to the instances. */
	forceUnequal: boolean = false
	/**
	 * # Shortcut
	 *
	 * Create a shortcut.
	 *
	 * Note: You cannot add more plugins or change the structure of info after creating an instance.
	 *
	 * @template TPlugins **@internal** See {@link PlugableBase}
	 * @template TInfo **@internal** See {@link PlugableBase}
	 * @param keys A list of {@link Key | keys}.
	 * @param opts Set {@link ShortcutOptions}
	 * @param info See {@link Shortcut.info}
	 * @param plugins See {@link Shortcut.plugins}
	 */
	constructor(
		keys: Key[][],
		opts?: RawShortcut["opts"],
	)
	constructor(
		keys: Key[][],
		opts: Optional<RawShortcut["opts"]> | {},
		info: DeepPartialObj<TInfo>,
		plugins: TPlugins
	)
	constructor(
		keys: Key[][],
		opts: RawShortcut["opts"] = {},
		info?: DeepPartialObj<TInfo>,
		plugins?: TPlugins,
	) {
		super()
		if (opts.stringifier) this.stringifier = opts.stringifier
		this._mixin({
			hookable: { keys: ["allows", "set"] },
			plugableBase: { plugins, info, key: undefined }
		})
		this.addHook("allows", this._hooksAllows.bind(this))
		if (opts.enabled) this.enabled = opts.enabled
		if (opts.sorter) this.sorter = opts.sorter
		this.set("command", opts.command)
		if (opts.condition) this.set("condition", opts.condition)
		this.set("keys", keys)
	}
	/**
	 * Returns whether the shortcut passed is equal to this one.
	 *
	 * To return true, their keys and command must be equal, their condition must be equal according to this shortcut's condition, and they must be equal according to their plugins.
	 */
	equals(shortcut: Shortcut): shortcut is Shortcut<TPlugins, TInfo> {
		if (this.forceUnequal) return false
		return (
			this === shortcut
			||
			(
				this.equalsKeys(shortcut.keys)
				&& this.equalsInfo(shortcut)
				&& this.condition.equals(shortcut.condition)
				&& (this.command?.equals(shortcut.command) || shortcut.command?.equals(this.command) || this.command === shortcut.command)
			)
		)
	}
	/**
	 * A wrapper around static {@link Shortcut.equalsKeys} for the instance.
	 */
	equalsKeys(keys: Key[][], length?: number) {
		return Shortcut.equalsKeys(this.keys, keys, length)
	}
	/**
	 * Returns if the given chords are equal.
	 *
	 * Can be passed a length, to limit the search to only the first x chords.
	 *
	 * ```ts
	 * Shortcut.equalsKeys([[k.a]], [[k.a]]) // true
	 * Shortcut.equalsKeys([[k.a], [k.b]], [[k.a]]) // false
	 * Shortcut.equalsKeys([[k.a], [k.b]], [[k.a]], 1) // true
	 * Shortcut.equalsKeys([[k.a], [k.b]], [[k.a], [k.b]], 2) // true
	 * Shortcut.equalsKeys([[k.a], [k.b]], [[k.a], [k.b], [k.c]], 3) // false
	 * Shortcut.equalsKeys([[k.a], [k.b]], [[k.b]], 1) // false
	 * ```
	 *
	 */
	static equalsKeys(keys: Key[][], base: Key[][], length?: number): boolean {
		// Since they're pre-sorted this should be quite fast
		if (
			(length == undefined && base.length !== keys.length) ||
			(length !== undefined && (keys.length < length || base.length < length))
		) return false

		return keys.slice(0, length ?? keys.length)
			.find((thisChord, c) => {
				const otherChord = base[c]
				if (!otherChord || otherChord.length !== thisChord.length) return true
				return thisChord.find((thisKey, i) => {
					const shortcutKey = otherChord[i]
					if (!shortcutKey) return true
					return !thisKey.equals(shortcutKey)
				}) !== undefined
			}) === undefined
	}
	get opts(): ShortcutOptions {
		return { command: this.command, sorter: this.sorter, enabled: this.enabled, condition: this.condition, stringifier: this.stringifier}
	}
	protected override _set<TKey extends keyof ShortcutHooks>(
			key: TKey,
			value: ShortcutHooks[TKey]["value"],
	): void {
		switch (key) {
			case "keys": {
				this.keys = (value as ShortcutHooks["keys"]["value"]).map((chord) => {
					return this.sorter.sort([...chord])
				})
			} break;
			default: {
				(this as any)[key] = value
			}
		}
	}
	private _hooksAllows<TKey extends keyof ShortcutHooks>(key: TKey, value: ShortcutHooks[TKey]["value"]): true | ShortcutHooks[TKey]["error"] {
		switch (key) {
			case "keys": return this._hookAllowsKeys(value as ShortcutHooks["keys"]["value"])
			default: return true
		}
	}
	private _hookAllowsKeys(value: ShortcutHooks["keys"]["value"]): true | ShortcutHooks["keys"]["error"] {
		try {
			value = value.map((chord, i) => {
				throwIfInvalidChord({ keys: value }, chord, i, this.stringifier)
				return this.sorter.sort([...chord])
			})
			throwIfImpossibleToggles(value, this.stringifier)
		} catch (e: unknown) {
			if (e instanceof KnownError) return e
			throw e
		}
		return true
	}
}

// export interface Shortcut<TPlugins, TInfo> extends HookableBase<ShortcutHooks>, PlugableBase<TPlugins, TInfo> { }
// mixin(Shortcut, [Hookable, HookableBase, Plugable, PlugableBase])
