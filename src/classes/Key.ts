import { Result, setReadOnly } from "@alanscodelog/utils"
import { castType, Err, Ok, pick } from "@utils/utils"

import { defaultStringifier } from "./Stringifier"

import { HookableBase } from "@/bases"
import { isToggleRootKey, KnownError } from "@/helpers"
import { createInstance } from "@/helpers/createInstance"
import { ERROR, KeyHooks, KeyOptions, RawKey, ToggleKey } from "@/types"

import type { Stringifier } from "."


const BYPASS_TOGGLE_CREATION = Symbol("BYPASS_TOGGLE_CREATION")

export class Key<
	TId extends
		string =
		string,
> extends HookableBase<KeyHooks> implements KeyOptions {
	/**
	 * Wether the key is currently being *held* down.
	 *
	 * @RequiresSet @SetHookable
	 */
	readonly pressed: boolean = false
	/** @inheritdoc */
	checkStateOnAllEvents: boolean = true
	// cannot inherit doc
	/** See {@link KeyOptions.is} */
	readonly is: KeyOptions["is"]
	/** @inheritdoc */
	readonly width: number = 1
	/** @inheritdoc */
	readonly height: number = 1
	/** @inheritdoc */
	readonly x: number = 0
	/** @inheritdoc */
	readonly y: number = 0
	/** @inheritdoc */
	readonly render: boolean = true
	/** @inheritdoc */
	classes: string[]
	/**
	 * If the key is a toggle key, pass this when defining shortcuts if you want them to trigger when the key is toggled on. Otherwise if you just pass the key it will trigger on every change of state.
	 *
	 * See {@link KeyOptions.is.toggle} for how this works.
	 */
	declare on?: ToggleKey<Key>
	/** See {@link Key.on} except this triggers when the key is toggled off. */
	declare off?: ToggleKey<Key>
	/** This property is only available on toggle states (e.g. key.on / key.off). */
	declare root: Key & { on: ToggleKey<Key>, off: ToggleKey<Key> }
	/** @inheritdoc */
	readonly variants: KeyOptions["variants"]
	/**
	 * # Key
	 * Creates a key.
	 *
	 * It can throw. See {@link ERROR} for why.
	 *
	 * Options cannot be changed once set (because a toggle key might have be created, which can't be uncreated). It's recommended you just create a new key if you happen to expose changing key options to users. You can then attempt to change all shortcuts to the new key (note you will have to find the toggles as well if they were created) and report back any errors to users (e.g. changing from/to a modifier can render shortcut chords invalid).
	 *
	 * @template TId **@internal** See {@link ./README.md Collection Entries}
	 * @param id See {@link Key.id}
	 * @param opts Set {@link KeyOptions}. Options cannot be changed once set, {@link Key}.
	 */
	constructor(
		id: TId,
		opts: RawKey["opts"] = { },
	) {
		super()

		this.stringifier = opts.stringifier as Stringifier ?? defaultStringifier

		setReadOnly(this, "id", id)
		this.label = opts.label ?? this.id

		this.classes = opts.classes ?? []
		this.x = opts.x ?? this.x
		this.y = opts.y ?? this.y
		this.width = opts.width ?? this.width
		this.height = opts.height ?? this.height


		this.is = {
			toggle: false,
			modifier: false,
		}
		if (opts.is?.modifier === true) {
			setReadOnly(this.is, "modifier", "native")
		} else if (opts.is?.modifier) {
			setReadOnly(this.is, "modifier", opts.is.modifier)
		}
		if (opts.is?.toggle) {
			setReadOnly(this.is, "toggle", opts.is.toggle === true
				? "native"
				: opts.is.toggle)
			// eslint-disable-next-line prefer-rest-params
			if (arguments[2] !== BYPASS_TOGGLE_CREATION) {
				// arguments might be shorter and we need to be sure the bypass is the fourth argument
				this._keyCreateToggle(opts)
			}
		}
		Object.freeze(this.is)
		if (opts.variants) {
			this.safeSet("variants", opts.variants).unwrap()
		}
	}
	/**
	 * On toggle keys, allows easily toggling the state of the toggles.
	 */
	public toggleToggle(): void {
		if (!this.is.toggle) throw new Error("toggleToggle is a method for toggle keys only.")
		const rootKey = isToggleRootKey(this) ? this : this.root
		const onValue = rootKey.on!.pressed
		rootKey.on!.set("pressed", !onValue)
		rootKey.off!.set("pressed", onValue)
	}
	protected override _allows(key: string, value: any): Result<true, KnownError<ERROR.INVALID_VARIANT>> {
		if (key === "variants") {
			if (value.includes(this.id)) {
				return Err(new KnownError(ERROR.INVALID_VARIANT, `Attempted to set the variants of key ${this.stringifier.stringify(this)} to: [${value.join(", ")}], but one of the variants is the key id itself.`, { variants: value, id: this.id }))
			}
		}
		return Ok(true)
	}
	/**
	 * Adds on/off toggle states to the instance.
	 * See {@link KeyOptions.is.toggle} for how this works.
	 */
	private _keyCreateToggle(opts: RawKey["opts"] = {}): void {
		// @ts-expect-error .
		this.on = new Key(`${this.id}On`, { ...opts, render: false }, BYPASS_TOGGLE_CREATION) as ToggleKey
		// @ts-expect-error .
		this.off = new Key(`${this.id}Off`, { ...opts, render: false }, BYPASS_TOGGLE_CREATION) as ToggleKey
		if (this.label) {
			const val = this.label
			if (this.on.allows("label", `${val} (On)`).isOk) this.on.set("label", `${val} (On)`)
			if (this.off.allows("label", `${val} (Off)`).isOk) this.off.set("label", `${val} (Off)`)
		}
		this.on.root = this as any
		this.off.root = this as any
		this.addHook("set", (prop, val) => {
			if (prop === "label") {
				castType<string>(val)
				if (this.on!.allows("label", `${val} (On)`).isOk) this.on!.set("label", `${val} (On)`)
				if (this.off!.allows("label", `${val} (Off)`).isOk) this.off!.set("label", `${val} (Off)`)
			}
		})
	}
	/**
	 * The id used to identify which key was pressed.
	 *
	 * For keyboard keys, this should be {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code KeyboardEvent.code}.
	 *
	 * For mouse buttons, this should be {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button MouseEvent.button}, i.e. `0-5`.
	 *
	 * For scroll wheel up/down, pass the custom `WheelUp` and `WheelDown`.
	 *
	 * For modifiers, see {@link KeyOptions.variants}. for how to handle them as the same key, otherwise they are handled like different keys.
	 *
	 * For toggles, pass the key code like normal (e.g. `CapsLock`), see {@link KeyOptions.is.toggle} for how to implement toggles.
	 */
	declare id: string
	/**
	 * The preferred human readable version of a key.
	 *
	 * See {@link KeyOptions.label}
	 *
	 * This is a getter so label can be a function and this will return it's value. It's type is string, but you can safely set a function to it.
	 */
	declare label: string // function is hidden, though it can still be set via the property
	/**
	 * Returns whether the key passed is equal to this one.
	 *
	 * To return true, their ids must be equal.
	 */
	equals(key: Key): key is Key {
		return this === key || this.id === key.id
	}
	get opts(): KeyOptions {
		return pick(this, ["is", "x", "y", "width", "height", "stringifier", "label", "render", "classes", "checkStateOnAllEvents"])
	}
	/** Create an instance from a raw entry. */
	static create<T extends Key = Key>(entry: RawKey): T {
		return createInstance<Key, "id">(Key, "id", entry) as T
	}
	export(): RawKey {
		const opts: any = { ...this.opts }
		delete opts.stringifier
		opts.is = { ...opts.is }
		return {
			id: this.id,
			...opts,
		}
	}
}
