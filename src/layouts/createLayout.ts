import { calculateAndSetPositionAndSize } from "../helpers/calculateAndSetPositionAndWidth.js"
import type { RawKey } from "../types/keys.js"


const start = 0
const mediaKey = { height: 0.5, width: 4 / 3 }
const setY = <T extends Record<"id", string>>(yVal: number) => (val: T):(T & { y: number }) => {
	(val as any).y = yVal
	return val as any
}

/**
 * Creates the given keyboard layout, assiging the correct sizes and positions to keys.
 *
 * It returns an array of raw keys so that if you're extending {@link Key} you can create them with your extended class (you should override {@link Key.create}).
 *
 * Labels are assigned for most keys in english as a fallback, see {@link labelWithEvent}/{@link labelWithKeyboardMap} for proper labeling during runtime.
 *
 * Currently only supports generating the following layouts: `ansi`, `iso`. Technically the layout returned is a variation of these that includes half height 1.3333u (4u / 3 keys) media keys over the numpad.
 *
 * Pull requests for [standard layouts]([https://www.w3.org/TR/uievents-code) welcomed.
 *
 * You can remove sections using the options. Note that this just removes them and does not do any repositioning. If you only remove the numpad, for example, the media keys will still be placed above it. The idea is to easily allow reducing the size of the created layout to then adjust only a few keys to your liking.
 *
 * Also note the `navigation` section is split into two sections with `navigation` only refering to the 6 `Insert`, `Home`, etc. keys, and `arrowKeys` refering to the arrow keys.
 *
 * This also adds the following classes to some keys: `center-label` for media and arrow keys, and `iso-enter` for the iso enter which requires a different approach to styling (see the demo, it's painful).
 */
 
