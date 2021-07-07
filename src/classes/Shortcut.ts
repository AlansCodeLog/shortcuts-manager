import { mixin } from "@utils/utils"

import type { Command } from "./Command"
import type { Key } from "./Key"
import { defaultSorter } from "./KeysSorter"
import type { Plugin } from "./Plugin"

import { KnownError } from "@/helpers"
import { throwIfImpossibleToggles } from "@/helpers/throwIfImpossibleToggles"
import { throwIfInvalidChord } from "@/helpers/throwIfInvalidChord"
import { Hookable, HookableBase, Plugable } from "@/mixins"
import type { DeepPartialObj, Optional, PluginsInfo, RawShortcut, ShortcutHooks, ShortcutOptions } from "@/types"
import { HOOKABLE_CONSTRUCTOR_KEY, PLUGABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


/** @internal */
const defaultOpts: Omit<ShortcutOptions, "command"> = {
	sorter: defaultSorter,
	active: true,
}

function init(self: any, defaults: Omit<ShortcutOptions, "command">, opts: RawShortcut["opts"] = {}): asserts self is ShortcutOptions {
	self = self ?? {}
	self.set("command", opts.command)
	self.active = opts.active ?? defaults.active
	self.sorter = opts.sorter ?? defaults.sorter
}

/**
 * Creates a shortcut.
 */

export class Shortcut<
	// See [[Plugable]]
	TPlugins extends
		Plugin<undefined>[] =
		Plugin<undefined>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
> implements ShortcutOptions {
	/** The keys that make up the shortcut. Note that this is NOT a unique identifier for shortcuts and cannot be used to compare them if you are making use of the when/context/active options. */
	keys!: Key[][]
	sorter!: ShortcutOptions["sorter"]
	/** The command to associated with the shortcut. */
	command?: Command
	/** The condition when the shortcut will execute. Must be a sub-condition of the command's condition or false, in which case the command's condition will be used to check whether to trigger it. */
	/** Whether the shortcut is active. */
	active!: boolean
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
	/**
	 * @param keys See [[Shortcut.id]]
	 * @param opts Set options for the shortcut.
	 * @param info See [[Shortcut.info]]
	 * @param plugins  See [[Shortcut.plugins]]
	 *
	 * Note: You cannot add more plugins or change the structure of info after creating an instance.
	 */
	constructor(
		keys: Key[][],
		opts: RawShortcut["opts"] = {},
		info?: DeepPartialObj<TInfo>,
		plugins?: TPlugins,
	) {
		this[HOOKABLE_CONSTRUCTOR_KEY](["allows", "set"])
		this.addHook("allows", this.#hooks)
		this[PLUGABLE_CONSTRUCTOR_KEY](plugins, info, undefined)
		init(this, defaultOpts, opts)
		this.set("keys", keys)
	}
	equals(shortcut: Shortcut): shortcut is Shortcut<TPlugins, TInfo> {
		return (
			this === shortcut
			||
			(
				this.keys
					// Since they're pre-sorted this should be quite fast
					.find((thisChord, c) => {
						const otherChord = shortcut.keys[c]
						if (otherChord.length !== thisChord.length) return true
						return thisChord.find((thisKey, i) => {
							const shortcutKey = otherChord[i]
							if (!shortcutKey) return true
							return !thisKey.equals(shortcutKey)
						}) !== undefined
					}) === undefined
				&& this.equalsInfo(shortcut)
			)
		)
	}
	get opts(): ShortcutOptions {
		return { command: this.command, sorter: this.sorter, active: this.active }
	}
	#hooks<T extends keyof ShortcutHooks>(key: T, value: ShortcutHooks[T]["value"]): true | ShortcutHooks[T]["error"] {
		switch (key) {
			case "keys": return this.#hookAllowsKeys(value as ShortcutHooks["keys"]["value"])
			default: return true
		}
	}
	#hookAllowsKeys(value: ShortcutHooks["keys"]["value"]): true | ShortcutHooks["keys"]["error"] {
		try {
			const keys = value
			this.keys = keys.map((chord, i) => {
				throwIfInvalidChord({ keys }, chord, i)
				return [...chord].sort(this.sorter.sort)
			})
			throwIfImpossibleToggles(this.keys)
		} catch (e: unknown) {
			if (e instanceof KnownError) return e
			throw e
		}
		return true
	}
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface Shortcut<TPlugins, TInfo> extends HookableBase<ShortcutHooks>, Plugable<TPlugins, TInfo> { }
mixin(Shortcut, [Hookable, HookableBase, Plugable])
