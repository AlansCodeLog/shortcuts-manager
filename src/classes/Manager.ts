import { crop, indent } from "@alanscodelog/utils"

import type { Commands } from "./Commands"
import type { Keys } from "./Keys"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import type { Shortcuts } from "./Shortcuts"

import { isModifierKey, isToggleRootKey, KnownError } from "@/helpers"
import { checkManagerShortcuts } from "@/helpers/checkManagerShortcuts"
import { defaultManagerCallback } from "@/helpers/defaultManagerCallback"
import { ERROR, ManagerErrorCallback, ToggleRootKey } from "@/types"
import type { AnyInputEvent } from "@/types/manager"

import { Context, Key, KeysSorter, KeysStringifier, Shortcut } from "."


const sEnabled = Symbol("enabled")
const sTimers = Symbol("timers")

export class Manager {
	context: Context
	keys: Keys
	commands: Commands
	shortcuts: Shortcuts
	stringifier: KeysStringifier
	private [sTimers]: Map<Key, number | NodeJS.Timeout> = new Map()
	/**
	 * There are cases when a keyup event might never fire because it happened out of focus.
	 *
	 * This sets how long to wait after the last keydown event before simulating a keyup event.
	 *
	 * This will mean a key release is simulated when the user looses focus (since the element will stop getting keydown events).
	 */
	autoReleaseDelay: number
	private [sEnabled]: boolean = true
	sorter: KeysSorter
	private readonly nativeToggleKeys: ToggleRootKey[]
	private readonly nativeModifierKeys: Key[]
	private readonly _boundKeydown: Manager["_keydown"]
	private readonly _boundKeyup: Manager["_keyup"]
	private readonly _boundMousedown: Manager["_mousedown"]
	private readonly _boundMouseup: Manager["_mouseup"]
	private readonly _boundWheel: Manager["_wheel"]
	/**
	 * The current chain of chords.
	 */
	readonly chain: Key[][]
	/**
	 * The error callback for recoverable errors such as multiple shortcuts matching, or no shortcut matching once a chord chain has been "started".
	 *
	 * Usually you will want to clear the manager's chain when this happens and display the error to the user.
	 *
	 * In the case of multiple valid shortcuts, if you trigger any of the shortcuts "manually" note that you will to simulate both the keydown/keyup calls if you differentiate between them.
	 *
	 * The default callback logs the error and clears the chain.
	 *
	 * Note the event parameter might be undefiend because it might not exist when the manager needs to emulate a key release. See {@link Manager.autoReleaseDelay}
	 */
	cb: ManagerErrorCallback<ERROR.MULTIPLE_MATCHING_SHORTCUTS | ERROR.NO_MATCHING_SHORTCUT> = defaultManagerCallback
	/**
	 * Create a manager which can track key states, layouts, and trigger shortcuts. Basically the brains of the operation.
	 *
	 * Managers need to be created then attached to an element. You could make several managers for different areas of your application or use single manager and different contexts to differ between them.
	 *
	 * ```ts
	 * const manager = new Manager(
	 * 	// it must be passed existing instances
	 * 	// it cannot contruct them from plain objects like other classes can
	 * 	new Keys([...]),
	 * 	new Commands([...]),
	 * 	new Shortcuts([...]),
	 * 	new Context({...}),
	 * 	// specify a callback for manager errors
	 * 	(error, manager) => { manager.clear() },
	 * 	{
	 * 		// you can pass a custom sorter/stringifier and this will set it for all instances
	 * 		sorter,
	 * 		stringifier,
	 * 		// for when keyup events happen out of focus
	 * 		autoReleaseDelay: 500
	 * 	},
	 * )
	 *
	 * // this will listen to the correct key/mouse/wheel events on the element
	 * manager.attach(document)
	 * ```
	 *
	 * You will then not need to do much else. It will take care of setting the pressed state of keys, the state of the current chord chain (see {@link Manager.chain}), finding a matching shortcut if it exists, and triggering it's command.
	 *
	 * The way this works is that when a key is pressed it's added to the current chord in the chain. If the chain matches a shortcut's chain that can be triggered (it must be enabled, it must have a command and a function to execute, and it's condition and it's command's condition must evaluate to true), the command's execute function is triggered with `isKeydown = true`, see {@link Command.execute}.
	 *
	 * If there are no shortcuts to trigger but there are "potential shortcuts" that start with the current chain and could trigger, if the current chord contains any non-modifier keys, an empty chord is added to the chain and the process repeats.
	 *
	 * If there are no shortcuts and no potential shortcuts, {@link ERROR.NO_MATCHING_SHORTCUT} is thrown. You will probably want to just return true, let the chain clear itself. When the chain is cleared (see {@link Manager.clearChain}/{@link Manager.setChain}), the manager will not add/remove keys from the chain until all keys are unpressed. Pressed state is still set/tracked though.
	 *
	 * The moment a key is released after a shortcut is triggered, the command's execute function is fired again with `isKeydown = false`.
	 *
	 * ### Other
	 *
	 * - If you need to emulate keypresses see {@link Emulator}.
	 *
	 * - The creation of the manager can throw since it checks whether shortcuts contain known keys/commands.
	 *
	 * Other common things you might want/need to do though:
	 *
	 * - Add a shortcut to a command that can clear the manager's chord chain (e.g. `Escape`).
	 *
	 * - Add a set hook to listen to key presses to display that for the user.
	 *
	 * - Add a trigger/allows hook for shortcut/command triggers if there is some outside state you want to check that is not easily translated to the context object. Note that not triggering a shortcut will not clear the current chord chain.
	 */
	constructor(
		keys: Keys,
		commands: Commands,
		shortcuts: Shortcuts,
		context: Context,
		cb?: Manager["cb"],
		{
			stringifier,
			sorter,
			autoKeyupDelay = 500,
		}: {
			stringifier?: KeysStringifier
			sorter?: KeysSorter
			autoKeyupDelay?: number
		} = {},
	) {
		if (cb) this.cb = cb

		this.chain = [[]]

		this.context = context
		this.stringifier = stringifier ?? defaultStringifier
		this.sorter = sorter ?? defaultSorter
		this.autoReleaseDelay = autoKeyupDelay

		checkManagerShortcuts(shortcuts, keys, commands, this.stringifier)

		this.keys = keys
		this.keys.stringifier = this.stringifier
		this.nativeToggleKeys = this.keys.query(key => key.is.toggle === "native" && isToggleRootKey(key), true) as ToggleRootKey[]
		this.nativeModifierKeys = this.keys.query(key => key.is.modifier === "native", true)

		this.keys.addHook("add", entry => {
			if (entry.is.toggle === "native"
				&& isToggleRootKey(entry)
				&& !this.nativeToggleKeys.includes(entry as ToggleRootKey)
			) {
				this.nativeToggleKeys.push(entry as ToggleRootKey)
			}
			if (entry.is.modifier === "native" && !this.nativeModifierKeys.includes(entry)) {
				this.nativeModifierKeys.push(entry)
			}
		})
		this.keys.addHook("remove", entry => {
			const i = this.nativeToggleKeys.indexOf(entry as ToggleRootKey)
			if (i > -1) {
				this.nativeToggleKeys.splice(i)
			}
			const i2 = this.nativeModifierKeys.indexOf(entry)
			if (i2 > -1) {
				this.nativeToggleKeys.splice(i)
			}
		})

		this.commands = commands

		this.shortcuts = shortcuts
		this.shortcuts.stringifier = this.stringifier
		this.shortcuts.stringifier = this.stringifier
		this.shortcuts.sorter = this.sorter

		this._boundKeydown = this._keydown.bind(this)
		this._boundKeyup = this._keyup.bind(this)
		this._boundMousedown = this._mousedown.bind(this)
		this._boundMouseup = this._mouseup.bind(this)
		this._boundWheel = this._wheel.bind(this)
	}
	protected _awaitingKeyup: boolean = false
	protected _untrigger: false | Shortcut = false
	/**
	 * A list of currently pressed keys for convenience.
	 *
	 * It's just a wrapper around querying the key set for pressed keys.
	 *
	 * It is *not* cleared by {@link Manager.clearChain}.
	 */
	pressedKeys(): Key[] {
		return this.keys.query(key => key.pressed, true)
	}
	/**
	 * Attach the manager to an element so it can listen to the needed event listeners.
	 */
	attach(el: { addEventListener: HTMLElement["addEventListener"] }): void {
		el.addEventListener("keydown", this._boundKeydown)
		el.addEventListener("keyup", this._boundKeyup)
		el.addEventListener("wheel", this._boundWheel)
		el.addEventListener("mousedown", this._boundMousedown)
		el.addEventListener("mouseup", this._boundMouseup)
	}
	/**
	 * Detach the manager from an element and remove all it's event listeners.
	 */
	detach(el: { removeEventListener: HTMLElement["removeEventListener"] }): void {
		el.removeEventListener("keydown", this._boundKeydown)
		el.removeEventListener("keyup", this._boundKeyup)
		el.removeEventListener("wheel", this._boundWheel)
		el.removeEventListener("mousedown", this._boundMousedown)
		el.removeEventListener("mouseup", this._boundMouseup)
	}
	/**
	 * Return whether the current chord chain state partially matches a shortcut which can be triggered.
	 *
	 * Returns false if awaiting keyup.
	 */
	inChain(): boolean {
		if (this._awaitingKeyup) return false
		const shortcuts = this.shortcuts.query(shortcut =>
			shortcut.enabled &&
			shortcut.command &&
			shortcut.equalsKeys(this.chain, this.chain.length) &&
			shortcut.condition.eval(this.context) &&
			(shortcut.command === undefined || shortcut.command.condition.eval(this.context))
		)
		if (!shortcuts) return false
		return shortcuts.length > 0
	}
	/**
	 * Clears the chain using {@link Manager.setChain}. See it for details.
	 */
	clearChain(): void {
		this.setChain([[]])
	}
	/**
	 * In the rare case you might want to set the chain, this will set it properly such that:
	 *
	 * If there are still keys being pressed, the manager waits until they are all released before allowing keys to be added to the chain again.
	 *
	 * This prevents us from getting into potentially invalid states or triggering shortcuts when we shouldn't.
	 */
	setChain(keys: Key[][]): void {
		// @ts-expect-error is only publicly readonly
		this.chain = keys
		if (this.pressedKeys.length > 0) {
			this._awaitingKeyup = true
		}
		this._awaitingKeyup = true
	}
	/**
	 * Force clears/resets all state. Clears the chain and sets all keys to unpressed.
	 *
	 * Useful for testing.
	 *
	 * @param opts
	 * @param opts.ignoreNative Do not change state of native modifier/toggle keys
	 */
	forceClear({ ignoreNative = false }: { ignoreNative?: false } = {}): void {
		this.clearChain()
		this._untrigger = false
		this._awaitingKeyup = false
		for (const key of Object.values(this.keys.entries)) {
			if ((key.is.modifier || key.is.toggle === "native") && ignoreNative) return
			key.set("pressed", false)
			if (isToggleRootKey(key)) {
				key.on!.set("pressed", false)
				key.off!.set("pressed", false)
			}
		}
	}
	enable(): void {
		this[sEnabled] = true
	}
	/**
	 * Disables the manager so it will stop processing all events and calls {@link Manager.clearChain}
	 */
	disable(): void {
		this[sEnabled] = false
		this.clearChain()
	}
	protected _canTrigger(): false | KnownError<ERROR.MULTIPLE_MATCHING_SHORTCUTS> | Shortcut {
		const shortcuts = this.shortcuts.query(shortcut => shortcut.triggerableBy(this.chain, this.context))
		if (shortcuts.length === 0) return false
		if (shortcuts.length > 1) {
			return new KnownError(ERROR.MULTIPLE_MATCHING_SHORTCUTS, crop`Multiple commands are assigned to the key combination ${this.stringifier.stringify(this.chain)}:
			${indent(shortcuts.map(shortcut => shortcut.command!.name).join("\n"), 4)}
			`, { shortcuts })
		} else {
			return shortcuts[0]
		}
	}
	protected _addToChain(keys: Key[], e: AnyInputEvent): void {
		// the chain was just cleared
		// the user could have released only part of the keys then pressed others
		// we should ignore all keypresses until they are all released
		if (this._awaitingKeyup) return
		const lastChord = this.chain[this.chain.length - 1]
		for (const key of keys) {
			if (!lastChord.includes(key) && !this._awaitingKeyup) {
				lastChord.push(key)
				this.sorter.sort(lastChord)
				this._checkTrigger(e)
			}
		}
	}
	protected _checkTrigger(e?: AnyInputEvent): void {
		if (this._untrigger) {
			this._untrigger.command!.execute(false, this._untrigger.command!, this._untrigger, this, e)
			this._untrigger = false
		}
		const res = this._canTrigger()
		if (res instanceof Error) {
			this.cb(res, this, e)
		} else if (res instanceof Shortcut) {
			this._untrigger = res
			res.command!.execute(true, res.command!, res, this, e)
		}
		if (this.chain[this.chain.length - 1].find(key => !isModifierKey(key))) {
			if (this.inChain()) {
				this.chain.push([])
				this._awaitingKeyup = true
			} else if (!res && this.chain.length > 1) {
				const error = new KnownError(ERROR.NO_MATCHING_SHORTCUT, "A chord containing a non-modifier key was pressed while in a chord chain, but no shortcut found to trigger.", { chain: this.chain })
				this.cb(error, this, e)
			}
		}
	}
	protected _removeFromChain(keys: Key[], e?: AnyInputEvent): void {
		if (this._untrigger) {
			this._untrigger.command!.execute(false, this._untrigger.command!, this._untrigger, this, e)
			this._untrigger = false
		}
		const lastChord = this.chain[this.chain.length - 1]

		if (this._awaitingKeyup) {
			if (this.pressedKeys.length === 0) {
				this._awaitingKeyup = false
			}
		} else {
			for (const key of keys) {
				const i = lastChord.indexOf(key)

				if (i > -1) {
					lastChord.splice(i, 1)
					this._checkTrigger(e)
				}
			}
		}
	}
	protected _setEmulatedToggleState(key: Key, value: boolean): void {
		key.on!.set("pressed", value)
		key.off!.set("pressed", !value)
	}

