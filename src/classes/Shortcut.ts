import { Ok, pick, type Result, setReadOnly } from "@alanscodelog/utils"

import type { Command } from "./Command.js"
import { Condition } from "./Condition.js"
import type { Context } from "./Context.js"
import type { Key } from "./Key.js"
import { defaultSorter } from "./KeysSorter.js"

import { HookableBase } from "../bases/HookableBase.js"
import { chainContainsKey } from "../helpers/chainContainsKey.js"
import { chainContainsSubset } from "../helpers/chainContainsSubset.js"
import { createInstance } from "../helpers/createInstance.js"
import { equalsKeys } from "../helpers/equalsKeys.js"
import { isValidChain } from "../helpers/isValidChain.js"
import { mapKeys } from "../helpers/mapKeys.js"
import type { RawShortcut, ShortcutHooks, ShortcutOptions } from "../types/shortcut.js"


export class Shortcut extends HookableBase<ShortcutHooks> implements ShortcutOptions {
	/**
	 * The chain of key chords that make up the shortcut. Note that this is NOT a unique identifier for shortcuts and cannot be used to compare them if you are making use of the when/context/active options.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly chain: Key[][] = []

	/** @inheritdoc */
	sorter: ShortcutOptions["sorter"] = defaultSorter

	/** @inheritdoc */
	readonly command?: Command

	/** @inheritdoc */
	readonly condition: Condition = new Condition("")

	/** @inheritdoc */
	readonly enabled: boolean = true

