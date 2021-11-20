import { Ok, Result } from "@alanscodelog/utils"

import type { Command } from "./Command"
import { Condition } from "./Condition"
import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import type { Plugin } from "./Plugin"

import { containsPossibleToggleChords } from "@/helpers/containsPossibleToggleChords"
import { isValidChord } from "@/helpers/isValidChord"
import { MixinHookablePlugableBase, Plugable } from "@/mixins"
import type { DeepPartialObj, Optional, PluginsInfo, RawShortcut, ShortcutHooks, ShortcutOptions } from "@/types"

import type { Context } from "."


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
			hookable: { keys: ["allows", "set"]},
			plugableBase: { plugins, info, key: undefined },
		})
		if (opts.enabled) this.enabled = opts.enabled
		if (opts.sorter) this.sorter = opts.sorter
		if (this.allows("command", opts.command).unwrap()) this.set("command", opts.command)
		if (opts.condition && this.allows("condition", opts.condition).unwrap()) this.set("condition", opts.condition)
		if (this.allows("keys", keys).unwrap()) this.set("keys", keys)
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
	equalsKeys(keys: Key[][], length?: number): boolean {
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
			(length === undefined && base.length !== keys.length) ||
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
	/**
	 * A wrapper around static {@link Shortcut.containsKey} for the instance.
	 */
	containsKey(key: Key): boolean {
		return Shortcut.containsKey(key, this.keys)
	}
	/**
	 * Returns whether a shortcut's keys contains the given key.
	 */
	static containsKey(key: Key, keys: Key[][]): boolean {
		return keys
			.flat()
			.find(existing => existing === key) !== undefined
	}
	get opts(): ShortcutOptions {
		return { command: this.command, sorter: this.sorter, enabled: this.enabled, condition: this.condition, stringifier: this.stringifier }
	}
	protected override _set<TKey extends keyof ShortcutHooks>(
		key: TKey,
		value: ShortcutHooks[TKey]["value"],
	): void {
		switch (key) {
			case "keys":
				this.keys = (value as ShortcutHooks["keys"]["value"]).map(chord => this.sorter.sort([...chord]))
				break
			default: {
				(this as any)[key] = value
			}
		}
	}
	protected override _allows<TKey extends keyof ShortcutHooks>(key: TKey, value: ShortcutHooks[TKey]["value"]): Result<true, ShortcutHooks[TKey]["error"]> {
		switch (key) {
			case "keys": return this._hookAllowsKeys(value as ShortcutHooks["keys"]["value"])
			default: return Ok(true)
		}
	}
	protected _hookAllowsKeys(value: ShortcutHooks["keys"]["value"]): Result<true, ShortcutHooks["keys"]["error"]> {
		const val = []
		for (let i = 0; i < value.length; i++) {
			const chord = value[i]
			const res = isValidChord({ keys: value }, chord, i, this.stringifier)
			if (res.isError) return res
			val.push(this.sorter.sort([...chord]))
		}
		const res = containsPossibleToggleChords(value, this.stringifier)
		if (res.isError) return res
		return Ok(true)
	}
	triggerableBy(chain: Key[][], context: Context): boolean {
		return this.enabled &&
			this.command !== undefined &&
			this.equalsKeys(chain) &&
			this.condition.eval(context) &&
			(this.command === undefined || this.command.condition.eval(context))
	}
	static create<T extends Shortcut = Shortcut>(entry: RawShortcut, plugins: Plugin[] = []): T {
		return Plugable.create<Shortcut, "keys">(Shortcut, plugins, "keys", entry) as T
	}
}

// export interface Shortcut<TPlugins, TInfo> extends HookableBase<ShortcutHooks>, PlugableBase<TPlugins, TInfo> { }
// mixin(Shortcut, [Hookable, HookableBase, Plugable, PlugableBase])
