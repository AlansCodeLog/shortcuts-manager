import { calculateAndSetPositionAndWidth } from "./helpers/calculateAndSetPositionAndWidth";

const start = 0
const mediaKey = { height: 0.5, width: 4/3 }

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
export function createLayout(
	type: "ansi" | "iso" | "" = "ansi",
	{
		numpad = true,
		mediaKeys = true,
		fn = true,
		navigation = true,
		arrowKeys = true
	} :
	Partial<Record<"numpad" | "mediaKeys" | "fn" | "navigation" | "arrowKeys", boolean>> = {}
): ReturnType<typeof calculateAndSetPositionAndWidth> {
	return [
		...calculateAndSetPositionAndWidth([
			{ id: "Escape", opts: { label: "Esc" } },
			...(fn
				? [
					{ id: "F1", opts: { x: 2 } },
					{ id: "F2" },
					{ id: "F3" },
					{ id: "F4" },
					{ id: "F5", opts: { x: 6.5 } },
					{ id: "F6" },
					{ id: "F7" },
					{ id: "F8" },
					{ id: "F9", opts: { x: 11 } },
					{ id: "F10" },
					{ id: "F11" },
					{ id: "F12" },
				]
				: []
			)
		]).map(key => { key.opts.y = start + 0; return key }),
		...calculateAndSetPositionAndWidth([
			{ id: "Backquote", opts: { label: "`" } },
			{ id: "Digit1", opts: { label: "1" } },
			{ id: "Digit2", opts: { label: "2" } },
			{ id: "Digit3", opts: { label: "3" } },
			{ id: "Digit4", opts: { label: "4" } },
			{ id: "Digit5", opts: { label: "5" } },
			{ id: "Digit6", opts: { label: "6" } },
			{ id: "Digit7", opts: { label: "7" } },
			{ id: "Digit8", opts: { label: "8" } },
			{ id: "Digit9", opts: { label: "9" } },
			{ id: "Digit0", opts: { label: "0" } },
			{ id: "Minus", opts: { label: "-" } },
			{ id: "Equal", opts: { label: "=" } },
			{ id: "Backspace", opts: { width: 2 } },
		]).map(key => { key.opts.y = start + 2; return key }),
		...calculateAndSetPositionAndWidth([
			{ id: "Tab", opts: { width: 1.5 } },
			{ id: "KeyQ", opts: { label: "q" } },
			{ id: "KeyW", opts: { label: "w" } },
			{ id: "KeyE", opts: { label: "e" } },
			{ id: "KeyR", opts: { label: "r" } },
			{ id: "KeyT", opts: { label: "t" } },
			{ id: "KeyY", opts: { label: "y" } },
			{ id: "KeyU", opts: { label: "u" } },
			{ id: "KeyI", opts: { label: "i" } },
			{ id: "KeyO", opts: { label: "o" } },
			{ id: "KeyP", opts: { label: "p" } },
			{ id: "BracketLeft", opts: { label: "[" } },
			{ id: "BracketRight", opts: { label: "]" } },
			type === "ansi"
			? { id: "Backslash", opts: { label: "\\", width: 1.5 } }
			: type === "iso"
			? { id: "Enter", opts: { width: 1.5, height: 2, classes:["iso-enter"] } }
			: {} as never
		]).map(key => { key.opts.y = start + 3; return key }),
		...calculateAndSetPositionAndWidth([
			{ id: "CapsLock", opts: { width: 1.75, is: { toggle: true } } },
			{ id: "KeyA", opts: { label: "a" } },
			{ id: "KeyS", opts: { label: "s" } },
			{ id: "KeyD", opts: { label: "d" } },
			{ id: "KeyF", opts: { label: "f" } },
			{ id: "KeyG", opts: { label: "g" } },
			{ id: "KeyH", opts: { label: "h" } },
			{ id: "KeyJ", opts: { label: "j" } },
			{ id: "KeyK", opts: { label: "k" } },
			{ id: "KeyL", opts: { label: "l" } },
			{ id: "Semicolon", opts: { label: ";" } },
			{ id: "Quote", opts: { label: "'" } },
			type === "ansi"
			? { id: "Enter", opts: { width: 2.25 } }
			: type === "iso"
			? { id: "Backslash", opts: { label: "#", width: 1 } }
			: {} as never
		]).map(key => { key.opts.y = start + 4; return key }),
		...calculateAndSetPositionAndWidth([
			...(type === "ansi"
			? [
					{ id: "VirtualShiftLeft", opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.25 } }
			]
			: type === "iso"
			? [
				{ id: "VirtualShiftLeft", opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 1.25 } },
				{ id: "IntlBackslash", opts: { label: "\\", width: 1 } }
			]
			: [] as never),
			{ id: "KeyZ", opts: { label: "z" } },
			{ id: "KeyX", opts: { label: "x" } },
			{ id: "KeyC", opts: { label: "c" } },
			{ id: "KeyV", opts: { label: "v" } },
			{ id: "KeyB", opts: { label: "b" } },
			{ id: "KeyN", opts: { label: "n" } },
			{ id: "KeyM", opts: { label: "m" } },
			{ id: "Comma", opts: { label: "," } },
			{ id: "Period", opts: { label: "." } },
			{ id: "Slash", opts: { label: "/" } },
			{ id: "VirtualShiftRight", opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.75 } },
		]).map(key => { key.opts.y = start + 5; return key }),
		...calculateAndSetPositionAndWidth([
			{ id: "VirtualControlLeft", opts: { is: { modifier: true }, label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], width: 1.25 } },
			{ id: "VirtualMetaLeft", opts: { is: { modifier: true }, label: "Meta", variants: ["MetaLeft", "MetaRight", "Meta"], width: 1.25 } },
			{ id: "VirtualAltLeft", opts: { is: { modifier: true }, label: "Alt", variants: ["AltLeft", "AltRight", "Alt"], width: 1.25 } },
			{ id: "Space", opts: { label: "", width: 6.25 } },
			{ id: "VirtualAltRight", opts: { is: { modifier: true }, label: "Alt", variants: ["AltLeft", "AltRight", "Alt"], width: 1.25 } },
			{ id: "VirtualMetaRight", opts: { is: { modifier: true }, label: "Meta", variants: ["MetaLeft", "MetaRight", "Meta"], width: 1.25 } },
			{ id: "ContextMenu", opts: { label: "Menu", width: 1.25 } },
			{ id: "VirtualControlRight", opts: { is: { modifier: true }, label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], width: 1.25 } },
		]).map(key => { key.opts.y = start + 6; return key }),
		...calculateAndSetPositionAndWidth([
			{ id: "PrintScreen", opts: { label: "PrtScn", x: 15.5 } },
			{ id: "ScrollLock", opts: { label: "Scroll\nLock", is: { toggle: true }  } },
			{ id: "Pause", opts: { label: "Pause\nBreak" } },
		]).map(key => { key.opts.y = start; return key }),
		...(navigation
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "Insert", opts: { x: 15.5 } },
					{ id: "Home" },
					{ id: "PageUp", opts: { label: "Pg\nUp" } },
				]).map(key => { key.opts.y = start + 2; return key }),
				...calculateAndSetPositionAndWidth([
					{ id: "Delete", opts: { x: 15.5 } },
					{ id: "End" },
					{ id: "PageDown", opts: { label: "Pg\nDown" } },
				]).map(key => { key.opts.y = start + 3; return key }),
				{ id: "ArrowUp", opts: { label: "▲", x: 16.5, y: start + 5, classes: ["center-label"] } },
			]
			: []
		),
		...(arrowKeys
			? [
				...calculateAndSetPositionAndWidth([
				{ id: "ArrowLeft", opts: { label: "◄", x: 15.5, classes: ["center-label"] } },
				{ id: "ArrowDown", opts: { label: "▼", classes: ["center-label"] } },
				{ id: "ArrowRight", opts: { label: "►", classes: ["center-label"] } },
				]).map(key => { key.opts.y = start + 6; return key })
			]
			: []
		),
		...(
			mediaKeys
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "AudioVolumeMute", opts: { label: "🔇", x: 19, ...mediaKey, classes: ["center-label"] } },
					{ id: "AudioVolumeDown", opts: { label: "🔉", ...mediaKey, classes: ["center-label"] } },
					{ id: "AudioVolumeUp", opts: { label: "🔊", ...mediaKey, classes: ["center-label"] } },
				]).map(key => { key.opts.y = start; return key }),
				...calculateAndSetPositionAndWidth([
					{ id: "MediaTrackPrevious", opts: { label: "⏮️", x: 19, ...mediaKey, classes: ["center-label"] } },
					{ id: "MediaTrackPause", opts: { label: "⏯️", ...mediaKey, classes: ["center-label"] } },
					{ id: "MediaTrackNext", opts: { label: "⏭️", ...mediaKey, classes: ["center-label"] } },
				]).map(key => { key.opts.y = start + 0.5; return key })
			]
			: []
		),
		...(numpad
			? [
				...calculateAndSetPositionAndWidth([
					{ id: "NumLock", opts: { label: "Num\nLock", x: 19 , is: { toggle: true  }} },
					{ id: "NumpadDivide", opts: { label: "/" } },
					{ id: "NumpadMultiply", opts: { label: "*" } },
					{ id: "NumpadSubtract", opts: { label: "-" } },
				]).map(key => { key.opts.y = start + 2; return key }),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad7", opts: { label: "7", x: 19 } },
					{ id: "Numpad8", opts: { label: "8" } },
					{ id: "Numpad9", opts: { label: "9" } },
					{ id: "NumpadAdd", opts: { label: "+", height: 2 } },
				]).map(key => { key.opts.y = start + 3; return key }),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad4", opts: { label: "4", x: 19 } },
					{ id: "Numpad5", opts: { label: "5" } },
					{ id: "Numpad6", opts: { label: "6" } },
				]).map(key => { key.opts.y = start + 4; return key }),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad1", opts: { label: "1", x: 19 } },
					{ id: "Numpad2", opts: { label: "2" } },
					{ id: "Numpad3", opts: { label: "3" } },
					{ id: "NumpadEnter", opts: { label: "+", height: 2 } },
				]).map(key => { key.opts.y = start + 5; return key }),
				...calculateAndSetPositionAndWidth([
					{ id: "Numpad0", opts: { label: "0", x: 19, width: 2 } },
					{ id: "NumpadDecimal", opts: { label: "." } },
				]).map(key => { key.opts.y = start + 6; return key }),
					]
			: []
		)
	] as any
}
