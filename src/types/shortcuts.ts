import type { Command } from "./commands.js"
import type { Condition } from "./condition.js"
import type { PickManager } from "./general.js"
import type { ChainErrors, ERROR } from "./index.js"
import type { Key } from "./keys.js"
import type { Manager } from "./manager.js"


/**
 * Same as {@link Shortcut} except you're allowed to exclude all properties except the chain.
 */
export type RawShortcut = {
	chain: (string | Key)[][]
	command?: (string | Command)
} & Omit<Partial<Shortcut>, "chain" | "command">


export interface Shortcut {
	type: "shortcut"
	/**
	 * The {@link Command} to associate with the shortcut.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly command?: Command["name"]
	/**
	 * The {@link Condition} a shortcut is allowed to be triggered on. If both the command and the shortcut have a condition, both must be met.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly condition: Condition
	/**
	 * Whether the shortcut is enabled. Defaults to true.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly enabled: boolean
	/**
	 * The chain of key chords that make up the shortcut. Note that this is NOT a unique identifier for shortcuts and cannot be used to compare them if you are making use of the when/context/active options.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly chain: (Key["id"])[][]
	/**
	 * It is sometimes useful for some shortcuts to not equal or conflict with eachother temporarily.
	 *
	 * Only methods that compare shortcut instances are affected.
	 *
	 * While the property is managed by the manager, it can be safely set then unset if not modifying anything.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly forceUnequal: boolean
}

export type Shortcuts <
	TEntries extends
		Shortcut[] =
		Shortcut[],
> = {
	/**
	 * The shortcut entries.
	 *
	 * To add/remove entries you should {@link addShortcut}/{@link removeShortcut} or {@link setShortcutsProp} with the synthetic `entries@add/remove` properties.
	 *
	 * The synthetic properties can be hooked into with {@link Manager.hooks}.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly entries: TEntries
	/**
	 * For {@link doesShortcutConflictWith}.
	 *
	 * @experimental
	 * If this is true, the manager's context will be used to check conditions agains.
	 *
	 * Given all other conditions are equal, the shortcuts can only be in conflict if they both match the context. Note this means if neither match the context they are not considered to conflict (even though they might in another context). This is meant to be used when they both match the context, but some behavior had to be chosen for when they don't.
	 */
	useContextInConflictCheck?: boolean
	/**
	 * For {@link doesShortcutConflictWith}.
	 *
	 * @experimental
	 * If this is true, modifier conflicts (e.g. `Ctrl` conflicts with `Ctrl+A`) will be ignored. You will need to figure out how to handle them manually.
	 */
	ignoreModifierConflicts?: boolean
	/**
	 * For {@link doesShortcutConflictWith}.
	 *
	 * @experimental
	 * If this is true, partial chain conflicts (e.g. `Space` conflicts with `Space+A`) will be ignored. You will need to figure out how to handle them manually.
	 */
	ignoreChainConflicts?: boolean

}

export type RawShortcuts = Pick<Shortcuts, "entries"> & Partial<Shortcuts>

export type TriggerableShortcut = Shortcut & {
	command: NonNullable<Command["name"]>
}


type GetShortcutHooks<T extends keyof ShortcutSetEntries | keyof ShortcutsSetEntries> =
T extends CanHookShortcutProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetShortcutProp" | "onSetShortcutProp">>
: T extends OnHookShortcutProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "onSetShortcutProp">>
: T extends CanHookShortcutsProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetShortcutsProp" | "onSetShortcutsProp">>
: Partial<Pick<NonNullable<Manager["hooks"]>, "onSetShortcutsProp">>


type BaseShortcutManager = Record<any, any>

export type ShortcutSetEntries = {
	chain: {
		val: Shortcut["chain"]
		manager: BaseShortcutManager
		& PickManager<"options", "stringifier" | "sorter">
		& Pick<Manager, "shortcuts" | "commands" | "keys">
		hooks: GetShortcutHooks<"chain">
		error: ChainErrors | ERROR.DUPLICATE_KEY | ERROR.DUPLICATE_SHORTCUT
	}
	command: {
		val: Shortcut["command"]
		manager: BaseShortcutManager
		& PickManager<"options", "stringifier" >
		& Pick<Manager, "commands" >
		& Partial<Pick<Manager, "keys">>

		hooks: GetShortcutHooks<"command">
		error: ERROR.UNKNOWN_COMMAND
	}
	condition: {
		val: Shortcut["condition"]
		manager: never
		hooks: GetShortcutHooks<"condition">
		error: never
	}
	enabled: {
		val: Shortcut["enabled"]
		manager: never
		hooks: GetShortcutHooks<"enabled">
		error: never
	}
	forceUnequal: {
		val: Shortcut["forceUnequal"]
		manager: never
		hooks: GetShortcutHooks<"forceUnequal">
		error: never
	}
}

export type OnHookShortcutProps =
	| "chain"
	| "command"
	| "condition"
	| "enabled"
	| "forceUnequal"

export type CanHookShortcutProps = Exclude<OnHookShortcutProps, "forceUnequal">


export type SyntheticOnHookShortcutsProps = "entries@add" | "entries@remove"
export type CanHookShortcutsProps = SyntheticOnHookShortcutsProps
export type OnHookShortcutsProps = SyntheticOnHookShortcutsProps

type BaseShortcutsManager =
	& Pick<Manager, "keys" | "commands" | "shortcuts">
	& PickManager<"options", | "evaluateCondition" | "conditionEquals" | "stringifier">
	& Record<any, any>

export type ShortcutsSetEntries = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"entries@add": {
		val: Shortcut
		hooks: GetShortcutHooks<`entries@add`>
		manager: BaseShortcutsManager
		& PickManager<"options", "sorter">
	
		error:
		| ERROR.DUPLICATE_SHORTCUT
		| ERROR.UNKNOWN_COMMAND
		| ChainErrors
	}
	// eslint-disable-next-line @typescript-eslint/naming-convention
	"entries@remove": {
		val: Shortcut
		hooks: GetShortcutHooks<`entries@remove`>
		manager: BaseShortcutsManager
		error: ERROR.MISSING
	}
}
