import type { DeepPartial } from "@utils/types"

import type { ERROR, KEY_SORT_POS, MOUSE, WHEEL } from "./enums"
import type { BaseHookType, CollectionHookType } from "./hooks"
import type { OnlyRequire } from "./utils"

import type { Key } from "@/classes"
import type { KnownError } from "@/helpers"


// import type{ KnownError } from "@/helpers"

/**
 * Same as [[KeyOptions]] except you're allowed to just pass true to toggle, in which case it will use the default toggle options.
 */
export type RawKey = Pick<Key, "id"> & {
	opts?: DeepPartial<Omit<KeyOptions, "is">>
	& {
		is?: DeepPartial<Omit<KeyOptions["is"], "toggle">>
		& {
			toggle?: DeepPartial<KeyOptions["is"]["toggle"]> | boolean
		}
	}
}

export type ToggleOptions = {
	native: boolean
	suffix: { on: string, off: string }
}

/**
 * The toggle version of a key.
 * Note: If we use Omit then typescript will complain if we pass a toggle to a function that takes a key because Omit removes the property completely, making it so that T no longer extends Key because there's no way to specify that some property on Key might be missing. E.g. `prop?: something` is taken to mean `prop: something | undefined` not `prop is missing or prop: something`
 * Setting it to undefined fixes the problem but this does mean the type for toggles is slightly off (it says it has properties that it technically doesn't). But this shouldn't be a problem unless we're iterating through the object's properties and expect "on" and "off" to be one of the keys. Even then I can't think of a situation where this would be a problem.
 * In the future typescript might be able to handle this.
 */
export type ToggleProxy<T extends Key = Key> = T & {
	on: undefined
	off: undefined
	root: T
}

// export type AnyKey = Key | ToggleProxy<any>

export type KeyOptions = {
	/**  The label to use for the key when parsing from/to text. */
	label: string
	/**
	 * Variants are a list of fallback codes that will also trigger a key.
	 *
	 * For example, without variants, there's no way to have a shortcut like [[Ctrl, A]] where Ctrl represents either Ctrl key and can be triggered by either. One could create two shortcuts for both keys, but only one key would be considered triggered at a time on the layout.
	 *
	 * Variants can solve this by allowing us to create a key that's only labeled as Ctrl (no code should be set), but whose variants are set to ["ControlLeft", "ControlRight"].
	 *
	 * If you still need the keys to be labeled or styled different, you can register multiple keys with the same variants.
	 *
	 * They can also be use to treat any set of keys as the exact same keys. This can be useful for allowing users to remap keys only withing the application (e.g. use CapsLock as an extra modifier or multiple modifiers).
	 */
	variants: string[] | false
	is: {
		/**
		 * Whether the key should behave like a modifier.
		 * It's not necessary to know whether it functions as a modifier. We can tell from the id.
		 */
		modifier: boolean
		/**
		 * If it's a mouse button, which mouse button number. The [[Mouse]] enum contains the normal values for up to 5 button mice.
		 * Do NOT use for mouse wheel up/down. See [[KeyOptions.is_wheel]] instead.
		 * You're free to register further mouse buttons, e.g. for visualization purposes, but I believe (someone correct me if I'm wrong) that mice with more keys define keys by assigning them to other/keys or macros and don't register directly as buttons, or at least that's how one 5+ button mouse I had worked, so it's impossible to capture their events (since they just show as the keys they're bound to). They would just be dummy keys.
		 */
		mouse: MOUSE | MOUSE[keyof MOUSE] | number | false
		/**
		 * If it's a mouse wheel, whether it's up or down (you can use the [[Wheel]] enum)
		 */
		wheel: WHEEL | WHEEL[keyof WHEEL] | false
		/**
		 * Whether it's a toggle key.
		 * In the case of native toggle keys, e.g. ScrollLock, needed so that we know to check event.getModifierState for it's true state.
		 *
		 * Otherwise (if `native: false`) the toggle state will be emulated (with the state always starting as off). Note even with `native: true` we cannot know the initial state without a keypress.
		 *
		 * Setting `toggle:true` is like passing:
		 * ```ts
		 * let key = new Key("a", {
		 * 	// toggle: true
		 * 	toggle: {
		 * 		native: true,
		 * 		suffix: {on: "_on", off: "_on"}
		 * 	}
		 * })
		 * ```
		 *
		 * Toggle keys can be bound to shortcuts by their state. For example:
		 * ```ts
		 * let on = new Shortcut([keys.ScrollLock.on], commands.toggle_on_x)
		 * let off = new Shortcut([keys.ScrollLock.off], commands.toggle_off_x)
		 * ```
		 * The way this works is that when toggle/emulate toggle are true, the class creates unique toggle state properties on the instances by using proxies
		 * The proxies don't do much of anything. Their main purpose is prevent the references to the instance from equaling each other, but allow the on/off keys to be in some way bound to their base key and accessible from it (so from the layout we don't have to handle 3 different keys).
		 *
		 * So given some key:
		 * ```ts
		 * let key = new Key("a", {toggle: true})
		 *
		 * key === key //true
		 * key === key.on // false
		 * key === key.off // false
		 * key.on === key.off // false
		 * key.on === key.on // true
		 * ```
		 *
		 * Additionally:
		 * - .on.on and .off.off are hidden so we don't have recursive structures, thought don't be silly and try to assign/delete them or something. There's no guards against this.
		 * ```ts
		 * key.on.on // undefined
		 * ```
		 * - The suffix is added to the key id:
		 * ```ts
		 * key.id // "a"
		 * key.on.id // a_on
		 * key.off.id // a_on
		 * ```
		 * opts.label is NOT modified.
		 *
		 * - A root property is added to the on/off proxies which can be use as an escape hatch to access the "base" instance of the key again.
		 * ```ts
		 * key === key.on.root //true
		 * ```
		 * Note that since this would normally create a recursive structure (`key.on.root.on....`), root is not an enumerable property. It only exists if you access it.
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
		 * Sometimes you might be passed a key and you might want to check which toggle state it is. You can do this like so:
		 * ```ts
		 * if (key.opts.toggle) { // check it's a toggle key first
		 * 	if (key.root === undefined) //it's the root key
		 * 	else if (key.root.on === key) //it's the on key
		 * 	else if (key.root.off === key) // it's the off key
		 * }
		 * ```
		 */
		toggle: ToggleOptions | false
	}
}

export type KeysOptions = {
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
	sort: (shortcut1: Key, shortcut2: Key) => number
}


export type KeyHooks = {
	"label": BaseHookType<string, never>
}

export type KeysHook = CollectionHookType<
	OnlyRequire<Key, "id">,
	Record<string, Key>,
	KnownError<ERROR.DUPLICATE_KEY>
>
