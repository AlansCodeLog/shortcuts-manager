import type { DeepPartial, MakeRequired, Mutable } from "@alanscodelog/utils"

import type { StringifierOpts } from "./base.js"
import type { ERROR, KEY_SORT_POS } from "./enums.js"
import type { BaseHookType, CollectionHookType } from "./hooks.js"

import type { Key, Keys } from "../classes/index.js"
import type { KnownError } from "../helpers/index.js"


/**
 * Same as {@link KeyOptions} except you're allowed to just pass true to toggle.
 */
export type RawKey<T extends string = string> = {
	id: T
	opts?: Mutable<DeepPartial<Omit<KeyOptions, "is">>>
	& Partial<StringifierOpts>
	& {
		is?: {
			toggle?: true | Mutable<KeyOptions["is"]["toggle"]>
			modifier?: true | Mutable<KeyOptions["is"]["modifier"]>
		}
	}
}

export type ExportedKey =
	Pick<Key, "id">
	& Omit<KeyOptions, "stringifier">

/**
 * The toggle version of a key.
 */
export type ToggleKey<T extends Key = Key> = T & {
	on: never
	off: never
	root: T
}

export type ToggleRootKey<
	TId extends
		string =
		string>
= MakeRequired<Key<TId>, "on" | "off">

export type AnyKey = Key | ToggleKey<any>

export type KeyOptions = StringifierOpts & {
	/**
	 * Whether the key is enabled.
	 *
	 * If it's disabled, `.allows("pressed", ...)` will return an error.
	 *
	 * Useful for preventing the Meta/Super key from being pressed, but still allowing the manager to manage it's position so it's still visible.
	 */
	enabled: boolean
	/**
	 * The label to use for the key when stringifying it. If no label is specified, it's left blank.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly label: string
	/**
	 * Variants are a list of fallback codes that will also trigger a key.
	 *
	 * For example, without variants, there's no way to have native modifier keys or have a shortcut like `[[Ctrl, A]]` where Ctrl can be either of the right/lefts Ctrl keys. One could create two shortcuts for both keys, but only one key would be considered triggered at a time on the layout.
	 *
	 * Variants can solve this by allowing us to create a key that's only labeled as `Ctrl`. The `id` can be set to an invalid key code (we still need an id for the {@link Keys} class), preferably one that indicates what's happening (e.g. `VirtualCtrl`). The variants can be set to `["ControlLeft", "ControlRight", "Control"]`. Now you can have shortcuts like `[[VirtualCtrl, A]]` and either control key will trigger them.
	 *
	 * ```ts
	 * const virtualCtrl = new Key("VirtualCtrl" {label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"] })
	 * ```
	 *
	 * If you still need the keys to be labeled or styled different, you can register multiple keys with different invalid ids but the same variants.
	 *
	 * ```ts
	 * // different labels for the layout
	 * const virtualCtrl = new Key("VirtualCtrl" {label: "Ctrl Left", variants: ["ControlLeft", "ControlRight", "Control"] })
	 * const virtualCtrl2 = new Key("VirtualCtrl2" {label: "Ctrl Right", variants: ["ControlLeft", "ControlRight", "Control"] })
	 *
	 * // same labels, different sizes
	 * const virtualCtrl = new Key("VirtualCtrl"
	 * 	{ label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], layout: {width: 1.5} },
	 * )
	 * const virtualCtrl2 = new Key("VirtualCtrl2"
	 * 	{ label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], layout: {width: 2}},
	 * )
	 *
	 * ```
	 *
	 * They can also be use to treat any set of keys as the exact same keys. This can be useful for allowing users to remap keys only within the application.
	 *
	 * For example, to use CapsLock as an extra Control key (e.g. `id: Ctrl, variants: ["ControlLeft", "ControlRight", "Control", "Capslock"]`). You could even "remap" it to multiple modifiers, just add "Capslock" to the variants list of those modifiers (e.g. Ctrl, Alt, Shift). This would cause all those keys to be considered pressed when Capslock is pressed.
	 *
	 * Also unlike `id`, which is readonly, variants are not, they can be added and removed as needed.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly variants: readonly string [] | string[] | undefined
	/**
	 * Whether the key should be rendered. See {@link Manager.layout}.
	 *
	 * Toggle on/off keys are automatically created with this set to false.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly render: boolean
	/**
	 * The width of the key. See {@link Manager.layout}.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly width: number
	/**
	 * The height of the key. See {@link Manager.layout}.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly height: number
	/**
	 * The x position of the key. See {@link Manager.layout}.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly x: number
	/**
	 * The y position of the key. See {@link Manager.layout}.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly y: number
	/** A list of css classes the key should be rendered with. */
	classes: readonly string [] | string[]
	readonly is: {
		/**
		 * Whether the key is a modifier. A modifier can be either `"native"` (event.getModifierState will always be used on all events to get it's true state) or `"emulated"`.
		 *
		 * For both, this determines in the manager when a chord is considered to have been pressed (when it contains a non-modifer key). See {@link Manager}.
		 *
		 * ### Notes
		 * - event.getModifierState does not check the validity of the key code, and will just return false for keys that don't exist.
		 * - You will probably need to specify a {@link KeysOptions.variants variant} because, for example, to get the state of the Control keys, you need to pass `Control` not `ControlLeft/Right`
		 * - If the modifier is native and the state is seen to change without a key press (i.e. when the element is not in focus), a key release is emulated.
		 */
		readonly modifier: false | "emulated" | "native"
		/**
		 * Whether it's a toggle key. A toggle can be either `"native"` (event.getModifierState will always be used on all events to get it's true state) or `"emulated"` (state starts off false and is toggle with every keydown registered).
		 *
		 * Setting `toggle: true` is like passing `toggle:"native"`:
		 *
		 * Toggle keys can be bound to shortcuts by their state. For example:
		 * ```ts
		 * let on = new Shortcut([keys.ScrollLock.on], commands.toggle_on_x)
		 * let off = new Shortcut([keys.ScrollLock.off], commands.toggle_off_x)
		 * ```
		 *
		 * The way this works is the class creates two new keys, with the corresponding suffix (`On`/`Off`) added to the id, then takes care of correctly assigning things to create the relevant properties (`"on", "off"` on the base key and `"root"` on the toggles). It also does a `set` (if allowed) on the labels of the keys to set them to `KeyName (On/Off)` and adds a hook to the root key to update the labels every time the root label is changed.
		 *
		 * These new instances don't do much of anything. Their main purpose is prevent the references to the instance from equaling each other, allowing their states to be set separately, and allowing the on/off keys to provide proper access to the base key and vice versa (so from the layout we don't have to handle 3 different keys).
		 *
		 * So given some key:
		 * ```ts
		 * let key = new Key("a", {toggle: true})
		 *
		 * key === key //true
		 * key === key.on // false
		 * key.on === key.off // false
		 *
		 * key === key.on.root //true
		 *
		 * key.on.on // undefined
		 *
		 * key.id // "a"
		 * key.on.id // aOn
		 * key.off.id // aOff
		 * ```
		 *
		 *
		 * ### State
		 *
		 * With either type of toggle key, we cannot know the initial state without a keypress. The {@link Manager} sets it the first time a key matches, but for native keys you can do this even earlier. **Note that event.getModifierState does not check the validity of the key code, and will just return false for keys that don't exist.**
		 *
		 * When the {@link Manager} handles a key's pressed state, for toggles, the root key indicates whether the user is actually pressing the key or not just like any other key, and the toggle instances indicate the state.
		 *
		 * Note that state is changed for the keys as follows:
		 *
		 * ```ts
		 * // user presses and holds key
		 * key.pressed = true
		 * key.on.pressed = true
		 * key.off.pressed = false
		 *
		 * // user releases key
		 * key.pressed = false
		 * key.on.pressed = true
		 * key.off.pressed = false
		 *
		 * // user presses and holds key again
		 * key.pressed = true
		 * key.on.pressed = false
		 * key.off.pressed = true
		 *
		 * // user releases key
		 * key.pressed = false
		 * key.on.pressed = false
		 * key.off.pressed = true
		 *
		 * ```
		 *
		 * ### Other
		 *
		 * Sometimes you might want to compare only the roots of two toggles keys (that might be the root, on, or off). You can do this like so:
		 *
		 * ```ts
		 * let root1 = key1.root ?? key1
		 * let root2 = key2.root ?? key2
		 * root1 === root2 // or root1.equals(root2)
		 * ```
		 *
		 * Sometimes you might be passed a key and you might want to check which toggle state it is. There are helpers provided for this ({@link isToggleKey}, {@link isToggleOnKey}, {@link isToggleOffKey}, {@link isToggleRootKey}), or you can do:
		 * ```ts
		 * if (key.is.toggle) { // check it's a toggle key first
		 * 	if (key.root === undefined) //it's the root key
		 * 	else if (key.root.on === key) //it's the on key
		 * 	else if (key.root.off === key) // it's the off key
		 * } else {} // it's not a toggle key
		 * ```
		 * ### Notes
		 * - If the toggle is native and the state is seen to change without a key press (i.e. when the element is not in focus), a key release is **NOT** emulated.
		 */
		readonly toggle: "native" | "emulated" | false
	}
	/** See {@link Manager.checkStateOnAllEvents}. Only has an effect if the key is a modifier or toggle key. */
	checkStateOnAllEvents: boolean
}