export function createLayout(
	type: "ansi" | "iso" | "" = "ansi",
	{
		numpad = true,
		mediaKeys = true,
		fn = true,
		navigation = true,
		arrowKeys = true,
	}:
	Partial<Record<"numpad" | "mediaKeys" | "fn" | "navigation" | "arrowKeys", boolean>> = {}
): RawKey[] {
	const keys = [
		...calculateAndSetPositionAndSize([
			{ id: "Escape" as const, label: "Esc" },
			...(fn
				? [
					{ id: "F1" as const, x: 2 },
					{ id: "F2" as const },
					{ id: "F3" as const },
					{ id: "F4" as const },
					{ id: "F5" as const, x: 6.5 },
					{ id: "F6" as const },
					{ id: "F7" as const },
					{ id: "F8" as const },
					{ id: "F9" as const, x: 11 },
					{ id: "F10" as const },
					{ id: "F11" as const },
					{ id: "F12" as const },
				] as const
				: []
			),
		]).map(setY(start + 0)),
		...calculateAndSetPositionAndSize([
			{ id: "Backquote" as const, label: "`" },
			{ id: "Digit1" as const, label: "1" },
			{ id: "Digit2" as const, label: "2" },
			{ id: "Digit3" as const, label: "3" },
			{ id: "Digit4" as const, label: "4" },
			{ id: "Digit5" as const, label: "5" },
			{ id: "Digit6" as const, label: "6" },
			{ id: "Digit7" as const, label: "7" },
			{ id: "Digit8" as const, label: "8" },
			{ id: "Digit9" as const, label: "9" },
			{ id: "Digit0" as const, label: "0" },
			{ id: "Minus" as const, label: "-" },
			{ id: "Equal" as const, label: "=" },
			{ id: "Backspace" as const, width: 2 },
		] as const).map(setY(start + 2)),
		...calculateAndSetPositionAndSize([
			{ id: "Tab" as const, width: 1.5 },
			{ id: "KeyQ" as const, label: "q" },
			{ id: "KeyW" as const, label: "w" },
			{ id: "KeyE" as const, label: "e" },
			{ id: "KeyR" as const, label: "r" },
			{ id: "KeyT" as const, label: "t" },
			{ id: "KeyY" as const, label: "y" },
			{ id: "KeyU" as const, label: "u" },
			{ id: "KeyI" as const, label: "i" },
			{ id: "KeyO" as const, label: "o" },
			{ id: "KeyP" as const, label: "p" },
			{ id: "BracketLeft" as const, label: "[" },
			{ id: "BracketRight" as const, label: "]" },
			type === "ansi"
			? { id: "Backslash" as const, label: "\\", width: 1.5 }
			: type === "iso"
			? { id: "Enter" as const, width: 1.5, height: 2, classes: ["iso-enter"]}
			: {} as never,
		] as const).map(setY(start + 3)),
		...calculateAndSetPositionAndSize([
			{ id: "CapsLock" as const, width: 1.75, isToggle: "native" as const },
			{ id: "KeyA" as const, label: "a" },
			{ id: "KeyS" as const, label: "s" },
			{ id: "KeyD" as const, label: "d" },
			{ id: "KeyF" as const, label: "f" },
			{ id: "KeyG" as const, label: "g" },
			{ id: "KeyH" as const, label: "h" },
			{ id: "KeyJ" as const, label: "j" },
			{ id: "KeyK" as const, label: "k" },
			{ id: "KeyL" as const, label: "l" },
			{ id: "Semicolon" as const, label: ";" },
			{ id: "Quote" as const, label: "'" },
			type === "ansi"
			? { id: "Enter" as const, width: 2.25 }
			: type === "iso"
			? { id: "Backslash" as const, label: "#", width: 1 }
			: {} as never,
		] as const).map(setY(start + 4)),
		...calculateAndSetPositionAndSize([
			...(type === "ansi"
			? [
				{ id: "VirtualShiftLeft" as const, isModifier: "native" as const, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.25 },
			]
			: type === "iso"
			? [
				{ id: "VirtualShiftLeft" as const, isModifier: "native" as const, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 1.25 },
				{ id: "IntlBackslash" as const, label: "\\", width: 1 },
			]
			: []),
			{ id: "KeyZ" as const, label: "z" },
			{ id: "KeyX" as const, label: "x" },
			{ id: "KeyC" as const, label: "c" },
			{ id: "KeyV" as const, label: "v" },
			{ id: "KeyB" as const, label: "b" },
			{ id: "KeyN" as const, label: "n" },
			{ id: "KeyM" as const, label: "m" },
			{ id: "Comma" as const, label: "," },
			{ id: "Period" as const, label: "." },
			{ id: "Slash" as const, label: "/" },
			{
				id: "VirtualShiftRight" as const,
				isModifier: "native" as const,
				label: "Shift",
				variants: ["ShiftLeft", "ShiftRight", "Shift"],
				width: 2.75,
			},
		] as const).map(setY(start + 5)),
		...calculateAndSetPositionAndSize([
			{
				id: "VirtualControlLeft" as const,
				isModifier: "native" as const,
				label: "Ctrl",
				variants: ["ControlLeft", "ControlRight", "Control"],
				width: 1.25,
			},
			{
				id: "VirtualMetaLeft" as const,
				isModifier: "native" as const,
				label: "Meta",
				variants: ["MetaLeft", "MetaRight", "Meta"],
				width: 1.25,
			},
			{
				id: "VirtualAltLeft" as const,
				isModifier: "native" as const,
				label: "Alt",
				variants: ["AltLeft", "AltRight", "Alt"],
				width: 1.25,
			},
			{ id: "Space" as const, label: "", width: 6.25 },
			{
				id: "VirtualAltRight" as const,
				isModifier: "native" as const,
				label: "Alt",
				variants: ["AltLeft", "AltRight", "Alt"],
				width: 1.25,
			},
			{
				id: "VirtualMetaRight" as const,
				isModifier: "native" as const,
				label: "Meta",
				variants: ["MetaLeft", "MetaRight", "Meta"],
				width: 1.25,
			},
			{ id: "ContextMenu" as const, label: "Menu", width: 1.25 },
			{
				id: "VirtualControlRight" as const,
				isModifier: "native" as const,
				label: "Ctrl",
				variants: ["ControlLeft", "ControlRight", "Control"],
				width: 1.25,
			},
		] as const).map(setY(start + 6)),
		...calculateAndSetPositionAndSize([
			{ id: "PrintScreen" as const, label: "PrtScn", x: 15.5 },
			{ id: "ScrollLock" as const, label: "Scroll\nLock", isToggle: "native" as const },
			{ id: "Pause" as const, label: "Pause\nBreak" },
		] as const).map(setY(start)),
		...(navigation
			? [
				...calculateAndSetPositionAndSize([
					{ id: "Insert" as const, x: 15.5 },
					{ id: "Home" as const },
					{ id: "PageUp" as const, label: "Pg\nUp" },
				] as const).map(setY(start + 2)),
				...calculateAndSetPositionAndSize([
					{ id: "Delete" as const, x: 15.5 },
					{ id: "End" as const },
					{ id: "PageDown" as const, label: "Pg\nDown" },
				] as const).map(setY(start + 3)),
			]
			: []
		),
		...(arrowKeys
			? [
				...calculateAndSetPositionAndSize([
					{ id: "ArrowUp" as const, label: "▲", x: 16.5, y: start + 5, classes: ["center-label"]},
				]),
				...calculateAndSetPositionAndSize([
					{ id: "ArrowLeft" as const, label: "◄", x: 15.5, classes: ["center-label"]},
					{ id: "ArrowDown" as const, label: "▼", classes: ["center-label"]},
					{ id: "ArrowRight" as const, label: "►", classes: ["center-label"]},
				] as const).map(setY(start + 6)),
			]
			: []
		),
		...(
			mediaKeys
			? [
				...calculateAndSetPositionAndSize([
					{ id: "AudioVolumeMute" as const, label: "🔇", x: 19, ...mediaKey, classes: ["center-label"]},
					{ id: "AudioVolumeDown" as const, label: "🔉", ...mediaKey, classes: ["center-label"]},
					{ id: "AudioVolumeUp" as const, label: "🔊", ...mediaKey, classes: ["center-label"]},
				]).map(setY(start)),
				...calculateAndSetPositionAndSize([
					{ id: "MediaTrackPrevious" as const, label: "⏮️", x: 19, ...mediaKey, classes: ["center-label"]},
					{ id: "MediaTrackPause" as const, label: "⏯️", ...mediaKey, classes: ["center-label"]},
					{ id: "MediaTrackNext" as const, label: "⏭️", ...mediaKey, classes: ["center-label"]},
				]).map(setY(start + 0.5)),
			]
			: []
		),
		...(numpad
			? [
				...calculateAndSetPositionAndSize([
					{ id: "NumLock" as const, label: "Num\nLock", x: 19, isToggle: "native" as const },
					{ id: "NumpadDivide" as const, label: "/" },
					{ id: "NumpadMultiply" as const, label: "*" },
					{ id: "NumpadSubtract" as const, label: "-" },
				]).map(setY(start + 2)),
				...calculateAndSetPositionAndSize([
					{ id: "Numpad7" as const, label: "7", x: 19 },
					{ id: "Numpad8" as const, label: "8" },
					{ id: "Numpad9" as const, label: "9" },
					{ id: "NumpadAdd" as const, label: "+", height: 2 },
				]).map(setY(start + 3)),
				...calculateAndSetPositionAndSize([
					{ id: "Numpad4" as const, label: "4", x: 19 },
					{ id: "Numpad5" as const, label: "5" },
					{ id: "Numpad6" as const, label: "6" },
				]).map(setY(start + 4)),
				...calculateAndSetPositionAndSize([
					{ id: "Numpad1" as const, label: "1", x: 19 },
					{ id: "Numpad2" as const, label: "2" },
					{ id: "Numpad3" as const, label: "3" },
					{ id: "NumpadEnter" as const, label: "+", height: 2 },
				]).map(setY(start + 5)),
				...calculateAndSetPositionAndSize([
					{ id: "Numpad0" as const, label: "0", x: 19, width: 2 },
					{ id: "NumpadDecimal" as const, label: "." },
				]).map(setY(start + 6)),
			]
			: []
		),
	]
	return keys
}