	protected _setKeyTimer(key: Key): void {
		this[sTimers].set(key, setTimeout(() => {
			key.set("pressed", false)
			this._removeFromChain([key], undefined)
		}, this.autoReleaseDelay))
	}
	protected _clearKeyTimer(key: Key): void {
		const timer = this[sTimers].get(key)
		clearTimeout(timer as number)
	}
	protected _setKeyState(keys: Key[], state: boolean): void {
		for (const key of keys) {
			key.set("pressed", state)
			this._clearKeyTimer(key)
			if (state) {
				// toggles are considered active on keydown
				if (key.is.toggle === "emulated") {
					// state was never set
					if (key.on!.pressed && key.off!.pressed) {
						throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key })
					}
					if (!key.on!.pressed && !key.off!.pressed) {
						this._setEmulatedToggleState(key, true)
					} else if (key.on!.pressed) {
						this._setEmulatedToggleState(key, false)
					} else if (key.off!.pressed) {
						this._setEmulatedToggleState(key, true)
					}
				}
				this._setKeyTimer(key)
			}
		}
	}
	protected getModifierState(key: Key, e: AnyInputEvent): boolean {
		return [key.id, ...key.variants ?? []].find(code => e.getModifierState(code)) !== undefined
	}
	/**
	 * Should be checked after we attempt to process the event and set key states.
	 *
	 * This should cause it to only actually change the state if it was changed off-focus.
	 *
	 * Technically not neccesary with wheel/mouse events, but ordered similarly for consistency.
	 *
	 * Modifiers need to be added/removed from the chain on changes, but not toggles.
	 */
	protected _checkSpecialKeys(e: AnyInputEvent): void {
		for (const key of this.nativeToggleKeys) {
			if (key.on.pressed && key.off.pressed) {
				throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key as Key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key: key as Key })
			}
			// this does not guarantee the key code is valid
			// it just returns false even for made up keys
			if (this.getModifierState(key as Key, e)) {
				if (!key.on.pressed) {
					key.on.set("pressed", true)
					key.off.set("pressed", false)
				}
			} else {
				if (key.on.pressed) {
					key.on.set("pressed", false)
					key.off.set("pressed", true)
				}
			}
		}
		const added = []
		const removed = []
		for (const key of this.nativeModifierKeys) {
			if (this.getModifierState(key, e)) {
				if (!key.pressed) {
					key.set("pressed", true)
					this._clearKeyTimer(key)
					this._setKeyTimer(key)
					added.push(key)
				}
			} else {
				if (key.pressed) {
					key.set("pressed", false)
					this._clearKeyTimer(key)
					this._setKeyTimer(key)
					removed.push(key)
				}
			}
		}

		this._addToChain(added, e)
		this._removeFromChain(removed, e)
	}
	protected _keydown(e: KeyboardEvent): void {
		if (!this[sEnabled]) return
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e)
		this._addToChain(keys, e)
	}
	protected _keyup(e: KeyboardEvent): void {
		if (!this[sEnabled]) return
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)) && key.pressed)!
		this._setKeyState(keys, false)
		this._checkSpecialKeys(e)
		this._removeFromChain(keys, e)
	}
	protected _wheel(e: WheelEvent): void {
		if (!this[sEnabled]) return
		const dir = e.deltaY < 0 ? "Up" : "Down"
		const code = `Wheel${dir}`
		const keys = this.keys.query(key => (key.id === code || key.variants?.includes(code)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e)
		this._addToChain(keys, e)
		this._setKeyState(keys, false)
		this._removeFromChain(keys, e)
	}
	protected _mousedown(e: MouseEvent): void {
		if (!this[sEnabled]) return
		const button = e.button as any as string
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e)
		this._addToChain(keys, e)
	}
	protected _mouseup(e: MouseEvent): void {
		if (!this[sEnabled]) return
		const button = e.button as any as string
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && key.pressed)!
		this._setKeyState(keys, false)
		this._checkSpecialKeys(e)
		this._removeFromChain(keys, e)
	}
}