export type KeysOptions = StringifierOpts & {
	/**
	 * Whether the instance automatically calculates the layout size ({@link Keys.layout}) from it's keys and adjusts to size/position changes using {@link Keys.recalculateLayout}.
	 *
	 * Setting this to true will trigger a recalculation.
	 */
	manageLayout: boolean
}

export type KeysSorterOptions = {
	/**
	 * Specify how keys are sorted depending on what type of keys they are (see {@link KeySortPos}) and then alphabetically.
	 */
	order: typeof KEY_SORT_POS | Record<keyof typeof KEY_SORT_POS, number>
}


export type KeyHooks = {
	"label": BaseHookType<Key, string, never>
	"variants": BaseHookType<Key, string[], ERROR.INVALID_VARIANT>
	"x": BaseHookType<Key, KeyOptions["x"], never>
	"y": BaseHookType<Key, KeyOptions["y"], never>
	"width": BaseHookType<Key, KeyOptions["width"], never>
	"height": BaseHookType<Key, KeyOptions["height"], never>
	// cannot be allows hooked
	"pressed": BaseHookType<Key, boolean, never, boolean, true>
}

export type KeysCollectionHooks = CollectionHookType<
	Keys,
	Key,
	Key | RawKey,
	Record<string, Key>,
	KnownError<ERROR.DUPLICATE_KEY | ERROR.KEYS_CANNOT_ADD_TOGGLE>,
	KnownError<ERROR.KEY_IN_USE | ERROR.MISSING>,
	Key
>

export type KeysBaseHooks = {
	"layout": BaseHookType<Key, { rows: number, columns: number }, never>
}
