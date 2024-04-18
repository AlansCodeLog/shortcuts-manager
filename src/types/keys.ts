import { type Mutable } from "@alanscodelog/utils/types"

import type { ERROR, KEY_SORT_POS } from "./enums.js"
import type { PickManager } from "./general.js"
import type { Manager } from "./manager.js"


export type RawKey<T extends string = string> = Mutable<Pick<Key<T>, "id"> & Partial<Omit<Key<T>, "id">>>

export interface BaseKey<TId extends string = string> {
	type: "key"
	/**
	 * The id used to identify which key was pressed.
	 *
	 * For keyboard keys, this should be {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code KeyboardEvent.code}.
	 *
	 * For mouse buttons, this should be {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button MouseEvent.button}, i.e. `0-5`.
	 *
	 * For scroll wheel up/down, pass the custom `WheelUp` and `WheelDown`.
	 *
	 * For modifiers, see {@link Keys.variants}. for how to handle them as the same key, otherwise they are handled like different keys.
	 *
	 * For toggles, pass the key code like normal (e.g. `CapsLock`), see {@link Key.isToggle} for how to implement toggles.
	 *
	 * Changing the id is not supported. It's recommended you just create a new key if you happen to expose changing key options to users. You can then attempt to change all shortcuts to the new key (note you will have to find the toggles as well if they were created) and report back any errors to users (e.g. changing from/to a modifier can render shortcut chords invalid).
	 */
	readonly id: TId
	/**
	 * Whether the key is enabled.
	 *
	 * If it's disabled, checking if "pressed" can be set to true will return an error. Also the manager will not manage the key's state so it will never be set to pressed (and therefore it will not trigger any shortcuts, even though shortcuts can use disabled keys).
	 *
	 * Useful for preventing the Meta/Super key from being pressed, but still showing a key.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	// todo, shortcuts can have disabled keys but they won't work?
	readonly enabled: boolean
	/**
	 * The preferred human readable version of a key. Used when stringifying it.
	 *
	 * @RequiresSet @OnHookable @CanHookable
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
	 */
	readonly variants: readonly string [] | string[] | undefined
	/**
	 * Whether the key should be rendered. See {@link Keys.layout}.
	 *
	 * Toggle on/off keys are automatically created with this set to false.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly render: boolean
	/**
	 * The width of the key. See {@link Keys.layout}.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly width: number
	/**
	 * The height of the key. See {@link Keys.layout}.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly height: number
	/**
	 * The x position of the key. See {@link Keys.layout}.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly x: number
	/**
	 * The y position of the key. See {@link Keys.layout}.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly y: number

	/**
	 *  A list of css classes the key should be rendered with.
	 *
	 * @RequiresSet @OnHookable @CanHookable
	 */
	readonly classes: readonly string [] | string[]
	/**
	 * Whether the key is a modifier. A modifier can be either `"native"` (event.getModifierState will always be used on all events to get it's true state) or `"emulated"`.
	 *
	 * For both, this determines in the manager when a chord is considered to have been pressed (when it contains a non-modifer key). See {@link Manager}.
	 *
	 * ### Notes
	 * - event.getModifierState does not check the validity of the key code, and will just return false for keys that don't exist.
	 * - You will probably need to specify {@link Key.variants key variants} because, for example, to get the state of the Control keys, you need to pass `Control` not `ControlLeft/Right`
	 * - If the modifier is native and the state is seen to change without a key press (i.e. when the element is not in focus), a key release is emulated.
	 */
	readonly isModifier: false | "emulated" | "native"
	/**
	 * Wether the key is currently being *held* down.
	 *
	 * Keys presses can be emulated for testing using the {@link Emulator}.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly pressed: boolean
	/**
	 * See {@link Manager.options.updateStateOnAllEvents}. Only has an effect if the key is a modifier or toggle key.
	 */
	updateStateOnAllEvents: boolean
}

