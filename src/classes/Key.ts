import type { Result } from "@alanscodelog/utils"
import { Err, Ok } from "@utils/utils"

import { defaultStringifier } from "./KeysStringifier"

import { HookableBase } from "@/bases"
import { KnownError } from "@/helpers"
import { ERROR, KeyHooks, KeyOptions, Optional, RawKey, ToggleKey, TYPE_ERROR } from "@/types"

import type { KeysStringifier } from "."


const sId = Symbol("id")
const sLabel = Symbol("label")
const sKeyCreateToggle = Symbol("keyCreateToggle")

const BYPASS_TOGGLE_CREATION = Symbol("BYPASS_TOGGLE_CREATION")

export class Key<
	TId extends
		string =
		string,
> extends HookableBase<KeyHooks> implements KeyOptions {
	readonly [sId]: TId
	readonly [sLabel]: KeyOptions["label"]
	/**
	 * Wether the key is currently being *held* down.
	 *
	 * Does not allow `allows` hooks, only `set` hooks.
	 */
	pressed: boolean = false
	// cannot inherit doc
	/** See {@link KeyOptions.is} */
	is: KeyOptions["is"]
	/** @inheritdoc */
	layout: KeyOptions["layout"] = [] as any
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
	variants: KeyOptions["variants"]
	/** @inheritdoc */
	stringifier: KeyOptions["stringifier"] = defaultStringifier
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
		opts?: RawKey["opts"],
	)
	constructor(
		id: TId,
		opts: Optional<RawKey["opts"]> | { },
	)
	constructor(
		id: TId,
		opts: RawKey["opts"] = { },
	) {
		super()
		if (opts.variants) {
			this.variants = opts.variants
			if (this.variants.includes(id)) {
				throw new KnownError(ERROR.INVALID_VARIANT, `Attempted to create a key ${this.stringifier.stringify(this)} with the following variants: [${this.variants.join(", ")}], but one of the variants is the key id itself.`, { variants: this.variants, id })
			}
		}
		this[sId] = id
		this[sLabel] = opts.label ?? id
		// should function like a real property, enumerable and visible to JSON.stringify
		Object.defineProperties(this, {
			id: {
				get(): string { return this[sId] },
				set(): void { throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "The id property of a key cannot be changed once set.", undefined) },
				enumerable: true,
			},
			// need this because label might be a function
			label: {
				get(): string { return typeof this[sLabel] === "function" ? this[sLabel](this) : this[sLabel] },
				set(val: string): void { this[sLabel] = val},
				enumerable: true,
			},
		})

		if (opts.stringifier) this.stringifier = opts.stringifier as KeysStringifier
		this.is = {
			toggle: false,
			modifier: false,
		}
		if (opts.is?.modifier === true) {
			this.is.modifier = "native"
		} else if (opts.is?.modifier) {
			this.is.modifier = opts.is.modifier
		}
		if (opts.is?.toggle) {
			this.is.toggle = opts.is.toggle === true
				? "native"
				: opts.is.toggle
			/* eslint-disable @typescript-eslint/no-unused-vars */
			/* eslint-disable prefer-rest-params */
			if (arguments[4] !== BYPASS_TOGGLE_CREATION) {
				// arguments might be shorter and we need to be sure the bypass is the fourth argument
				this[sKeyCreateToggle]([arguments[1], arguments[2], arguments[3]])
			}
			/* eslint-enable @typescript-eslint/no-unused-vars */
			/* eslint-enable prefer-rest-params */
		}

		Object.freeze(this.is)
	}
	protected override _allows(key: string, value: any): Result<true, KnownError<ERROR.INVALID_VARIANT>> {
		if (key === "variants") {
			if (value.includes(this.id)) {
				return Err(new KnownError(ERROR.INVALID_VARIANT, `Attempted to change the variants of key ${this.stringifier.stringify(this)} with the following variants: [${value.join(", ")}], but one of the variants is the key id itself.`, { variants: value, id: this.id }))
			}
		}
		return Ok(true)
	}
	/**
	 * Adds on/off toggle states to the instance.
	 * See {@link KeyOptions.is.toggle} for how this works.
	 */
	[sKeyCreateToggle](args: any[]): void {
		Object.defineProperty(this, "on", { configurable: false, enumerable: true, value: new Key(`${this.id}On`, ...args, BYPASS_TOGGLE_CREATION) })
		Object.defineProperty(this.on, "root", { configurable: false, enumerable: false, value: this })
		Object.defineProperty(this, "off", { configurable: false, enumerable: true, value: new Key(`${this.id}Off`, ...args, BYPASS_TOGGLE_CREATION) })
		Object.defineProperty(this.off, "root", { configurable: false, enumerable: false, value: this })
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
		return { is: this.is, variants: this.variants, stringifier: this.stringifier, label: this.label }
	}
	static create<T extends Key = Key>(entry: RawKey): T {
		return HookableBase.createAny<Key, "id">(Key, "id", entry) as T
	}
}
