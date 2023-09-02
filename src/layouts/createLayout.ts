import { calculateAndSetPositionAndWidth } from "../helpers/calculateAndSetPositionAndWidth.js"


const start = 0
const mediaKey = { height: 0.5, width: 4 / 3 }
const setY = <T>(yVal: number) => (val: T):(T & { opts: { y: number } }) => {
	(val as any).opts.y = yVal
	return val as any
}

/**
 * Creates the given keyboard layout, assiging the correct sizes and positions to keys.
 *
 * It returns an array of raw keys so that if you're extending {@link Key} you can create them with your extended class (you should override {@link Key.create}).
 *
 * Labels are assigned for most keys in english as a fallback, see {@link Manager.labelStrategy}. The only time you might want to "remove" them all (set them to blank) is if only using the `press` strategy so that the user doesn't see labels on "unlabeled" keys.
 *
 * Currently only supports generating the following layouts: `ansi`, `iso`. Technically the layout returned is a variation of these that includes half height 1.3333u (4u / 3 keys) media keys over the numpad.
 *
 * Pull requests for [standard layouts]([https://www.w3.org/TR/uievents-code) welcomed.
 *
 * You can remove sections using the options. Note that this just removes them and does no repositioning. If you only remove the numpad, for example, the media keys will still be placed above it. The idea is to easily allow reducing the size of the created layout to then adjust only a few keys to your liking.
 *
 * Also note the `navigation` section is split into two sections with `navigation` only refering to the 6 `Insert`, `Home`, etc. keys, and `arrowKeys` refering to the arrow keys.
 *
 * This also adds the following classes to some keys: `center-label` for media and arrow keys, and `iso-enter` for the iso enter which requires a different approach to styling.
 *
 * ```ts
 *	const layout  = [...createLayout("iso")].map(raw => Key.create(raw))
 * const manager = new Manager(new Keys(layout))
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
) {
	return [
		...calculateAndSetPositionAndWidth([
			{ id: "Escape" as const, opts: { label: "Esc" } },
			...(fn
				? [
					{ id: "F1" as const, opts: { x: 2 } },
					{ id: "F2" as const },
					{ id: "F3" as const },
					{ id: "F4" as const },
					{ id: "F5" as const, opts: { x: 6.5 } },
					{ id: "F6" as const },
					{ id: "F7" as const },
					{ id: "F8" as const },
					{ id: "F9" as const, opts: { x: 11 } },
					{ id: "F10" as const },
					{ id: "F11" as const },
					{ id: "F12" as const },
				]
				: []
			),
		]).map(setY(start + 0)),
		...calculateAndSetPositionAndWidth([
			{ id: "Backquote" as const, opts: { label: "`" } },
			{ id: "Digit1" as const, opts: { label: "1" } },
			{ id: "Digit2" as const, opts: { label: "2" } },
			{ id: "Digit3" as const, opts: { label: "3" } },
			{ id: "Digit4" as const, opts: { label: "4" } },
			{ id: "Digit5" as const, opts: { label: "5" } },
			{ id: "Digit6" as const, opts: { label: "6" } },
			{ id: "Digit7" as const, opts: { label: "7" } },
			{ id: "Digit8" as const, opts: { label: "8" } },
			{ id: "Digit9" as const, opts: { label: "9" } },
			{ id: "Digit0" as const, opts: { label: "0" } },
			{ id: "Minus" as const, opts: { label: "-" } },
			{ id: "Equal" as const, opts: { label: "=" } },
			{ id: "Backspace" as const, opts: { width: 2 } },
		]).map(setY(start + 2)),
		...calculateAndSetPositionAndWidth([
			{ id: "Tab" as const, opts: { width: 1.5 } },
			{ id: "KeyQ" as const, opts: { label: "q" } },
			{ id: "KeyW" as const, opts: { label: "w" } },
			{ id: "KeyE" as const, opts: { label: "e" } },
			{ id: "KeyR" as const, opts: { label: "r" } },
			{ id: "KeyT" as const, opts: { label: "t" } },
			{ id: "KeyY" as const, opts: { label: "y" } },
			{ id: "KeyU" as const, opts: { label: "u" } },
			{ id: "KeyI" as const, opts: { label: "i" } },
			{ id: "KeyO" as const, opts: { label: "o" } },
			{ id: "KeyP" as const, opts: { label: "p" } },
			{ id: "BracketLeft" as const, opts: { label: "[" } },
			{ id: "BracketRight" as const, opts: { label: "]" } },
			type === "ansi"
			? { id: "Backslash" as const, opts: { label: "\\", width: 1.5 } }
			: type === "iso"
			? { id: "Enter" as const, opts: { width: 1.5, height: 2, classes: ["iso-enter"]} }
			: {} as never,
		]).map(setY(start + 3)),
		...calculateAndSetPositionAndWidth([
			{ id: "CapsLock" as const, opts: { width: 1.75, is: { toggle: true } } },
			{ id: "KeyA" as const, opts: { label: "a" } },
			{ id: "KeyS" as const, opts: { label: "s" } },
			{ id: "KeyD" as const, opts: { label: "d" } },
			{ id: "KeyF" as const, opts: { label: "f" } },
			{ id: "KeyG" as const, opts: { label: "g" } },
			{ id: "KeyH" as const, opts: { label: "h" } },
			{ id: "KeyJ" as const, opts: { label: "j" } },
			{ id: "KeyK" as const, opts: { label: "k" } },
			{ id: "KeyL" as const, opts: { label: "l" } },
			{ id: "Semicolon" as const, opts: { label: ";" } },
			{ id: "Quote" as const, opts: { label: "'" } },
			type === "ansi"
			? { id: "Enter" as const, opts: { width: 2.25 } }
			: type === "iso"
			? { id: "Backslash" as const, opts: { label: "#", width: 1 } }
			: {} as never,
		]).map(setY(start + 4)),
		...calculateAndSetPositionAndWidth([
			...(type === "ansi"
			? [
				{ id: "VirtualShiftLeft" as const, opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.25 } },
			]
			: type === "iso"
			? [
				{ id: "VirtualShiftLeft" as const, opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 1.25 } },
				{ id: "IntlBackslash" as const, opts: { label: "\\", width: 1 } },
			]
			: []),
			{ id: "KeyZ" as const, opts: { label: "z" } },
			{ id: "KeyX" as const, opts: { label: "x" } },
			{ id: "KeyC" as const, opts: { label: "c" } },
			{ id: "KeyV" as const, opts: { label: "v" } },
			{ id: "KeyB" as const, opts: { label: "b" } },
			{ id: "KeyN" as const, opts: { label: "n" } },
			{ id: "KeyM" as const, opts: { label: "m" } },
			{ id: "Comma" as const, opts: { label: "," } },
			{ id: "Period" as const, opts: { label: "." } },
			{ id: "Slash" as const, opts: { label: "/" } },
			{ id: "VirtualShiftRight" as const, opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.75 } },
		]).map(setY(start + 5)),
		...calculateAndSetPositionAndWidth([
			{ id: "VirtualControlLeft" as const, opts: { is: { modifier: true }, label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], width: 1.25 } },
			{ id: "VirtualMetaLeft" as const, opts: { is: { modifier: true }, label: "Meta", variants: ["MetaLeft", "MetaRight", "Meta"], width: 1.25 } },
			{ id: "VirtualAltLeft" as const, opts: { is: { modifier: true }, label: "Alt", variants: ["AltLeft", "AltRight", "Alt"], width: 1.25 } },
			{ id: "Space" as const, opts: { label: "", width: 6.25 } },
			{ id: "VirtualAltRight" as const, opts: { is: { modifier: true }, label: "Alt", variants: ["AltLeft", "AltRight", "Alt"], width: 1.25 } },
			{ id: "VirtualMetaRight" as const, opts: { is: { modifier: true }, label: "Meta", variants: ["MetaLeft", "MetaRight", "Meta"], width: 1.25 } },
			{ id: "ContextMenu" as const, opts: { label: "Menu", width: 1.25 } },
			{ id: "VirtualControlRight" as const, opts: { is: { modifier: true }, label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], width: 1.25 } },
		]).map(setY(start + 6)),
		...calculateAndSetPositionAndWidth([
			{ id: "PrintScreen" as const, opts: { label: "PrtScn", x: 15.5 } },
			{ id: "ScrollLock" as const, opts: { label: "Scroll\nLock", is: { toggle: true } } },
			{ id: "Pause" as const, opts: { label: "Pause\nBreak" } },
		]).map(setY(start)),
		...(navigation
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "Insert" as const, opts: { x: 15.5 } },
					{ id: "Home" as const },
					{ id: "PageUp" as const, opts: { label: "Pg\nUp" } },
				]).map(setY(start + 2)),
				...calculateAndSetPositionAndWidth([
					{ id: "Delete" as const, opts: { x: 15.5 } },
					{ id: "End" as const },
					{ id: "PageDown" as const, opts: { label: "Pg\nDown" } },
				]).map(setY(start + 3)),
				{ id: "ArrowUp" as const, opts: { label: "▲", x: 16.5, y: start + 5, classes: ["center-label"]} },
			]
			: []
		),
		...(arrowKeys
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "ArrowLeft" as const, opts: { label: "◄", x: 15.5, classes: ["center-label"]} },
					{ id: "ArrowDown" as const, opts: { label: "▼", classes: ["center-label"]} },
					{ id: "ArrowRight" as const, opts: { label: "►", classes: ["center-label"]} },
				]).map(setY(start + 6)),
			]
			: []
		),
		...(
			mediaKeys
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "AudioVolumeMute" as const, opts: { label: "🔇", x: 19, ...mediaKey, classes: ["center-label"]} },
					{ id: "AudioVolumeDown" as const, opts: { label: "🔉", ...mediaKey, classes: ["center-label"]} },
					{ id: "AudioVolumeUp" as const, opts: { label: "🔊", ...mediaKey, classes: ["center-label"]} },
				]).map(setY(start)),
				...calculateAndSetPositionAndWidth([
					{ id: "MediaTrackPrevious" as const, opts: { label: "⏮️", x: 19, ...mediaKey, classes: ["center-label"]} },
					{ id: "MediaTrackPause" as const, opts: { label: "⏯️", ...mediaKey, classes: ["center-label"]} },
					{ id: "MediaTrackNext" as const, opts: { label: "⏭️", ...mediaKey, classes: ["center-label"]} },
				]).map(setY(start + 0.5)),
			]
			: []
		),
		...(numpad
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "NumLock" as const, opts: { label: "Num\nLock", x: 19, is: { toggle: true } } },
					{ id: "NumpadDivide" as const, opts: { label: "/" } },
					{ id: "NumpadMultiply" as const, opts: { label: "*" } },
					{ id: "NumpadSubtract" as const, opts: { label: "-" } },
				]).map(setY(start + 2)),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad7" as const, opts: { label: "7", x: 19 } },
					{ id: "Numpad8" as const, opts: { label: "8" } },
					{ id: "Numpad9" as const, opts: { label: "9" } },
					{ id: "NumpadAdd" as const, opts: { label: "+", height: 2 } },
				]).map(setY(start + 3)),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad4" as const, opts: { label: "4", x: 19 } },
					{ id: "Numpad5" as const, opts: { label: "5" } },
					{ id: "Numpad6" as const, opts: { label: "6" } },
				]).map(setY(start + 4)),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad1" as const, opts: { label: "1", x: 19 } },
					{ id: "Numpad2" as const, opts: { label: "2" } },
					{ id: "Numpad3" as const, opts: { label: "3" } },
					{ id: "NumpadEnter" as const, opts: { label: "+", height: 2 } },
				]).map(setY(start + 5)),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad0" as const, opts: { label: "0", x: 19, width: 2 } },
					{ id: "NumpadDecimal" as const, opts: { label: "." } },
				]).map(setY(start + 6)),
			]
			: []
		),
	]
}