export interface NonToggleKey<TId extends string = string> extends BaseKey<TId> {
	isToggle: false
	toggleOnId: undefined | never
	toggleOffId: undefined | never
	toggleOnPressed: undefined | never
	toggleOffPressed: undefined | never
}
export interface ToggleKey<TId extends string = string> extends BaseKey<TId> {
	/**
	 * Whether it's a toggle key. A toggle can be either `"native"` (event.getModifierState will always be used on all events to get it's true state) or `"emulated"` (state starts off false and is toggled with every keydown registered).
	 *
	 * Toggle keys can be bound to shortcuts by their state. For example:
	 * ```ts
	 * let on = new Shortcut([keys.ScrollLock.toggle.on], commands.toggle_on_x)
	 * let off = new Shortcut([keys.ScrollLock.toggle.off], commands.toggle_off_x)
	 * ```
	 *
	 * ### State
	 *
	 * With either type of toggle key, we cannot know the initial state without a keypress. The {@link Manager} sets it the first time a key matches, but for native keys you can do this even earlier. **Note that event.getModifierState does not check the validity of the key code, and will just return false for keys that don't exist.**
	 *
	 * When the {@link Manager} handles a key's pressed state, for toggles, the root key indicates whether the user is actually pressing the key or not just like any other key, and the toggle property indicates the state of the toggles.
	 *
	 * Note that state is changed for the keys as follows:
	 *
	 * ```ts
	 * // user presses and holds key
	 * key.pressed = true
	 * key.toggleOnPressed = true
	 * key.toggleOffPressed = false
	 *
	 * // user releases key
	 * key.pressed = false
	 * key.toggleOnPressed = true
	 * key.toggleOffPressed = false
	 *
	 * // user presses and holds key again
	 * key.pressed = true
	 * key.toggleOnPressed = false
	 * key.toggleOffPressed = true
	 *
	 * // user releases key
	 * key.pressed = false
	 * key.toggleOnPressed = false
	 * key.toggleOffPressed = true
	 *
	 * ```
	 * ### Notes
	 * - If the toggle is native and the state is seen to change without a key press (i.e. when the element is not in focus), a key release is **NOT** emulated.
	 */
	readonly isToggle: "native" | "emulated"
	
	readonly toggleOnId: string
	readonly toggleOffId: string
	/**
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly toggleOnPressed: boolean
	/**
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly toggleOffPressed: boolean
}
export type Key<TId extends string = string> = (NonToggleKey<TId> | ToggleKey<TId>)

export type KeySortPos = typeof KEY_SORT_POS | Record<keyof typeof KEY_SORT_POS, number>
// eslint-disable-next-line @typescript-eslint/naming-convention
export type IKeysSorter = {
	order: KeySortPos
	sort(keyList: string[], keys: Keys): string[]
}

export interface Keys<
	TEntries extends Record<string, Key> = Record<string, Key>,
> {
	type: "keys"
	/**
	 * The key entries.
	 *
	 * To add/remove entries you should {@link addKey}/{@link removeKey} or {@link setKeysProp} with the synthetic `entries@add/remove` properties.
	 *
	 * The synthetic properties can be hooked into with {@link Manager.hooks}.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly entries: TEntries
	/**
	 * If this is true, {@link calculateLayout} will be used to recalculate the size of the keyboard in key units when any related key properties are changed, or when keys are added or removed.
	 */
	autoManageLayout: boolean
	/**
	 * The layout size in pixels. Useful for rendering the layout.
	 *
	 * {@link calculateLayout} can be used to calculate it. This is semi-automated if {@link Keys.autoManageLayout} is true. See it for details.
	 */
	layout: { y: number, x: number }
	/**
	 * Is used to keep track of native toggle keys.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly nativeToggleKeys: string[]
	/**
	 * Is used to keep track of native modifier keys.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly nativeModifierKeys: string[]
	/**
	 * Is used to keep track of key variants in a record: `Record<VariantName, Key.id[]>`.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly variants: Record<string, Key["id"][]>
	/**
	 * Is used to keep track of key toggles: `Record<toggleOn/OffId, Key.id>`.
	 *
	 * @RequiresSet @OnHookable @Managed
	 */
	readonly toggles: Record<string, Key>
}

