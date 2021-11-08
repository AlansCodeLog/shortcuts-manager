import { Key } from "./classes";

const shift = new Key("Shift", { variants: ["ShiftLeft", "ShiftRight"] })
const control = new Key("Control", { variants: ["ControlLeft", "ControlRight"] })
const alt = new Key("Alt", { variants: ["AltLeft", "AltRight"] })
const meta = new Key("Meta", { variants: ["MetaLeft", "MetaRight"] })

export const en_layout = [
	[
		new Key("Escape"),
		new Key("Digit1"),
		new Key("Digit2"),
		new Key("Digit3"),
		new Key("Digit4"),
		new Key("Digit5"),
		new Key("Digit6"),
		new Key("Digit7"),
		new Key("Digit8"),
		new Key("Digit9"),
		new Key("Minus"),
		new Key("Equal"),
		new Key("Backspace"),
	],
	[
		new Key("Tab"),
		new Key("KeyQ"),
		new Key("KeyW"),
		new Key("KeyE"),
		new Key("KeyR"),
		new Key("KeyT"),
		new Key("KeyY"),
		new Key("KeyU"),
		new Key("KeyI"),
		new Key("KeyO"),
		new Key("KeyP"),
		new Key("BracketLeft"),
		new Key("BracketRight"),
		new Key("Backslash"),
	],
	[
		new Key("CapsLock"),
		new Key("KeyA"),
		new Key("KeyS"),
		new Key("KeyD"),
		new Key("KeyF"),
		new Key("KeyG"),
		new Key("KeyH"),
		new Key("KeyJ"),
		new Key("KeyK"),
		new Key("KeyL"),
		new Key("Semicolon"),
		new Key("Quote"),
		new Key("Enter"),
	],
	[
		shift,
		new Key("KeyZ"),
		new Key("KeyX"),
		new Key("KeyC"),
		new Key("KeyV"),
		new Key("KeyB"),
		new Key("KeyN"),
		new Key("KeyM"),
		new Key("Comma"),
		new Key("Period"),
		new Key("Slash"),
		shift
	],
	[
		control,
		meta,
		alt,
		new Key("space"),
		alt,
		new Key("ContextMenu"),
		control
	]
]
