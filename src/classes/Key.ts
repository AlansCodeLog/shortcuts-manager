import { KnownError } from "@/helpers"
import { MixinHookablePlugableBase } from "@/mixins"
import { DeepPartialObj, KeyHooks, KeyOptions, Optional, PluginsInfo, RawKey, ToggleProxy, TYPE_ERROR } from "@/types"
import type { Plugin } from "./Plugin"




const BYPASS_TOGGLE_CREATION = Symbol("BYPASS_TOGGLE_CREATION")

export class Key<
	TPlugins extends
		Plugin<any, any>[] =
		Plugin<any, any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
	TId extends
		string =
		string,
> extends MixinHookablePlugableBase<KeyHooks,TPlugins, TInfo> implements Omit<KeyOptions, "toString">  {
	readonly #id: TId
	/** See {@link KeyOptions.is} */
	readonly is: KeyOptions["is"]
	/**
	 * If the key is a toggle key, pass this when defining shortcuts if you want them to trigger when the key is toggled on. Otherwise if you just pass the key it will trigger on every change of state.
	 *
	 * See {@link KeyOptions.is.toggle} for how this works.
	 */
	declare on?: ToggleProxy<Key>
	/** See {@link Key.on} except this triggers when the key is toggled off. */
	declare off?: ToggleProxy<Key>
	/** This property is only available on toggle states (e.g. key.on / key.off). */
	declare root: Key & { on: ToggleProxy<Key>, off: ToggleProxy<Key> }
	/** See {@link KeyOptions.variants} */
	readonly variants: KeyOptions["variants"]

	#label: KeyOptions["label"]
	#stringify: KeyOptions["stringify"]
	/**
	 * # Key
	 * Creates a key.
	 *
	 * It can throw. See {@link ERROR} for why.
	 *
	 * Note: You cannot add more plugins or change the structure of info after creating an instance.
	 *
	 * @template TPlugins **@internal** See {@link PlugableBase}
	 * @template TInfo **@internal** See {@link PlugableBase}
	 * @template TId **@internal** See {@link ./README.md Collection Entries}
	 * @param id See {@link Key.id}
	 * @param opts Set options for the shortcut.
	 * @param info See {@link Key.info}
	 * @param plugins See {@link Key.plugins}
	 */
	constructor(
		id: TId,
		opts?: RawKey["opts"],
	)
	constructor(
		id: TId,
		opts: Optional<RawKey["opts"]> | { },
		info: DeepPartialObj<TInfo>,
		plugins: TPlugins
	)
	constructor(
		id: TId,
		opts: RawKey["opts"] = { },
		info?: DeepPartialObj<TInfo>,
		plugins?: TPlugins
	) {
		super()
		this.#id = id
		this.#label = opts.label ?? id
		// these should function like real properties, enumerable and visible to JSON.stringify
		Object.defineProperties(this, {
			id: {
				get: function(): string { return this.#id },
				set: function(_: string):void { throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "The id property of a key cannot be changed once set.", undefined) },
				enumerable: true,
			},
			label: {
				get: function (): string { return typeof this.#label === "function" ? this.#label(this) : this.#label },
				set: function (_: string): void { throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "The label property of a key cannot be changed once set.", undefined) },
				enumerable: true
			}
		});
		this.variants = opts.variants ?? false

		this.#stringify = opts.stringify
		this.is = {
			toggle: false,
			modifier: opts.is?.modifier ?? false,
		}
		if (opts.is?.toggle) {
			this.is.toggle = opts.is.toggle === true
				? "native"
				: opts.is.toggle
			/* eslint-disable @typescript-eslint/no-unused-vars */
			/* eslint-disable prefer-rest-params */
			if (arguments[4] !== BYPASS_TOGGLE_CREATION) {
				// arguments might be shorter and we need to be sure the bypass is the fourth argument
				this.#keyCreateToggle([arguments[1], arguments[2], arguments[3]])
			}
			/* eslint-enable @typescript-eslint/no-unused-vars */
			/* eslint-enable prefer-rest-params */
		}

		Object.freeze(this.is)
		Object.freeze(this.variants)
		this._mixin({
			hookable: { keys: ["allows", "set"] },
			plugableBase: { plugins, info, key: "id"}
		})
	}
	/**
	 * Adds on/off toggle states to the instance.
	 * See {@link KeyOptions.is.toggle} for how this works.
	 */
	#keyCreateToggle(args: any[]): void {
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
	 */
	declare label: string
	/**
	 * Returns whether the key passed is equal to this one.
	 *
	 * To return true, their ids must be equal, and they must be equal according to their plugins.
	 */
	equals(key: Key): key is Key {
		return (
			this === key
			||
			(
				this.id === key.id
				&& this.equalsInfo(key)
			)
		)
	}
	override toString(): string {
		if (this.#stringify) return this.#stringify(this)
		return typeof this.opts.label === "function" ? this.opts.label(this) : this.opts.label
	}
	get opts(): KeyOptions {
		return { is:this.is, variants: this.variants, stringify: this.#stringify, label: this.#label }
	}
}

// export interface Key<TPlugins, TInfo> extends HookableBase<KeyHooks>, PlugableBase<TPlugins, TInfo> {}
// mixin(Key, [Hookable, HookableBase, Plugable, PlugableBase])

