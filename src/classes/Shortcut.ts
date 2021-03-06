import { Ok, Result, setReadOnly } from "@alanscodelog/utils"

import type { Command } from "./Command"
import { Condition } from "./Condition"
import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"

import { HookableBase } from "@/bases"
import { equalsKeys, mapKeys } from "@/helpers"
import { chainContainsKey } from "@/helpers/chainContainsKey"
import { createInstance } from "@/helpers/createInstance"
import { isValidChain } from "@/helpers/isValidChain"
import type { RawShortcut, ShortcutHooks, ShortcutOptions } from "@/types"

import type { Context } from "."


export class Shortcut extends HookableBase<ShortcutHooks> implements ShortcutOptions {
	/**
	 * The chain of key chords that make up the shortcut. Note that this is NOT a unique identifier for shortcuts and cannot be used to compare them if you are making use of the when/context/active options.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly chain: Key[][] = []
	/** @inheritdoc */
	stringifier: ShortcutOptions["stringifier"] = defaultStringifier
	/** @inheritdoc */
	sorter: ShortcutOptions["sorter"] = defaultSorter
	/** @inheritdoc */
	readonly command?: Command
	/** @inheritdoc */
	readonly condition: Condition = new Condition("")
	/** @inheritdoc */
	readonly enabled: boolean = true
	/** It is sometimes useful for some shortcuts to not equal eachother temporarily. For example, inside allow hooks when swapping, this makes it easier to return the correct answer without making major modifications to the instances. */
	forceUnequal: boolean = false
	/**
	 * # Shortcut
	 *
	 * Create a shortcut.
	 *
	 * @param chain A list of {@link Key | keys}.
	 * @param opts Set {@link ShortcutOptions}
	 */
	constructor(
		chain: Key[][],
		opts: RawShortcut["opts"] = {}
	) {
		super()
		if (opts.stringifier) this.stringifier = opts.stringifier
		if (opts.enabled) this.enabled = opts.enabled
		if (opts.sorter) this.sorter = opts.sorter
		if (opts.command) this.command = opts.command
		if (opts.condition) this.condition = opts.condition
		this.safeSet("chain", chain).unwrap()
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
	 * A wrapper around {@link equalsKeys} for the instance.
	 */
	equalsKeys(keys: Key[][], length?: number): boolean {
		return equalsKeys(this.chain, keys, length)
	}
	/**
	 * A wrapper around {@link chainContainsKey} for the instance.
	 */
	containsKey(key: Key): boolean {
		return chainContainsKey(this.chain, key)
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
				setReadOnly(this, "chain", (value as ShortcutHooks["chain"]["value"]).map(chord => this.sorter.sort([...chord])))
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
		return isValidChain(this, value, this.stringifier, this.sorter)
	}
	triggerableBy(chain: Key[][], context: Context): boolean {
		return this.enabled &&
			this.command !== undefined &&
			this.equalsKeys(chain) &&
			this.condition.eval(context) &&
			(this.command === undefined || this.command.condition.eval(context))
	}
	/** Create an instance from a raw entry. */
	static create<T extends Shortcut = Shortcut>(entry: RawShortcut): T {
		return createInstance<Shortcut, "chain">(Shortcut, "chain", entry) as T
	}
	export(): {
		chain: string[][]
		command?: ReturnType<Command["export"]>["name"]
		condition: ReturnType<Condition["export"]>
		enabled: boolean
	} {
		return {
			chain: mapKeys(this.chain) as string[][],
			command: this.command?.export().name,
			condition: this.condition.export(),
			enabled: this.enabled,
		}
	}
}
