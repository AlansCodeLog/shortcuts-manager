import type { AnyFunction } from "@alanscodelog/utils";

const mouseButtons = ["0", "1", "2", "3", "4", "5"]
const mouseButtonsDown = mouseButtons.map(b => b + "+")
const mouseButtonsUp = mouseButtons.map(b => b + "-")
const wheelKeys = ["wheelUp", "wheelDown"]

/**
 * A simple key emulator for testing purposes. Should be hooked up to a manager class as if it was an element:
 * ```ts
 * const emulator = new Emulator()
 * manager.attach(emulator)
 * // press and release a
 * emulator.fire("KeyA")
 * // hold A down
 * emulator.fire("KeyA+")
 * // release A
 * emulator.fire("KeyA-")
 * // press Ctrl+A
 * emulator.fire("Ctrl+ KeyA Ctrl-")
 * // in case the pressed keys need to be cleared you can use the manager to do so:
 * manager.clear()
 * ```
 * Keys should be a {@link KeyboardEvent.code} (though this is not validated) seperated by one or more whitespace characters*. For buttons `0-5` can be used. For wheel events, you can pass `wheelUp/Down` to set the deltaY respectively which is how the manager gets the direction.
 *
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
export class Emulator {
	listeners: {
		keydown?: AnyFunction,
		keyup?: AnyFunction,
		wheel?: AnyFunction,
		mousedown?: AnyFunction,
		mouseup?: AnyFunction,
	} = {
		keydown: undefined,
		keyup: undefined,
		wheel: undefined,
		mousedown: undefined,
		mouseup: undefined,
		}
	initiated:boolean = false
	constructor() {
	}
	addEventListener(type: string, func: AnyFunction) {
		this.listeners[type as keyof Emulator["listeners"]] = func
		this.initiated = true
	}
	fire(str: string) {
		if (!this.initiated) {
			throw new Error("Emulator not initiated.")
		}
		const keys = str.split(/(\s+)/).filter(part => part !== "")
		for (let key of keys) {
			if (mouseButtons.includes(key)) {
				this.press("mouse", key)
				this.release("mouse", key)
				continue
			}
			if (mouseButtonsDown.includes(key)) {
				this.press("mouse", key[1])
				continue
			}
			if (mouseButtonsUp.includes(key)) {
				this.release("mouse", key[1])
				continue
			}
			if (wheelKeys.includes(key)) {
				this.press("wheel", key)
				continue
			}
			if (key.endsWith("+")) {
				this.press("key", key.slice(0, key.length-1))
				continue
			}
			if (key.endsWith("-")) {
				this.release("key", key.slice(0, key.length-1))
				continue
			}
			this.press("key", key)
			this.release("key", key)
		}
	}
	press(type: "mouse" | "wheel" | "key", key: string) {
		switch (type) {
			case "mouse": {
				const event = new MouseEvent("mousedown", { button: parseInt(key, 10) })
				this.listeners.mousedown!(event)
			} break
			case "wheel": {
				const event = new WheelEvent("wheel", { deltaY: key === "wheelDown" ? 1 : 0 })
				this.listeners.wheel!(event)
			} break
			case "key": {
				const event = new KeyboardEvent("keydown", { code: key })
				this.listeners.mousedown!(event)
			} break
		}
	}
	release(type: "mouse" | "key", key: string) {
		switch (type) {
			case "mouse": {
				const event = new MouseEvent("mousedown", { button: parseInt(key, 10) })
				this.listeners.mousedown!(event)
			} break
			case "key": {
				const event = new KeyboardEvent("keydown", { code: key })
				this.listeners.mousedown!(event)
			} break
		}
	}
}