type GetKeyHooks<T extends keyof KeySetEntries | keyof KeysSetEntries> =
T extends CanHookKeyProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetKeyProp" | "onSetKeyProp">>
: T extends OnHookKeyProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "onSetKeyProp">>
: T extends CanHookKeysProps
? Partial<Pick<NonNullable<Manager["hooks"]>, "canSetKeysProp" | "onSetKeysProp">>
: Partial<Pick<NonNullable<Manager["hooks"]>, "onSetKeysProp">>

type BaseKeyManager = PickManager<"options", "stringifier"> & Record<any, any>
type Unmanaged<T extends keyof Key & keyof KeySetEntries> = {
	val: Key[T]
	manager: never
	hooks: GetKeyHooks<T>
	error: never
}
export type KeySetEntries = {
	pressed: {
		val: Key["pressed"]
		manager: BaseKeyManager & Pick<Manager, "keys">
		hooks: GetKeyHooks<"pressed">
		error: ERROR.CANNOT_SET_WHILE_DISABLED
	}
	toggleOnPressed: {
		val: Key["toggleOnPressed"]
		manager: BaseKeyManager & Pick<Manager, "keys">
		hooks: GetKeyHooks<"toggleOnPressed">
		error: ERROR.CANNOT_SET_WHILE_DISABLED
	}
	toggleOffPressed: {
		val: Key["toggleOffPressed"]
		manager: BaseKeyManager & Pick<Manager, "keys">
		hooks: GetKeyHooks<"toggleOffPressed">
		error: ERROR.CANNOT_SET_WHILE_DISABLED
	}
	enabled: {
		val: Key["enabled"]
		manager: BaseKeyManager
		hooks: GetKeyHooks<"enabled">
		error: ERROR.KEY_IN_USE
	}
	x: Unmanaged<"x">
	y: Unmanaged<"y">
	width: Unmanaged<"width">
	height: Unmanaged<"height">
	render: Unmanaged<"render">
	classes: Unmanaged<"classes">
	label: Unmanaged<"label">

}

export type OnHookKeyProps =
	| "pressed"
	| "x"
	| "y"
	| "width"
	| "height"
	| "label"
	| "toggleOnPressed"
	| "toggleOffPressed"
	| "enabled"
	| "render"
	| "classes"
	

export type CanHookKeyProps = Exclude<
	OnHookKeyProps,
	"pressed" | "toggleOffPressed" | "toggleOnPressed"
>

export type SyntheticOnHookKeysProps =
	| `entries@${"add" | "remove"}`
	| `variants@${"add" | "remove"}@${string}`
	| `toggles@${"add" | "remove"}@${string}`

export type CanHookKeysProps = `entries@${"add" | "remove"}`

export type OnHookKeysProps = SyntheticOnHookKeysProps | CanHookKeysProps

type BaseKeysManager = PickManager<"options", "stringifier"> & Record<any, any>
& Pick<Manager, "keys">
 

export type KeysSetEntries =
	Record<`entries@add`, {
		val: Key
		manager: BaseKeysManager
		hooks: GetKeyHooks<`entries@add`>
		error: ERROR.DUPLICATE_KEY | ERROR.INVALID_VARIANT_PAIR
	}>
	& Record<`entries@remove`, {
		val: Key
		manager: BaseKeysManager & Pick<Manager, "shortcuts" | "commands">
		hooks: GetKeyHooks<`entries@remove`>
		error: ERROR.KEY_IN_USE | ERROR.MISSING
	}>
	& Record<`toggles@${"add" | "remove"}@${string}`, {
		val: Key
		manager: BaseKeysManager
		hooks: GetKeyHooks<`variants@${"add" | "remove"}@${string}`>
		error: never
	}>
	& Record<`variants@${"add" | "remove"}@${string}`, {
		manager: BaseKeysManager
		val: string
		hooks: GetKeyHooks<`variants@${"add" | "remove"}@${string}`>
		error: never
	}>
	& Record<"nativeModifierKeys" | "nativeToggleKeys", {
		manager: BaseKeysManager
		val: string[]
		hooks: GetKeyHooks<"nativeModifierKeys" | "nativeToggleKeys">
		error: never
	}>
	& Record<"layout", {
		manager: BaseKeysManager
		val: Keys["layout"]
		hooks: GetKeyHooks<"layout">
		error: never
	}>

