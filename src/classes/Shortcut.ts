import { Ok, Result } from "@alanscodelog/utils"

import type { Command } from "./Command"
import { Condition } from "./Condition"
import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"

import { HookableBase } from "@/bases"
import { containsPossibleToggleChords } from "@/helpers/containsPossibleToggleChords"
import { isValidChord } from "@/helpers/isValidChord"
import type { Optional, RawShortcut, ShortcutHooks, ShortcutOptions } from "@/types"

import type { Context } from "."


export class Shortcut extends HookableBase<ShortcutHooks> implements ShortcutOptions {
	/** The chain of key chords that make up the shortcut. Note that this is NOT a unique identifier for shortcuts and cannot be used to compare them if you are making use of the when/context/active options. */
	chain: Key[][] = []
	/** @inheritdoc */
	stringifier: ShortcutOptions["stringifier"] = defaultStringifier
	/** @inheritdoc */
	sorter: ShortcutOptions["sorter"] = defaultSorter
	/** @inheritdoc */
	command?: Command
	/** @inheritdoc */
	condition: Condition = new Condition("")
	/** @inheritdoc */
	enabled: boolean = true
	/** It is sometimes useful for some shortcuts to not equal eachother temporarily. For example, inside allow hooks when swapping, this makes it easier to return the correct answer without making major modifications to the instances. */
	forceUnequal: boolean = false

	/**
	 * # Shortcut
	 *
	 * Create a shortcut.
	 *
	 * @param keys A list of {@link Key | keys}.
	 * @param opts Set {@link ShortcutOptions}
	 */
	constructor(
		keys: Key[][],
		opts?: RawShortcut["opts"],
	)
	constructor(
		keys: Key[][],
		opts: Optional<RawShortcut["opts"]> | {},
	)
	constructor(
		keys: Key[][],
		opts: RawShortcut["opts"] = {}
	) {
		super()
		if (opts.stringifier) this.stringifier = opts.stringifier
		if (opts.enabled) this.enabled = opts.enabled
		if (opts.sorter) this.sorter = opts.sorter
		if (this.allows("command", opts.command).unwrap()) this.set("command", opts.command)
		if (opts.condition && this.allows("condition", opts.condition).unwrap()) this.set("condition", opts.condition)
		if (this.allows("chain", keys).unwrap()) this.set("chain", keys)
	}
	/**
	 * Returns whether the shortcut passed is equal to this one.
	 *
	 * To return true, their keys and command must be equal, their condition must be equal according to this shortcut's condition.
	 */
	equals(shortcut: Shortcut): shortcut is Shortcut {
		if (this.forceUnequal) return false
		return (
			this === shortcut
			||
			(
				this.equalsKeys(shortcut.chain)
				&& this.condition.equals(shortcut.condition)
				&& (this.command?.equals(shortcut.command) || shortcut.command?.equals(this.command) || this.command === shortcut.command)
			)
		)
	}
	/**
	 * A wrapper around static {@link Shortcut.equalsKeys} for the instance.
	 */
	equalsKeys(keys: Key[][], length?: number): boolean {
		return Shortcut.equalsKeys(this.chain, keys, length)
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
		return Shortcut.containsKey(key, this.chain)
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
			case "chain":
				this.chain = (value as ShortcutHooks["chain"]["value"]).map(chord => this.sorter.sort([...chord]))
				break
			default: {
				(this as any)[key] = value
			}
		}
	}
	protected override _allows<TKey extends keyof ShortcutHooks>(key: TKey, value: ShortcutHooks[TKey]["value"]): Result<true, ShortcutHooks[TKey]["error"]> {
		switch (key) {
			case "chain": return this._hookAllowsKeys(value as ShortcutHooks["chain"]["value"])
			default: return Ok(true)
		}
	}
	protected _hookAllowsKeys(value: ShortcutHooks["chain"]["value"]): Result<true, ShortcutHooks["chain"]["error"]> {
		const val = []
		for (let i = 0; i < value.length; i++) {
			const chord = value[i]
			const res = isValidChord({ chain: value }, chord, i, this.stringifier)
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
	static create<T extends Shortcut = Shortcut>(entry: RawShortcut): T {
		return HookableBase.createAny<Shortcut, "chain">(Shortcut, "chain", entry) as T
	}
}
