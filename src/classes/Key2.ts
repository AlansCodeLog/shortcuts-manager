import { mixin } from "@utils/utils"

import type { Plugin } from "./Plugin"

import { KnownError } from "@/helpers"
import { Hookable, HookableBase, Plugable } from "@/mixins"
import type { PlugableBase } from "@/mixins/PlugableBase"
import { DeepPartialObj, KeyHooks, KeyOptions, Optional, PluginsInfo, RawKey, ToggleProxy, TYPE_ERROR } from "@/types"
import { HOOKABLE_CONSTRUCTOR_KEY, PLUGABLE_CONSTRUCTOR_KEY } from "@/types/symbolKeys"


/**
 * Creates a key.
 */
export class Key<
	TPlugins extends
		Plugin<any>[] =
		Plugin<any>[],
	TInfo extends
		PluginsInfo<TPlugins> =
		PluginsInfo<TPlugins>,
	// See [[./README #Collection Entries]] for why this is here
	TId extends
		string =
		string,
> implements KeyOptions {
	/**
	 * The id used to identify which key was pressed.
	 * For most keys this should be [[KeyboardEvent.code]].
	 * For modifiers, see KeyOptions["variants"] for how to handle them as the same key, otherwise they are handled like different keys.
	 */
	readonly _id!: TId
	label!: KeyOptions["label"]
	readonly is!: KeyOptions["is"]
	/**
	 * If the key is a toggle key, pass this when defining shortcuts if you want them to trigger when the key is toggled on. Otherwise if you just pass the key it will trigger on every change of state.
	 * See [[KeyOptions.toggle]] for how this works.
	 */
	on?: ToggleProxy<Key>
	/** See [[Key.on]] except this triggers when the key is toggled off. */
	off?: ToggleProxy<Key>
	/** This property is only available on toggle states (e.g. key.on / key.off). */
	root?: Key & { on: ToggleProxy<Key>, off: ToggleProxy<Key> }
	readonly variants!: KeyOptions["variants"]
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
	/**
	 * @param id See [[Key.id]]
	 * @param opts Set options for the shortcut.
	 * @param info See [[Key.info]]
	 * @param plugins See [[Key.plugins]]
	 *
	 * Note: You cannot add more plugins or change the structure of info after creating an instance.
	 *
	 * Note: It can throw. See [[ERROR]] for why.
	 */
	constructor(
		id: TId,
		opts: RawKey["opts"] = { },
		info?: DeepPartialObj<TInfo>,
		plugins?: TPlugins
	) {
		init(this, id, opts)
		this[PLUGABLE_CONSTRUCTOR_KEY](plugins, info, "id")
		this[HOOKABLE_CONSTRUCTOR_KEY](["allows", "set"])
	}
	get id(): string {return this._id}
	set id(_value: string) {throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "The id property of a key cannot be changed once set.", undefined)}
	/**
	 * Returns whether two keys are functionally the same for our purposes.
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
	// get string(): string {
	// 	return this.parser.stringify.key(this)
	// }
	get opts(): KeyOptions {
		const { label, is, variants } = this
		return { label, is, variants }
	}
}

export interface Key<TPlugins, TInfo> extends HookableBase<KeyHooks>, PlugableBase<TPlugins, TInfo> { }
mixin(Key, [Hookable, HookableBase, Plugable])

/**
 * Adds on/off toggle states to the instance.
 * See [[KeyOptions.toggle]] for how this works.
 */
export function keyCreateToggle(self: Key): void {
	const handler = (type: string): ProxyHandler<Key> => ({
		get(obj: Key, prop: keyof Key, receiver: any): Key[keyof Key] {
			// Escape hatch
			if (prop === "root") return obj
			// Prevent recursive structure
			if (["on", "off"].includes(prop as string)) return undefined
			// Rename id
			if (prop === "id") return obj[prop] + type
			// Reflect properties/getters/functions properly
			return Reflect.get(obj, prop, receiver)
		},
		// Intercepts Object.values/keys and for in loops
		ownKeys(obj: Key): string[] {
			return Object.keys(obj).filter(prop => !["on", "off"].includes(prop))
		},
		// Intercepts hasOwnProperty
		getOwnPropertyDescriptor(obj: Key, prop: keyof Key): PropertyDescriptor | undefined {
			if (["on", "off", "root"].includes(prop as string)) return
			// eslint-disable-next-line no-prototype-builtins
			return obj.hasOwnProperty(prop)
				? { configurable: true, enumerable: true }
				: undefined
		},
		// Intercepts x in obj
		has(obj: Key, prop: keyof Key): boolean {
			if (["on", "off"].includes(prop as string)) return false
			return prop in obj
		},
	})
	// There's other things we could guard against (like not permitting deletion/reassignment of on/off), but they would just be silly to do anyways

	self.on = new Proxy(self, handler("_on")) as ToggleProxy<Key>
	self.off = new Proxy(self, handler("_off")) as ToggleProxy<Key>
}

export function init(self: any, id: string, opts: RawKey["opts"] = {}): asserts self is KeyOptions {
	self = self ?? {}
	self._id = id
	self.label = opts.label ?? id
	self.variants = opts.variants ?? false
	self.is = {
		toggle: opts.is?.toggle ?? false,
		modifier: opts.is?.modifier ?? false,
		mouse: opts.is?.mouse ?? false,
		wheel: opts.is?.wheel ?? false,
	}
	if (opts.is?.toggle) {
		const toggle = opts.is.toggle
		self.is.toggle = {
			native: toggle === true
				? true
				: toggle.native ?? true,
		}
	}
	Object.freeze(self.is)
	Object.freeze(self.variants)
}
