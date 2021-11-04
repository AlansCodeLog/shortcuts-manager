import { KnownError } from "@/helpers";
import { ERROR } from "@/types";
import { AnyFunction, crop, indent } from "@alanscodelog/utils";
import { Context, Key, KeysSorter, KeysStringifier } from ".";
import { Commands } from "./Commands";
import { Keys } from "./Keys";
import { Shortcuts } from "./Shortcuts";


export class Manager {
	context: Context
	keys: Keys
	commands: Commands
	shortcuts: Shortcuts
	stringifier: KeysStringifier
	pressed: Key[][]
	sorter: KeysSorter
	constructor(
		keys: Keys,
		commands: Commands,
		shortcuts: Shortcuts,
		context: Context,
		stringifier: KeysStringifier = new KeysStringifier(),
		sorter: KeysSorter = new KeysSorter(),
	) {
		// todo check shortcuts only contain keys passed
		this.pressed = []
		this.context = context
		this.stringifier = stringifier
		this.sorter = sorter

		this.keys = keys
		this.keys.stringifier = this.stringifier

		this.commands = commands

		this.shortcuts = shortcuts
		this.shortcuts.stringifier = this.stringifier
		this.shortcuts.stringifier = this.stringifier
		this.shortcuts.sorter = this.sorter
	}
	attach(el: HTMLElement) {
		el.addEventListener("keydown", this.keydown)
		el.addEventListener("keyup", this.keyup)
		el.addEventListener("wheel", this.wheel)
		el.addEventListener("mousedown", this.mousedown)
		el.addEventListener("mouseup", this.mouseup)
	}
	detach(el: HTMLElement) {
		el.removeEventListener("keydown", this.keydown)
		el.removeEventListener("keyup", this.keyup)
		el.removeEventListener("wheel", this.wheel)
		el.removeEventListener("mousedown", this.mousedown)
		el.removeEventListener("mouseup", this.mouseup)
	}
	private _setNativeToggleState(key: Key, e: KeyboardEvent | MouseEvent | WheelEvent) {
		if (e instanceof KeyboardEvent) {
			// this does not guarantee the key code is valid
			// it just returns false even for made up keys
			if (e.getModifierState(key.id)) {
				key.on!.set("pressed", true)
				key.off!.set("pressed", false)
			} else {
				key.on!.set("pressed", false)
				key.off!.set("pressed", true)
			}
		} else {
			throw new KnownError(ERROR.INCORRECT_TOGGLE_TYPE, `Key ${key.stringifier.stringify(key)} is a native toggle key but the event fired for it was not a KeyboardEvent so it is not a valid native toggle key.`, { key, event: e })
		}
	}
	private _setKeyState(keys: Key[], state = true, e: KeyboardEvent | MouseEvent | WheelEvent) {
		for (let key of keys) {
			key.set("pressed", state)
			// toggles are considered active on keydown
			if (key.is.toggle && state == true) {
				// state was never set
				if (key.on!.pressed && key.off!.pressed) {
					throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, {key})
				}
				if (!key.on!.pressed && !key.off!.pressed) {
					if (key.is.toggle === "native") {
						this._setNativeToggleState(key, e)
					} else {
						key.on!.set("pressed", true)
						key.off!.set("pressed", false)
					}
				} else if (key.on!.pressed) {
					if (key.is.toggle === "native") {
						this._setNativeToggleState(key, e)
					} else {
						key.on!.set("pressed", false)
						key.off!.set("pressed", true)
					}
				} else if (key.off!.pressed) {
					if (key.is.toggle === "native") {
						this._setNativeToggleState(key, e)
					} else {
						key.on!.set("pressed", true)
						key.off!.set("pressed", false)
					}
				}
			}
		}
	}
	private pressKeys(keys: Key[]) {
		const lastChord = this.pressed[this.pressed.length - 1]
		for (let key of keys) {
			if (!lastChord.includes(key)) {
				lastChord.push(key)
				this.sorter.sort(lastChord)
			}
		}
	}
	canTrigger(): false | KnownError<ERROR.MULTIPLE_MATCHING_SHORTCUTS> | AnyFunction {
		const shortcuts = this.shortcuts.query(shortcut =>
			shortcut.enabled &&
			shortcut.command &&
			shortcut.equalsKeys(this.pressed) &&
			shortcut.condition.eval(this.context) &&
			shortcut.command === undefined || shortcut.command!.condition.eval(this.context)
		)
		if (!shortcuts) return false
		if (shortcuts.length > 1) {
			throw new KnownError(ERROR.MULTIPLE_MATCHING_SHORTCUTS, crop`Multiple commands are assigned to the key combination ${this.stringifier.stringify(this.pressed)}:
			${indent(shortcuts.map(shortcut => shortcut.command!.name).join("\n"), 4)}
			`, { shortcuts })
		} else {
			return shortcuts[0].command!.execute()
		}
	}
	trigger(func: AnyFunction): void {
		func(this)
		this.pressed = []
	}
	inChord(): boolean {
		const shortcuts = this.shortcuts.query(shortcut =>
			shortcut.enabled &&
			shortcut.command &&
			shortcut.equalsKeys(this.pressed, this.pressed.length) &&
			shortcut.condition.eval(this.context) &&
			shortcut.command === undefined || shortcut.command!.condition.eval(this.context)
		)
		if (!shortcuts) return false
		return shortcuts.length > 0
	}
	clear() {
		this.pressed = []
	}
	private releaseKeys(keys: Key[]) {
		const lastChordCopy = [...this.pressed[this.pressed.length - 1]]
		for (let key of keys) {
			const i = lastChordCopy.indexOf(key)
			if (i > 0) {
				lastChordCopy.splice(i, 1)
			}
		}

		if (lastChordCopy.filter(key => !key.is.modifier).length === 0) {
			let func = this.canTrigger()
			if (typeof func === "function") {
				this.trigger(func)
			} else if (this.inChord()) {
				this.pressed.push([])
			} else {
				// no command matches the chords, reset to nothing
				this.pressed = []
			}
		}
	}
	private keydown(e: KeyboardEvent) {
		const keys = this.keys.query(key => key.id === e.code || key.variants?.includes(e.code))!
		this.pressKeys(keys)
		this._setKeyState(keys, true, e)
	}
	private keyup(e: KeyboardEvent) {
		const keys = this.keys.query(key => key.id === e.code || key.variants?.includes(e.code))!
		this.releaseKeys(keys)
		this._setKeyState(keys, false, e)
	}
	private wheel(e: WheelEvent) {
		const dir = e.deltaY < 0 ? "Up" : "Down"
		const code = `Wheel${dir}`
		const keys = this.keys.query(key => key.id === code || key.variants?.includes(code))!
		this._setKeyState(keys, true, e)
		this.pressKeys(keys)
		this._setKeyState(keys, false, e)
		this.releaseKeys(keys)
	}
	private mousedown(e: MouseEvent) {
		const button = e.button as any as string
		const keys =  this.keys.query(key => key.id === button || key.variants?.includes(button))!
		this.pressKeys(keys)
		this._setKeyState(keys, true, e)

	}
	private mouseup(e: MouseEvent) {
		const button = e.button as any as string
		const keys =  this.keys.query(key => key.id === button || key.variants?.includes(button))!
		this.releaseKeys(keys)
		this._setKeyState(keys, false, e)
	}
}
