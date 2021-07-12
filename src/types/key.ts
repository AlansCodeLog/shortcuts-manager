import type { Key, KeysStringifier } from "@/classes"
import type { KnownError } from "@/helpers"
import type { DeepPartial } from "@alanscodelog/utils"
import type { ERROR, KEY_SORT_POS } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { OnlyRequire } from "./utils"




// import type{ KnownError } from "@/helpers"

/**
 * Same as {@link KeyOptions} except you're allowed to just pass true to toggle.
 */
export type RawKey = Pick<Key, "id"> & {
	opts?: DeepPartial<Omit<KeyOptions, "is">>
	& {
		is?: DeepPartial<Omit<KeyOptions["is"], "toggle">>
		& {
			toggle?: DeepPartial<KeyOptions["is"]["toggle"]> | true
		}
	}
}

/**
 * The toggle version of a key.
 */
export type ToggleProxy<T extends Key = Key> = T & {
	on: never
	off: never
	root: T
}

export type AnyKey = Key | ToggleProxy<any>

export type KeyOptions = {
	/**
	 * The label to use for the key when stringifying it. If no label is specified the id is used.
	 *
	 * It can also be a function. You could, for example, use the experimental {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardLayoutMap/get KeyboardLayoutMap.get()} or cache the user's keys as they press them.
	 */
	label: string | ((key: Key) => string)
	/**
	 * Is called in `toString` (without overriding it) instead of the default implementation.
	 *
	 * This option is available to match the other classes, but is not strictly needed. The default implementation only looks at the label which can already be a function.
	 */
	stringify?: ((key: Key) => string)
	/**
	 * Variants are a list of fallback codes that will also trigger a key.
	 *
	 * For example, without variants, there's no way to have a shortcut like `[[Ctrl, A]]` where Ctrl represents either Ctrl key and can be triggered by either. One could create two shortcuts for both keys, but only one key would be considered triggered at a time on the layout.
	 *
	 * Variants can solve this by allowing us to create a key that's only labeled as Ctrl. The `id` should be set to an invalid key code (we still need an id for plugins, etc), preferably one that indicates what's happening (e.g. `VirtualControl`). The variants should be set to `["ControlLeft", "ControlRight"]`.
	 *
	 * If you still need the keys to be labeled or styled different, you can register multiple keys with the same variants (e.g. `CtrlL(variants: ["ControlLeft", "ControlRight"])` and `CtrlR(variants: ["ControlLeft", "ControlRight"])`).
	 *
	 * They can also be use to treat any set of keys as the exact same keys. This can be useful for allowing users to remap keys only within the application.
	 *
	 * For example, to use CapsLock as an extra modifier (e.g. `Ctrl(variants: ["ControlLeft", "ControlRight", "Capslock"])`). You could even "remap" it to multiple modifiers, just add "Capslock" to the variants list of those modifiers (e.g. Ctrl, Alt, Shift). This would cause all those keys to be considered pressed when Capslock is pressed.
	 *
	 * Also unlike keys, whose `id` is readonly, variants are not, they can be added and removed as needed.
	 */
	variants: string[] | false
	is: {
		/**
		 * Whether the key should behave like a modifier.
		 *
		 * It's not necessary to know whether it functions as a modifier. We can tell from the id.
		 */
		modifier: boolean
		/**
		 * Whether it's a toggle key. A toggle can be either `"native"` (event.getModifierState can be used to get it's true state) or `"emulated"` (state starts off false). In either case, we cannot know the initial state without a keypress.
		 *
		 * Setting `toggle: true` is like passing `toggle:"native"`:
		 *
		 * Toggle keys can be bound to shortcuts by their state. For example:
		 * ```ts
		 * let on = new Shortcut([keys.ScrollLock.on], commands.toggle_on_x)
		 * let off = new Shortcut([keys.ScrollLock.off], commands.toggle_off_x)
		 * ```
		 *
		 * The way this works is the class creates two new keys, with the corresponding suffix (`On`/`Off`) added to the id, then takes care of correctly assigning things to create the relevant properties (`"on", "off"` on the base key and `"root"` on the toggles).
		 *
		 * These new classes don't do much of anything. Their main purpose is prevent the references to the instance from equaling each other and allow the on/off keys to provide proper access to the base key and vice versa (so from the layout we don't have to handle 3 different keys).
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
		 * opts.label is NOT modified. You can pass a function for `label` or `stringify` to customize the suffix on the toggles. See Other Notes below for how you might tell they key apart.
		 *
		 * Note that while `on` and `off` are enumerable properties, `root` is not, since it contains a recursive structure (`key.on.root.on....`).
		 *
		 * ### Other Notes
		 *
		 * Sometimes you might want to compare only the roots of two toggles keys (that might be the root, on, or off). You can do this like so:
		 *
		 * ```ts
		 * let root1 = key1.root ?? key1
		 * let root2 = key2.root ?? key2
		 * root1 === root2 // or root1.equals(root2)
		 * ```
		 *
		 * Sometimes you might be passed a key and you might want to check which toggle state it is. You can do this like so:
		 * ```ts
		 * if (key.opts.toggle) { // check it's a toggle key first
		 * 	if (key.root === undefined) //it's the root key
		 * 	else if (key.root.on === key) //it's the on key
		 * 	else if (key.root.off === key) // it's the off key
		 * } else {} // it's not a toggle key
		 * ```
		 */
		toggle: "native" | "emulated" | false
	}
}

export type KeysOptions = {
	/**
	 * See {@link KeysStringifier}
	 */
	stringifier?: KeysStringifier
}

export type KeysSorterOptions = {
	/**
	 * Specify how keys are sorted depending on what type of keys they are (see [[KeySortPos]]) and then alphabetically. This should be enough control for 99.99% of cases. Otherwise see [[ShortcutOptions.sort]]
	 */
	order: typeof KEY_SORT_POS | Record<keyof typeof KEY_SORT_POS, number>
	/**
	 * Specify a completely custom sort function.
	 * [[ShortcutOptions.order]] will be ignored, though it will be available via this.sort because the function (which should NOT be an arrow function) is bound to [[ShortcutOptions]] which also means any other options (like [[ShortcutOptions.parser]]) are also available.
	 */
	sort?: (shortcut1: Key, shortcut2: Key, order: KeysSorterOptions["order"]) => number
}


export type KeyHooks = {
	"label": BaseHookType<string, never>
}

export type KeysHook = CollectionHookType<
	OnlyRequire<Key, "id">,
	Record<string, Key>,
	KnownError<ERROR.DUPLICATE_KEY>
>
