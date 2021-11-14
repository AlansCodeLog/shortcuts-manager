import { crop, indent } from "@alanscodelog/utils"

import type { Commands } from "./Commands"
import type { Keys } from "./Keys"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import type { Shortcuts } from "./Shortcuts"

import { isModifierKey, isToggleRootKey, KnownError } from "@/helpers"
import { defaultManagerCallback } from "@/helpers/defaultManagerCallback"
import { ERROR, ManagerErrorCallback, ToggleRootKey } from "@/types"
import type { AnyInputEvent } from "@/types/manager"

import { Context, Key, KeysSorter, KeysStringifier, Shortcut } from "."


export class Manager {
	context: Context
	keys: Keys
	commands: Commands
	shortcuts: Shortcuts
	stringifier: KeysStringifier
	sorter: KeysSorter
	nativeToggleKeys: ToggleRootKey[]
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
	 * If you need to emulate keypresses see {@link Emulator}
	 *
	 * TODO
	 * Some common things you might want/need to do though:
	 *
	 * - Add a shortcut to a command that can clear the manager's chord chain (e.g. `Escape`).
	 *
	 * - Add a set hook to listen to key presses to display that for the user.
	 *
	 * - Add a trigger/allows hook for shortcut/command triggers if there is some outside state you want to check that is not easily translated to the context object. Note that not triggering a shortcut will not clear the current chord chain.
	 *
	 *
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
		}: {
			stringifier?: KeysStringifier
			sorter?: KeysSorter
		} = {},
	) {
		if (cb) this.cb = cb
		// todo check shortcuts only contain keys passed
		this.chain = [[]]

		this.context = context
		this.stringifier = stringifier ?? defaultStringifier
		this.sorter = sorter ?? defaultSorter

		this.keys = keys
		this.keys.stringifier = this.stringifier
		this.nativeToggleKeys = this.keys.query(key => key.is.toggle === "native" && isToggleRootKey(key), true) as ToggleRootKey[]
		this.keys.addHook("add", entry => {
			if (entry.is.toggle === "native"
				&& isToggleRootKey(entry)
				&& !this.nativeToggleKeys.includes(entry as ToggleRootKey)
			) {
				this.nativeToggleKeys.push(entry as ToggleRootKey)
			}
		})
		this.keys.addHook("remove", entry => {
			const i = this.nativeToggleKeys.indexOf(entry as ToggleRootKey)
			if (i > 0) {
				this.nativeToggleKeys.splice(i)
			}
		})

		this.commands = commands

		this.shortcuts = shortcuts
		this.shortcuts.stringifier = this.stringifier
		this.shortcuts.stringifier = this.stringifier
		this.shortcuts.sorter = this.sorter
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
		el.addEventListener("keydown", this._keydown)
		el.addEventListener("keyup", this._keyup)
		el.addEventListener("wheel", this._wheel)
		el.addEventListener("mousedown", this._mousedown)
		el.addEventListener("mouseup", this._mouseup)
	}
	/**
	 * Detach the manager from an element and remove all it's event listeners.
	 */
	detach(el: { removeEventListener: HTMLElement["removeEventListener"] }): void {
		el.removeEventListener("keydown", this._keydown)
		el.removeEventListener("keyup", this._keyup)
		el.removeEventListener("wheel", this._wheel)
		el.removeEventListener("mousedown", this._mousedown)
		el.removeEventListener("mouseup", this._mouseup)
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
	protected _canTrigger(): false | KnownError<ERROR.MULTIPLE_MATCHING_SHORTCUTS> | Shortcut {
		const shortcuts = this.shortcuts.query(shortcut =>
			shortcut.enabled &&
			shortcut.command &&
			shortcut.equalsKeys(this.chain) &&
			shortcut.condition.eval(this.context) &&
			(shortcut.command === undefined || shortcut.command.condition.eval(this.context))
		)
		if (!shortcuts) return false
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
	protected _checkTrigger(e: AnyInputEvent): void {
		if (this._untrigger) {
			this._untrigger.command!.execute(false, this._untrigger.command!, this._untrigger, this, e)
		}
		const res = this._canTrigger()
		if (res instanceof Error) {
			this.cb(res, this, e)
		} else if (res instanceof Shortcut) {
			this._untrigger = res
			res.command!.execute(true, res.command!, res, this, e)
		}
		if (this.chain.length > 1 && this.chain[this.chain.length - 1].find(key => !isModifierKey(key))) {
			if (this.inChain()) {
				this.chain.push([])
				this._awaitingKeyup = true
			} else if (!res) {
				const error = new KnownError(ERROR.NO_MATCHING_SHORTCUT, "A chord containing a non-modifier key was pressed while in a chord chain, but no shortcut found to trigger.", { chain: this.chain })
				this.cb(error, this, e)
			}
		}
	}
	protected _removeFromChain(keys: Key[], e: AnyInputEvent): void {
		if (this._untrigger) {
			this._untrigger.command!.execute(false, this._untrigger.command!, this._untrigger, this, e)
		}
		const lastChord = this.chain[this.chain.length - 1]
		if (this._awaitingKeyup) {
			if (this.pressedKeys.length === 0) {
				this._awaitingKeyup = false
			}
		} else {
			for (const key of keys) {
				const i = lastChord.indexOf(key)
				if (i > 0) {
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
	protected _setKeyState(keys: Key[], state: boolean): void {
		for (const key of keys) {
			key.set("pressed", state)
			// toggles are considered active on keydown
			if (key.is.toggle === "emulated" && state) {
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
		}
	}
	/**
	 * Should be checked after we attempt to process the event and set key states.
	 * This should cause it to only actually change the state if it was changed off-focus.
	 *
	 * Technically not neccesary with wheel/mouse events, but ordered similarly for consistency.
	 *
	 */
	protected _checkNativeToggleKeys(e: AnyInputEvent): void {
		for (const key of this.nativeToggleKeys) {
			if (key.on.pressed && key.off.pressed) {
				throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key as Key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key: key as Key })
			}
			// this does not guarantee the key code is valid
			// it just returns false even for made up keys
			if (e.getModifierState(key.id)) {
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
	}
	protected _keydown(e: KeyboardEvent): void {
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkNativeToggleKeys(e)
		this._addToChain(keys, e)
	}
	protected _keyup(e: KeyboardEvent): void {
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)) && key.pressed)!
		this._setKeyState(keys, false)
		this._checkNativeToggleKeys(e)
		this._removeFromChain(keys, e)
	}
	protected _wheel(e: WheelEvent): void {
		const dir = e.deltaY < 0 ? "Up" : "Down"
		const code = `Wheel${dir}`
		const keys = this.keys.query(key => (key.id === code || key.variants?.includes(code)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkNativeToggleKeys(e)
		this._addToChain(keys, e)
		this._setKeyState(keys, false)
		this._removeFromChain(keys, e)
	}
	protected _mousedown(e: MouseEvent): void {
		const button = e.button as any as string
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkNativeToggleKeys(e)
		this._addToChain(keys, e)
	}
	protected _mouseup(e: MouseEvent): void {
		const button = e.button as any as string
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && key.pressed)!
		this._setKeyState(keys, false)
		this._checkNativeToggleKeys(e)
		this._removeFromChain(keys, e)
	}
}
