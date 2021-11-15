import type { AnyFunction } from "@alanscodelog/utils"

import { EmulatedEvent } from "./EmulatedEvent"


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
	listeners: {
		keydown?: AnyFunction
		keyup?: AnyFunction
		wheel?: AnyFunction
		mousedown?: AnyFunction
		mouseup?: AnyFunction
	} = {
			keydown: undefined,
			keyup: undefined,
			wheel: undefined,
			mousedown: undefined,
			mouseup: undefined,
		}
	initiated: boolean = false
	addEventListener(type: string, func: AnyFunction): void {
		this.listeners[type as keyof Emulator["listeners"]] = func
		this.initiated = true
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
	fire(str: string, modifiers: string[] = []): void {
		if (!this.initiated) {
			throw new Error("Emulator not initiated.")
		}
		const keys = str.split(/(\s+)/).filter(part => part.trim() !== "")
		for (const key of keys) {
			if (mouseButtons.includes(key)) {
				this.press("mouse", key, modifiers)
				this.release("mouse", key, modifiers)
			} else if (mouseButtonsDown.includes(key)) {
				this.press("mouse", key[1], modifiers)
			} else if (mouseButtonsUp.includes(key)) {
				this.release("mouse", key[1], modifiers)
			} else if (wheelKeys.includes(key)) {
				this.press("wheel", key, modifiers)
			} else if (key.endsWith("+")) {
				this.press("key", key.slice(0, key.length - 1), modifiers)
			} else if (key.endsWith("-")) {
				this.release("key", key.slice(0, key.length - 1), modifiers)
			} else {
				console.log({ key })

				this.press("key", key, modifiers)
				this.release("key", key, modifiers)
			}
		}
	}
	press(type: "mouse" | "wheel" | "key", key: string, modifiers: string[] = []): void {
		switch (type) {
			case "mouse": {
				const event = new EmulatedEvent("mousedown", { button: parseInt(key, 10) }, modifiers)
				this.listeners.mousedown!(event)
			} break
			case "wheel": {
				const event = new EmulatedEvent("wheel", { deltaY: key === "wheelDown" ? 1 : 0 }, modifiers)
				this.listeners.wheel!(event)
			} break
			case "key": {
				const event = new EmulatedEvent("keydown", { code: key }, modifiers)
				this.listeners.keydown!(event)
			} break
		}
	}
	release(type: "mouse" | "key", key: string, modifiers: string[] = []): void {
		switch (type) {
			case "mouse": {
				const event = new EmulatedEvent("mousedown", { button: parseInt(key, 10) }, modifiers)
				this.listeners.mouseup!(event)
			} break
			case "key": {
				const event = new EmulatedEvent("keydown", { code: key }, modifiers)
				this.listeners.keyup!(event)
			} break
		}
	}
}

