import type { AnyFunction } from "@alanscodelog/utils"

import { EmulatedEvent } from "./EmulatedEvent.js"
import type { Keys } from "./Keys.js"


const mouseButtons = ["0", "1", "2", "3", "4", "5"]
const mouseButtonsDown = mouseButtons.map(b => `${b}+`)
const mouseButtonsUp = mouseButtons.map(b => `${b}-`)
const wheelKeys = ["wheelUp", "wheelDown"]

/**
 * A simple key emulator for testing purposes. Should be hooked up to a manager class as if it was an element:
 * ```ts
 * const emulator = new Emulator()
 * manager.attach(emulator)
 * // press and release a
 * emulator.fire("KeyA")
 * // in case the pressed keys need to be cleared you can use the manager to do so:
 * manager.clear()
 * ```
 */
export class Emulator {
	validKeys?: Keys

	constructor(keys?: Keys) {
		this.validKeys = keys
	}

	listeners: {
		keydown: AnyFunction[]
		keyup: AnyFunction[]
		wheel: AnyFunction[]
		mousedown: AnyFunction[]
		mouseup: AnyFunction[]
		mouseenter: AnyFunction[]
	} = {
			keydown: [],
			keyup: [],
			wheel: [],
			mousedown: [],
			mouseenter: [],
			mouseup: [],
		}

	initiated: boolean = false

	addEventListener(type: string, func: AnyFunction): void {
		this.listeners[type as keyof Emulator["listeners"]].push(func)
		this.initiated = true
	}

	removeEventListener(type: string, func: AnyFunction): void {
		const i = this.listeners[type as keyof Emulator["listeners"]].indexOf(func)
		if (i === -1) throw new Error(`Listener ${type} could not be found.`)
		this.listeners[type as keyof Emulator["listeners"]].splice(i, 1)
	}

	mouseenter(modifiers: string[] = []): void {
		const event = new EmulatedEvent("mouseenter", { }, modifiers)
		this._dispatch("mouseenter", event)
	}

	/**
	 *
	 * Emulate pressing/releasing keys.
	 *
	 * ```ts
	 * // press and release a
	 * emulator.fire("KeyA")
	 * // hold A down
	 * emulator.fire("KeyA+")
	 * // release A
	 * emulator.fire("KeyA-")
	 * // press Ctrl+A
	 * emulator.fire("Ctrl+ KeyA Ctrl-")
	 *
	 * // to truly simulate pressing native modifiers, pass all modifiers pressed as an array
	 * emulator.fire("Ctrl+ KeyA Ctrl-", ["ControlLeft"])
	 *
	 * // emulate a modifier state change out of focus
	 * // e.g. user focuses out, holds control+A, and focuses back
	 * // only KeyA would fire
	 *	emulator.fire("KeyA+", ["ControlLeft"])
	 * // they release both in focus
	 * emulater.fire("KeyA- Ctrl-")
	 *
	 * // to simulate them releasing out of focus again you will have to add a delay since no events would fire
	 * delay(1000)
	 *
	 * ```
	 *
	 * Keys should be a {@link KeyboardEvent.code} (though this is not validated) seperated by one or more whitespace characters*. For buttons `0-5` can be used. For wheel events, you can pass `wheelUp/Down` to set the deltaY respectively which is how the manager gets the direction.
	 *
	 * `+` and `-` are used to indicate keydown and keyup respectively (except for wheel events*). This can seem confusing but think of the signs as adding/removing from the set of currently held keys. If no `+/-` is given, both are fired.
	 *
	 * There is no need to handle toggle keys in any special way. You should fire the root code normally (e.g. `emulator.fire("Capslock")` or `emulator.fire("Capslock+ Capslock-")`)
	 *
	 * \* Multiple whitespace characters have no real meaning, but in tests usually I use them to more easily delimite chords.
	 * \*\* Wheel events do not have keyup/keydown so passing `wheelUp+/-` will incorrectly create a keyboard event.
	 *
	 * Note: While the emulator is aware of correct mouse/wheel names, it does not check key names are valid.
	 */
	fire(str: string, modifiers: string[] = [], validKeys?: Keys): void {
		if (!this.initiated) {
			// eslint-disable-next-line no-console
			console.warn("No manager attached to the emulator.")
			return
		}
		const keys = str.split(/(\s+)/).filter(part => part.trim() !== "")
		for (const key of keys) {
			if (mouseButtons.includes(key)) {
				this.press("mouse", key, modifiers, validKeys)
				this.release("mouse", key, modifiers, validKeys)
			} else if (mouseButtonsDown.includes(key)) {
				this.press("mouse", key[0], modifiers, validKeys)
			} else if (mouseButtonsUp.includes(key)) {
				this.release("mouse", key[0], modifiers, validKeys)
			} else if (wheelKeys.includes(key)) {
				this.press("wheel", key, modifiers, validKeys)
			} else if (key.endsWith("+")) {
				this.press("key", key.slice(0, key.length - 1), modifiers, validKeys)
			} else if (key.endsWith("-")) {
				this.release("key", key.slice(0, key.length - 1), modifiers, validKeys)
			} else {
				this.press("key", key, modifiers, validKeys)
				this.release("key", key, modifiers, validKeys)
			}
		}
	}

	press(type: "mouse" | "wheel" | "key", key: string, modifiers: string[] = [], validKeys?: Keys): void {
		this._checkIsValidKey(key, validKeys)
		switch (type) {
			case "mouse": {
				const event = new EmulatedEvent("mousedown", { button: parseInt(key, 10) }, modifiers)
				this._dispatch("mousedown", event)
			} break
			case "wheel": {
				const event = new EmulatedEvent("wheel", { deltaY: key === "wheelDown" ? 1 : 0 }, modifiers)
				this._dispatch("wheel", event)
			} break
			case "key": {
				const event = new EmulatedEvent("keydown", { code: key }, modifiers)
				this._dispatch("keydown", event)
			} break
		}
	}

	release(type: "mouse" | "key", key: string, modifiers: string[] = [], validKeys?: Keys): void {
		this._checkIsValidKey(key, validKeys)
		switch (type) {
			case "mouse": {
				const event = new EmulatedEvent("mousedown", { button: parseInt(key, 10) }, modifiers)
				this._dispatch("mouseup", event)
			} break
			case "key": {
				const event = new EmulatedEvent("keydown", { code: key }, modifiers)
				this._dispatch("keyup", event)
			} break
		}
	}

	private _checkIsValidKey(key: string, validKeys?: Keys): void {
		const valid = validKeys ?? this.validKeys
		if (valid) {
			if (valid.query(k => k.id === key || k.variants?.includes(key), false) === undefined) {
				throw new Error(`Emulator was asked to fire key not in valid keys array. ${key}`)
			}
		}
	}

	private _dispatch<T extends keyof Emulator["listeners"]>(type: T, event: EmulatedEvent<T>): void {
		for (const listener of this.listeners[type]) {
			listener(event)
		}
	}
}