	/**
	 * It is sometimes useful for some shortcuts to not equal or conflict with eachother temporarily. For example, inside allow hooks when swapping, this makes it easier to return the correct answer without making major modifications to the instances.
	 *
	 * Only methods that compare shortcut instances are affected.
	 */

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
		if (opts.enabled) this.enabled = opts.enabled
		if (opts.sorter) this.sorter = opts.sorter
		if (opts.command) this.command = opts.command
		if (opts.condition) this.condition = opts.condition
		this.safeSet("chain", chain).unwrap()
	}

	/**
	 * Returns whether the shortcut passed is equal to this one.
	 *
	 * To return true, their keys and command must be equal (unless ignoreCommand is passed), their condition must be equal according to this shortcut's condition.
	 */
	equals(shortcut: Shortcut, { ignoreCommand = false }: { ignoreCommand?: boolean } = {}): shortcut is Shortcut {
		if (this.forceUnequal) return false
		return (
			this === shortcut
			||
			(
				this.equalsKeys(shortcut.chain, undefined, { allowVariants: true })
				&& this.condition.equals(shortcut.condition)
				&& (ignoreCommand || this.command?.equals(shortcut.command) || shortcut.command?.equals(this.command) || this.command === shortcut.command)
			)
		)
	}

	/**
	 * A shortcut conflicts with another if their conditions are equal (according to this shortcut's condition) and their chains are in conflict.
	 *
	 * Chains can be in conflict in any of the following situations:
	 *
	 * - The shortcuts are the same instance (unless ignoreSelf is passed).
	 * - All the keys are the same.
	 * - They share starting chords and the last shared chord conflicts. (e.g. [[A], [B]] and [[A]]), i.e. they have a chain conflict.
	 * - The last chords shares all modifiers and one of the chords is all modifiers. (e.g. [[A], [Ctrl]] and [[A], [Ctrl, A]]), i.e. they have a modifier conflict.
	 *
	 * Some of these can be ignored with the experimental ignore* options.
	 *
	 * A context can be passed for a more accurate test, otherwise depending on what type of conditions you use (see {@link Condition["equals"]}) you cannot truly tell if shortcuts with complex conditions will conflict. Even if a context is passed, both shortcuts should match / eval to true in the context. See the option itself for more details.
	 */
	conflictsWith(shortcut: Shortcut, {
		ignoreSelf = false,
		context,
		ignoreModifierConflicts,
		ignoreChainConflicts,
	}: {
		ignoreSelf?: boolean
		/**
		 * @experimental
		 * If a context is passed, given all other conditions are equal, the shortcuts can only be in conflict if they both match the context. Note this means if neither match the context they are not considered to conflict (even though they might in another context). This is meant to be used when they both match the context, but some behavior had to be chosen for when they don't.
		 */
		context?: Context
		/**
		 * @experimental
		 * If this is true, modifier conflicts (e.g. `Ctrl` conflicts with `Ctrl+A`) will be ignored. You will need to figure out how to handle them manually.
		 */
		ignoreModifierConflicts?: boolean
		/**
		 * @experimental
		 * If this is true, partial chain conflicts (e.g. `Space` conflicts with `Space+A`) will be ignored. You will need to figure out how to handle them manually.
		 */
		ignoreChainConflicts?: boolean

	} = {}): boolean {
		if (this.forceUnequal) return false
		if (!ignoreSelf && this === shortcut) return true
		if (context) {
			const thisCondition = this.condition.eval(context)
			const otherCondition = shortcut.condition.eval(context)
			if (thisCondition !== otherCondition) return false
			if (!thisCondition) return false
		} else {
			if (!this.condition.equals(shortcut.condition)) return false
		}
		const lastSharedIndex = Math.max(0, Math.min(this.chain.length - 1, shortcut.chain.length - 1))
		const lastIsModOnly = this.chain[lastSharedIndex].find(key => !key.is.modifier) === undefined
		const otherLastIsModOnly = shortcut.chain[lastSharedIndex].find(key => !key.is.modifier) === undefined
		const sharedModifiers = this.chain[lastSharedIndex].filter(key => key.is.modifier &&
				shortcut.chain[lastSharedIndex]
					.some(_key => _key.equals(key, { allowVariants: true }))
		)


		const lastSharedChordConflicts = (lastIsModOnly || otherLastIsModOnly) && sharedModifiers.length > 0
		const conflictsWithChain = this.equalsKeys(shortcut.chain, lastSharedIndex + 1, { allowVariants: true })
		
		return (
			(!ignoreChainConflicts && conflictsWithChain) ||
			(!ignoreModifierConflicts && lastSharedChordConflicts)
		)
	}
	
	/**
	 * A wrapper around {@link equalsKeys} for the instance.
	 */
	equalsKeys(keys: readonly Key[][], length?: number, opts: Parameters<Key["equals"]>[1] = {}): boolean {
		return equalsKeys(this.chain, keys, length, opts)
	}

	/**
	 * A wrapper around {@link chordContainsKey} for the entire shortcut chain.
	 */
	containsKey(key: Key, opts: Parameters<typeof chainContainsKey>[2] = {}): boolean {
		return chainContainsKey(this.chain.flat(), key, opts)
	}

	/**
	 * A wrapper around {@link chainContainsSubset} for the instance.
	 */
	containsSubset(
		chain: readonly Key[][],
		opts: Parameters<typeof chainContainsSubset>[2] = {}
	): boolean {
		return chainContainsSubset(chain, this.chain, opts)
	}

	get opts(): ShortcutOptions {
		return pick(this, ["command", "sorter", "enabled", "condition", "stringifier"])
	}

	canExecuteIn(context: Context, {
		allowEmptyCommand = false,
	}: {
		allowEmptyCommand?: boolean
	} = {}): boolean {
		return this.enabled && (
			(allowEmptyCommand && (this.command?.execute === undefined)) ||
				this.command?.condition.eval(context) === true
		) && this.condition.eval(context)
	}

	protected override _set<TKey extends keyof ShortcutHooks>(
		key: TKey,
		value: ShortcutHooks[TKey]["value"],
	): void {
		switch (key) {
			case "chain":
				setReadOnly(this, "chain", (value as Shortcut["chain"]).map(chord => this.sorter.sort([...chord])))
				break
			default: {
				(this as any)[key] = value
			}
		}
	}

	protected override _allows<TKey extends keyof ShortcutHooks>(key: TKey, value: ShortcutHooks[TKey]["value"]): Result<true, ShortcutHooks[TKey]["error"]> {
		switch (key) {
			case "chain": return this._hookAllowsKeys(value as Key[][])
			default: return Ok(true)
		}
	}

	protected _hookAllowsKeys(value: ShortcutHooks["chain"]["value"]): Result<true, ShortcutHooks["chain"]["error"]> {
		return isValidChain(this, value, this.stringifier, this.sorter)
	}

	triggerableBy(chain: Key[][], context: Context): boolean {
		return this.canExecuteIn(context, { allowEmptyCommand: true }) &&
			this.equalsKeys(chain, undefined, { allowVariants: true })
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

	toString(): string {
		return this.stringifier.stringify(this)
	}
}
