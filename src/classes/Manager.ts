/* eslint-disable max-lines */
import { castType, crop, Err, indent, last, multisplice, Ok, pretty, Result, setReadOnly, unreachable } from "@alanscodelog/utils"
import { HookableBase } from "bases/HookableBase.js"
import { checkManagerShortcuts } from "helpers/checkManagerShortcuts.js"
import { checkShortcutCommands } from "helpers/checkShortcutCommands.js"
import { checkShortcutKeys } from "helpers/checkShortcutKeys.js"
import { defaultManagerCallback } from "helpers/defaultManagerCallback.js"
import { isModifierKey } from "helpers/isModifierKey.js"
import { isToggleRootKey } from "helpers/isToggleRootKey.js"
import { isTriggerKey } from "helpers/isTriggerKey.js"
import { isValidChain } from "helpers/isValidChain.js"
import { KnownError } from "helpers/KnownError.js"
import { mapKeys } from "helpers/mapKeys.js"
import { ERROR, TYPE_ERROR } from "types/enums.js"
import type { AnyInputEvent, AttachTarget, BaseHook, CollectionHook, CommandsHooks, ExportedManager, KeyboardLayoutMap, KeysCollectionHooks, ManagerErrorCallback, ManagerHook, ManagerListener, ManagerReplaceValue, NavigatorWKeyboard, RawCommand, RawShortcut, ShortcutHooks, ShortcutOptions, ShortcutsHooks, ToggleRootKey, TriggerableShortcut } from "types/index.js"

import type { Command } from "./Command.js"
import type { Commands } from "./Commands.js"
import { Condition } from "./Condition.js"
import type { Context } from "./Context.js"
import type { Key } from "./Key.js"
import type { Keys } from "./Keys.js"
import { defaultSorter, type KeysSorter } from "./KeysSorter.js"
import type { Shortcut } from "./Shortcut.js"
import type { Shortcuts } from "./Shortcuts.js"
import { defaultStringifier, type Stringifier } from "./Stringifier.js"


const defaultLabelFilter = (): boolean => true

export class Manager extends HookableBase<ManagerHook> implements Pick<ShortcutOptions, "stringifier" | "sorter"> {
	/**
	 * Disabled triggering of shortcuts. The manager otherwise works as normal.
	 */
	enabled: boolean = true

	/** @RequiresSet @AllowsHookable @SetHookable */
	readonly keys!: Keys

	/** @RequiresSet @AllowsHookable @SetHookable */
	readonly commands!: Commands

	/** @RequiresSet @AllowsHookable @SetHookable */
	readonly shortcuts!: Shortcuts

	/**
	 * The current chain of chords.
	 *
	 * It can be set with `set("chain", ...)` if you really need to, but I would avoid it. The manager will take care of adjusting itself to the chain set, but it can seem to do odd things. Also the property does not allow `allows` hooks (though there are internal ones).
	 *
	 * Notes:
	 * - You should also always check if a chain is allowed to be set first.
	 * - The chain's value is always cloned using {@link Manager.cloneChain} when set so that you can save references to the chain and modify the order of chords/keys, without having to clone it yourself.
	 * - If there are still non-modifier keys being pressed, the manager waits until they are all released before allowing keys to be added to the chain again.
	 * - The manager untriggers shortcuts (calls command.execute with keyup) if one is still awaiting the keyup event.
	 * - The manager checks if the chain set should trigger anything. This will mean that if a shortcut is triggered, the chain could get immediately cleared, which you might not have intended, but...
	 *
	 * Setting the chain like this prevents us from getting into potentially invalid states or triggering shortcuts when we shouldn't. It also keeps the manager's internal state consistant.
	 *
	 * @RequiresSet @SetHookable
	 */
	readonly chain: Key[][] = []

	context: Context

	sorter: KeysSorter

	/**
	 * The error callback for recoverable errors such as multiple shortcuts matching, no shortcut matching once a chord chain has been "started", or an unknown key event because no matching key was found (only for keyboard events).
	 *
	 * Usually you will want to clear the manager's chain when this happens and display the error to the user.
	 *
	 * In the case of multiple valid shortcuts, if you trigger any of the shortcuts "manually" note that you will need to simulate both the keydown/keyup calls if you differentiate between them.
	 *
	 * The default callback logs the error and clears the chain.
	 */
	cb: ManagerErrorCallback<ERROR.MULTIPLE_MATCHING_SHORTCUTS | ERROR.NO_MATCHING_SHORTCUT | ERROR.UNKNOWN_KEY_EVENT> = defaultManagerCallback

	/**
	 * If enabled, sets the labels for keys "automatically". This overrides the existing label. Set {@link Manager.labelOnlyBlank} for disabling this.
	 * There's two strategies for auto labeling:
	 *
	 * Using `"press"` it will label keys as they are pressed (as long as shift is not pressed) using `keyboardEvent.key`. For mouse buttons it will label them `Button x` where x is `MouseEvent.button`, and for the mouse wheel, `WheelEvent.deltaY` is used to label them `Wheel Up`/`Wheel Down`.
	 *
	 * Using `"navigator"`, the manager will attempt to use {@link navigator.keyboard.getLayoutMap()} (which you'll be able to find at {@link Manager.keyboardMap}) if it exists to label keys (and only keys). It will first try the `id`s then the `variants` until a label is returned and assigns it to the key.
	 *
	 * Note that not all keys can be auto labeled with the navigator. Modifier keys and some other keys are not available.
	 *
	 * The default is `true`/`"both"` because of these limitations. It uses the navigator, and the `press` strategy only as a fallback when the navigator does not have the key.
	 *
	 * @RequiresSet @AllowsHookable @SetHookable
	 */
	readonly labelStrategy: true | "navigator" | "press" | "both" | false = "both"

	/**
	 * The keyboard map returned by `navigator.keyboard.getLayoutMap()`
	 */
	keyboardMap?: KeyboardLayoutMap

	private _selfKeyboardMap: Map<Key, boolean> = new Map()

	private readonly _timers: Map<Key, number | NodeJS.Timeout> = new Map()

	private _labelPromise!: Promise<void>

	/**
	 * Filters the auto labeling.
	 *
	 * If the filter returns true, the key is not labeled.
	 *
	 * You can also use this to label the key yourself.
	 *
	 * Common filter actions:
	 * - Capitalize all single character keys to match what they look like on real keyboard.
	 * - Prevent keys with multi-line labels (e.g. `Num\nLock`, `Scroll\nLock` from getting changed).
	 *
	 * Note the event is not always a real event because if it's the navigator labeling the key or you're using the {@link Emulator} class, there isn't a real event.
	 */
	labelFilter: (e: Partial<AnyInputEvent> & { key?: string, button?: number, deltaY?: number }, key: Key) => boolean = defaultLabelFilter

	/**
	 * Whether the manager is waiting for non-modifier keys to be release.
	 *
	 * See {@link Manager._chain}
	 */
	readonly isAwaitingKeyup: boolean = false

	readonly isRecording: boolean = false

	/**
	 * Whether to check the state of modifier or toggle keys using `event.getModifierState`.
	 *
	 * This is set to true by default which is what you usually want since it tracks the state with the most accuracy when, for example, the user focuses out, toggles a key, then focuses back.
	 *
	 * But if you are allowing the user to change key states in some way (e.g. clicking on keys in the settings to visualize shortcuts), you will want to disable this temporarily so that they can click modifier keys. Otherwise they'd be immediately toggled off again (by the state check during the click) and nothing would happen.
	 *
	 * Keys also have their own individual {@link Key.checkStateOnAllEvents} in case you need more fine grained control.
	 *
	 * When this is set to false the manager will remove / not add it's mouseenter listener.
	 *
	 * This should be set using {@link Manager.set} so the manager can add/remove the listener as needed.
	 *
	 * @RequiresSet
	 */
	readonly checkStateOnAllEvents: boolean = true

	private readonly _els: AttachTarget[] = []

	private _nextIsChord: boolean = false

	private _bypassChainSet: boolean = false

	private _untrigger: false | TriggerableShortcut = false

	private _nativeToggleKeys: ToggleRootKey[] = []

	private _nativeModifierKeys: Key[] = []

	private readonly _boundKeydown: Manager["_keydown"]

	private readonly _boundKeyup: Manager["_keyup"]

	private readonly _boundMousedown: Manager["_mousedown"]

	private readonly _boundMouseup: Manager["_mouseup"]

	private readonly _boundMouseEnter: Manager["_mouseenter"]

	private readonly _boundWheel: Manager["_wheel"]

	private readonly _boundKeysAddHook: CollectionHook<"add", KeysCollectionHooks>

	private readonly _boundKeysRemoveHook: CollectionHook<"remove", KeysCollectionHooks>

	private readonly _boundKeysAllowsRemoveHook: CollectionHook<"allowsRemove", KeysCollectionHooks>

	private readonly _boundCommandsAllowsRemoveHook: CollectionHook<"allowsRemove", CommandsHooks>

	private readonly _boundShortcutAddHook: CollectionHook<"add", ShortcutsHooks>

	private readonly _boundShortcutRemoveHook: CollectionHook<"remove", ShortcutsHooks>

	private readonly _boundShortcutAllowsHook: BaseHook<"allows", ShortcutHooks>

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
	 * // this will listen to the correct key/mouse/wheel/mouseenter events on the element
	 * manager.attach(document)
	 * ```
	 *
	 * You will then not need to do much else. It will take care of setting the pressed state of keys, the state of the current chord chain (see {@link Manager._chain}), finding a matching shortcut if it exists, and triggering it's command.
	 *
	 * The way this works is that when a key is pressed it's added to the current chord in the chain. If the chain matches a shortcut's chain that can be triggered (it must be enabled, it must have a command and a function to execute, and it's condition and it's command's condition must evaluate to true), the command's execute function is triggered with `isKeydown = true`, see {@link Command.execute}.
	 *
	 * If there are no shortcuts to trigger but there are "potential shortcuts" that start with the current chain and could trigger, if the current chord contains any non-modifier keys (see {@link Manager.pressedNonModifierKeys}), an empty chord will be added to the chain on the next key pressed and the process repeats.
	 *
	 * If there are no shortcuts and no potential shortcuts, the callback will be called with {@link ERROR.NO_MATCHING_SHORTCUT} and you will probably want to clear the chain. When the chain is cleared (see {@link Manager._chain}), the manager will not add/remove keys from the chain until all non-modifier keys are unpressed. Pressed state is still set/tracked though.
	 *
	 * The moment a key is released after a shortcut is triggered, the command's execute function is fired again with `isKeydown = false`.
	 *
	 * If {@link Manager.checkStateOnAllEvents} is not disabled, the manager also adds an mouseenter listener to the element it's attached to to be able to keep the most accurate state of the modifier keys. See {@link Manager.checkStateOnAllEvents} for more info.
	 *
	 * ### Notes
	 *
	 * - **The creation of the manager can throw since it checks whether shortcuts contain known keys/commands.**
	 *
	 * - The manager adds hooks to the {@link Keys}, {@link Commands}, and {@link Shortcuts} to prevent removal of keys/commands that are in use, and other changes that might cause problems and take care of removing them properly when, for example, you change the set of commands.
	 *
	 * ### Other
	 *
	 * - If you need to emulate keypresses for testing see {@link Emulator}.
	 *
	 * Other common things you might want/need to do:
	 *
	 * - Add a shortcut to a command that can clear the manager's chord chain (e.g. `Escape`).
	 *
	 * - Add a set hook to listen to key presses to display that for the user.
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
			labelStrategy = true,
			labelFilter,
		}: {
			stringifier?: Stringifier
			sorter?: KeysSorter
			labelStrategy?: Manager["labelStrategy"]
			labelFilter?: Manager["labelFilter"]
		} = {},
	) {
		super()
		this._boundKeydown = this._keydown.bind(this)
		this._boundKeyup = this._keyup.bind(this)
		this._boundMousedown = this._mousedown.bind(this)
		this._boundMouseup = this._mouseup.bind(this)
		this._boundMouseEnter = this._mouseenter.bind(this)
		this._boundWheel = this._wheel.bind(this)
		this._boundKeysAddHook = this._keysAddHook.bind(this)
		this._boundKeysRemoveHook = this._keysRemoveHook.bind(this)
		this._boundKeysAllowsRemoveHook = this._keysAllowsRemoveHook.bind(this)
		this._boundCommandsAllowsRemoveHook = this._commandsAllowsRemoveHook.bind(this)
		this._boundShortcutAddHook = this._shortcutAddHook.bind(this)
		this._boundShortcutRemoveHook = this._shortcutRemoveHook.bind(this)
		this._boundShortcutAllowsHook = this._shortcutAllowsHook.bind(this)

		if (cb) this.cb = cb

		this.context = context
		this.stringifier = stringifier ?? defaultStringifier
		this.sorter = sorter ?? defaultSorter
		if (labelFilter) this.labelFilter = labelFilter
		this.set("labelStrategy", labelStrategy)
		this.safeSet("replace", { shortcuts, keys, commands }).unwrap()
	}

	stringifier: Stringifier

	private get _labelWNavigator(): boolean {
		return [true, "both", "navigator"].includes(this.labelStrategy as string)
	}

	private get _labelWPress(): boolean {
		return [true, "both", "press"].includes(this.labelStrategy as string)
	}

	private async _labelStrategyStatus(): Promise<void> {
		if (this._labelWNavigator) {
			if (typeof navigator !== "undefined") {
				castType<NavigatorWKeyboard | undefined>(navigator)
				if (navigator?.keyboard) {
					const map = await navigator.keyboard.getLayoutMap()
					this.keyboardMap = map
					for (const key of Object.values(this.keys.entries)) {
						this._keyboardMapLabel(map, key)
					}
				}
			}
		}
	}

	private _keyboardMapLabel(map: KeyboardLayoutMap, key: Key): void {
		if (this._labelWNavigator && map && this.keys.entries[key.id] === key) { // just in case
			const codes = [key.id, ...(key.variants ?? [])]

			for (const code of codes) {
				const label = map.get(code)
				if (label) {
					if (this.labelFilter({ key: label }, key)) {
						key.set("label", label)
						this._selfKeyboardMap.set(key, true)
					}
				}
			}
		}
	}

	private _checkLabel<T extends AnyInputEvent>(e: T, prop: keyof T, keys: Key[]): void {
		if (this._labelWPress) {
			for (const key of keys) {
				if (!this._selfKeyboardMap.has(key)) {
					if (this.labelFilter(e, key)) {
						// we don't use instanceof so that we can still be compatible with emulated events
						let label = ""
						switch (prop) {
							case "deltaY":
								label = (e as WheelEvent).deltaY < 0 ? "Wheel Up" : "Wheel Down"
								break
							case "button":
								label = `Button ${(e as MouseEvent).button}`
								break
							case "key":
								label = (e as KeyboardEvent).key
								break
							default:
								unreachable()
						}
						key.set("label", label)
					}
				}
			}
		}
	}

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
	 * A list of currently pressed non-modifier keys. They can't be toggle state keys (i.e. `on`/`off`) either.
	 *
	 * This determines whether when we await keyup and when a new chord should be added.
	 */
	pressedNonModifierKeys(): Key[] {
		return this.keys.query(key => key.pressed && isTriggerKey(key), true)
	}

	pressedModifierKeys(): Key[] {
		return this.keys.query(key => key.pressed && isModifierKey(key), true)
	}

	/**
	 * A copy of the last chord in the chain if it exists.
	 */
	lastChord(): Key[] | undefined {
		const lastChord = last(this.chain)
		return lastChord ? [...lastChord] : undefined
	}

	/**
	 * Attach the manager to an element so it can listen to the needed event hooks.
	 */
	attach(el: AttachTarget): void {
		this._els.push(el)
		el.addEventListener("keydown", this._boundKeydown)
		el.addEventListener("keyup", this._boundKeyup)
		el.addEventListener("wheel", this._boundWheel)
		el.addEventListener("mousedown", this._boundMousedown)
		el.addEventListener("mouseup", this._boundMouseup)
		if (this.checkStateOnAllEvents) el.addEventListener("mouseenter", this._boundMouseEnter)
	}

	/**
	 * Detach the manager from an element and remove all it's event listeners.
	 */
	detach(el: AttachTarget): void {
		this._els.splice(this._els.indexOf(el))
		el.removeEventListener("keydown", this._boundKeydown)
		el.removeEventListener("keyup", this._boundKeyup)
		el.removeEventListener("wheel", this._boundWheel)
		el.removeEventListener("mousedown", this._boundMousedown)
		el.removeEventListener("mouseup", this._boundMouseup)
		if (this.checkStateOnAllEvents) el.removeEventListener("mouseenter", this._boundMouseEnter)
	}

	private readonly _listeners: ManagerListener[] = []

	/**
	 * Add an event listener for all events the manager handles.
	 *
	 * The listeners are called right after keys are found so you can have access to the keys as the manager understood them, but before everything else (setting the state, labeling, adding/removing from the chain). Note that `isKeydown` is always true for wheel events since their keyup is emulated withing the same event handler.
	 *
	 * This exists because not all events trigger shortcuts (which can access only the event that triggered them) but there are many times when you might still want access to the event to do things like `e.preventdefault()`:
	 *
	 * - When recording, we usually always need to do `e.preventDefault()` except in some rare cases:
	 * 	- For example say you have a div which records while focused, if the manager is attached to a parent element, you will have to allow clicks to the parent so losing focus stops the recording. You do not generally need to allow keys through, see {@link Manager.startRecording} for why.
	 * - We also need to `e.preventDefault()` for any chords that are also browser shortcuts (though note not all browser shortcuts can be overriden).
	 *
	 * The following should give you a good starting point:
	 *
	 * ```ts
	 * manager.addEventListener(({event, isKeydown, keys}) => {
	 * 	if (
	 * 		(manager.isRecording && !(event instanceof MouseEvent)) ||
	 *   		//TODO browser shortcuts filter
	 * 	) {
	 * 		event.preventDefault()
	 * 	}
	 * })
	 * ```
	 */
	addEventListener(listener: ManagerListener): void {
		if (typeof listener !== "function") {
			throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "Listener is not a function.", undefined)
		}
		this._listeners.push(listener)
	}

	removeEventListener(listener: ManagerListener): void {
		const index = this._listeners.indexOf(listener)
		if (index === -1) {
			const prettyListeners = indent(pretty(this._listeners), 4)
			throw new KnownError(TYPE_ERROR.HOOK_OR_LISTENER_DOES_NOT_EXIST, crop`
			Could not find listener ${(listener as any).toString()} in listeners list:
				${prettyListeners}
			`, {
				listener, listeners: this._listeners,
			})
		}
		this._listeners.splice(index, 1)
	}

	/**
	 * Puts the manager into recording mode.
	 *
	 * This clears the chain then disables triggering shortcuts, but still handles key events and adding them to the chain.
	 *
	 *
	 * To allow users to stop the recording with a certain key regardless of the chain's state, the following is suggested. You can also do something like have an input element that on focus starts recording and stops when focused is blurred. In such a case, you can have a {@link Manager.eventListener} that allows clicks through when clicking outside the input. See {@link Manager.eventListener} for an example.
	 *
	 * ```ts
	 * manager.startRecording()
	 * const stopRecordingHook = (prop, val) => {
	 * 	if (prop === "pressed" && val === true) {
	 * 		manager.stopRecording()
	 * 		manager.keys.entries.Escape.removeHook("set", stopRecordingHook)
	 * 	}
	 * }
	 * const saveRecordingHook = (prop, val) => {
	 * 	if (prop === "pressed" && val === true) {
	 * 		// it's safe to just use the reference
	 * 		// there should be no need to spread it to a new array
	 * 		const chain = manager.chain
	 * 		manager.stopRecording()
	 * 		manager.keys.entries.Enter.removeHook("set", saveRecordingHook)
	 * 	}
	 * }
	 * manager.keys.entries.Escape.addHook("set", stopRecordingHook)
	 * manager.keys.entries.Enter.addHook("set", saveRecordingHook)
	 * ```
	 * You will also probably want to `preventDefault` all events while recording with {@link Manager.eventListener}.
	 */
	startRecording(): void {
		this.clearChain()
		setReadOnly(this, "isRecording", true)
	}

	/**
	 * Clears the chain and stops recording.
	 */
	stopRecording(): void {
		this.clearChain()
		setReadOnly(this, "isRecording", false)
	}

	/**
	 * Return whether the current chord chain state partially matches a shortcut which can be triggered. It must only PARTIALLY match, not fully match.
	 *
	 * Returns false if awaiting keyup.
	 */
	inChain(): boolean {
		if (this.isAwaitingKeyup) return false
		const shortcuts = this.shortcuts.query(shortcut =>
			shortcut.enabled &&
			shortcut.command?.execute &&
			this.chain.length < shortcut.chain.length &&
			shortcut.equalsKeys(this.chain, this.chain.length) &&
			shortcut.condition.eval(this.context) &&
			(shortcut.command === undefined || shortcut.command.condition.eval(this.context))
		)
		if (!shortcuts) return false
		return shortcuts.length > 0
	}

	/**
	 * Clones the chain at the chain and chord level.
	 *
	 * Like doing:
	 * ```ts
	 * chain.map(chord => [...chord])
	 * ```
	 *
	 * Used internally so that `set("chain")` always sets fresh arrays.
	 */
	static cloneChain(chain: Key[][]): Key[][] {
		const clone: Key[][] = []
		for (const chord of chain) {
			const cloneChord = []
			for (const key of chord) cloneChord.push(key)
			clone.push(cloneChord)
		}
		return clone
	}

	/** Returns a clone of the chain with duplicate keys in chords deduped by their labels. The first instance in the chain is left, the others removed. */
	// TODO
	// not sure if this is a good idea. should shortcuts contain duplicate keys and just be displayed different?
	static dedupeChain(chain: Key[][]): Key[][] {
		const clone: Key[][] = []
		for (const chord of chain) {
			const cloneChord = []
			for (const key of chord) {
				if (cloneChord.find(existing => existing.label === key.label) === undefined) {
					cloneChord.push(key)
				}
			}
			clone.push(cloneChord)
		}
		return clone
	}

	/**
	 * Clears the chain.
	 *
	 * Just a wrapper around `this.set("chain", [])`.
	 *
	 */
	clearChain(): void {
		this.set("chain", [])
	}

	/**
	 * Clears the chain if it's longer than one chord.
	 *
	 * You'll probably want to use this on the keyup trigger of most of your shortcuts.
	 *
	 * You could use {@link Manager.clearChain()}/`set("chain", [[]])`, but this forces users to always release all keys before another shortcut can be triggered.
	 *
	 * If we only clear the chain when it's longer than one chord we get more reasonable behaviour.
	 *
	 * For example, since single chord shortcuts would not force users to release all keys, then the user can hold a modifier and execute multiple single chord shortcuts (e.g. Make a text bold with `Ctrl+B` then italicize it with `Ctrl+I`) without releasing the modifier between them. Also suppose you have a shortcut for just the modifier, `Ctrl`, that does something like change the cursor to indicate multi cursor insertion. As the user released `B` then `I` it would retrigger each time, also changing the cursor between shortcuts.
	 *
	 * Only shortcuts with chains longer than one chord would reasonably require the user to release all keys. Suppose the bold/italic shortcuts were `Ctrl+X Ctrl+B/I`. It does not make much sense in that case to allow the `Ctrl` only shortcut to still trigger after.
	 *
	 */
	// wut what did i mean * You could `set("chain", [[ctrl,b/i]])` for each and still allow `Ctrl`
	smartClearChain(): void {
		if (this.chain.length > 1) this.clearChain()
	}

	/**
	 * Force clears/resets all state. Clears the chain and sets all keys to unpressed.
	 *
	 * Useful for testing.
	 *
	 * @param opts
	 * @param {false} opts.ignoreNative  If true, does not change state of native modifier/toggle keys.
	 */
	forceClear({ ignoreNative = false }: { ignoreNative?: boolean } = {}): void {
		this.clearChain()
		this._nextIsChord = true
		this._untrigger = false
		setReadOnly(this, "isAwaitingKeyup", false)
		for (const key of Object.values(this.keys.entries)) {
			if ((key.is.modifier === "native" || key.is.toggle === "native") && ignoreNative) return
			key.set("pressed", false)
			if (isToggleRootKey(key)) {
				key.on!.set("pressed", false)
				key.off!.set("pressed", false)
			}
		}
	}

	/**
	 * Sets the chain but bypasses `set` logic while still triggering hooks.
	 */
	private _setChain(chain: Key[][]): void {
		this._bypassChainSet = true
		this.set("chain", chain)
		this._bypassChainSet = false
	}

	private _checkUntrigger(e?: AnyInputEvent): void {
		if (this._untrigger) {
			const untrigger: TriggerableShortcut = this._untrigger
			// MUST be set to false first or we can get into an infinite loop if the user uses `set(chain)` from inside the command execute function
			this._untrigger = false
			if (!this.enabled) return
			untrigger.command.execute?.({ isKeydown: false, command: untrigger.command, shortcut: untrigger, manager: this, event: e })
		}
	}

	private _checkTrigger(e?: AnyInputEvent): void {
		this._checkUntrigger(e)
		if (!this.enabled) return
		const res = this._getTriggerableShortcut()
		if (res.isError) {
			if (res.error.code !== ERROR.RECORDING) {
				this.cb(res.error as KnownError<ERROR.MULTIPLE_MATCHING_SHORTCUTS>, this, e)
			}
		} else if (res.value) {
			this._untrigger = res.value
			if (!this.isRecording) {
				res.value.command.execute?.({
					isKeydown: true,
					command: res.value.command,
					shortcut: res.value,
					manager: this,
					event: e,
				})
			}
		}
		console.log({ res: !!res.value }, "'", this.stringifier.stringify(this.lastChord() ?? []), "'")


		if (this.lastChord()?.find(key => isTriggerKey(key))) {
			if (this.inChain() || this.isRecording) {
				this._nextIsChord = true
				setReadOnly(this, "isAwaitingKeyup", true)
			} else if (!this.isRecording && (res.isOk && !res.value) && this.chain.length > 1) {
				const error = new KnownError(ERROR.NO_MATCHING_SHORTCUT, "A chord containing a non-modifier key was pressed while in a chord chain, but no shortcut found to trigger.", { chain: this.chain })
				this.cb(error, this, e)
			}
		}
	}

	private _getTriggerableShortcut(): Result<false | TriggerableShortcut, KnownError<ERROR.RECORDING | ERROR.MULTIPLE_MATCHING_SHORTCUTS>> {
		if (this.isRecording) return Err(new KnownError(ERROR.RECORDING, "", undefined))
		const shortcuts = this.shortcuts.query(shortcut => shortcut.triggerableBy(this.chain, this.context))
		if (shortcuts.length === 0) return Ok(false)
		if (shortcuts.length > 1) {
			return Err(new KnownError(ERROR.MULTIPLE_MATCHING_SHORTCUTS, crop`Multiple commands are assigned to the key combination ${this.stringifier.stringify(this.chain)}:
			${indent(shortcuts.map(shortcut => shortcut.command!.name).join("\n"), 4)}
			`, { shortcuts }))
		} else {
			return Ok(shortcuts[0] as TriggerableShortcut)
		}
	}

	private _addToChain(keys: Key[], e: AnyInputEvent): void {
		if (keys.length === 0) return
		// the chain was just cleared
		// the user could have released only part of the keys then pressed others
		// we should ignore all keypresses until they are all released
		if (this.isAwaitingKeyup) return
		if (this._nextIsChord) {
			this._setChain([...this.chain, []])
			this._nextIsChord = false
		}
		const length = this.chain.length - 1
		const lastChord = this.chain[length] ?? []
		for (const key of keys) {
			if (!lastChord.includes(key) && !this.isAwaitingKeyup) {
				lastChord.push(key)
				this._setChain([...this.chain.slice(0, length), this.sorter.sort(lastChord)])
				this._checkTrigger(e)
			}
		}
	}

	private _removeFromChain(keys: Key[], e: AnyInputEvent): void {
		if (keys.length === 0) return

		if (this.isAwaitingKeyup) {
			this._checkUntrigger(e)
			if (this.pressedNonModifierKeys().length === 0) {
				setReadOnly(this, "isAwaitingKeyup", false)
			}
		} else {
			if (this._nextIsChord) return
			const lastChord = this.lastChord() ?? []
			for (const key of keys) {
				const i = lastChord.indexOf(key)

				if (i > -1) {
					lastChord.splice(i, 1)
					this._setChain([...this.chain.slice(0, this.chain.length - 1), ...(lastChord.length > 0 ? [lastChord] : [])])
				}
			}
			this._checkTrigger(e)
		}
	}

	private _setEmulatedToggleState(key: Key, value: boolean): void {
		key.on!.set("pressed", value)
		key.off!.set("pressed", !value)
	}

	private _setKeyState(keys: Key[], state: boolean): void {
		for (const key of keys) {
			if (key.pressed === state) {
				continue
			}
			key.set("pressed", state)

			if (state) {
				// toggles are considered active on keydown
				if (key.is.toggle === "emulated") {
					// state was never set
					if (key.on!.pressed && key.off!.pressed) {
						throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key)} is a toggle key whose on and off versions are both pressed, which is not a valid state. If manually setting pressed state, use Key.toggleToggle for easier setting of a toggle key's pressed state.`, { key })
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
	}

	private _getModifierState(key: Key, e: AnyInputEvent): boolean | null {
		if (!this.checkStateOnAllEvents || !key.checkStateOnAllEvents) return null
		for (const code of [key.id, ...key.variants ?? []]) {
			if (e.getModifierState(code)) return true
		}
		return false
	}

	/**
	 * Should be checked after we attempt to process the event and set key states.
	 *
	 * This should cause it to only actually change the state if it was changed off-focus.
	 *
	 * Technically not neccesary with wheel/mouse events, but ordered similarly for consistency.
	 *
	 * Modifiers need to be added/removed from the chain on changes, but not toggles.
	 *
	 * Mutates the passed keys array to remove processed keys.
	 */
	private _checkSpecialKeys(e: AnyInputEvent, keys: Key[]): void {
		for (const key of this._nativeToggleKeys) {
			if (key.on.pressed && key.off.pressed) {
				throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key as Key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key: key as Key })
			}
			// this does not guarantee the key code is valid
			// it just returns false even for made up keys
			const modifierState = this._getModifierState(key as Key, e)

			if (modifierState === null) continue
			if (modifierState) {
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
		const added: Key[] = []
		const removed: Key[] = []
		for (const key of this._nativeModifierKeys) {
			const modifierState = this._getModifierState(key, e)
			if (modifierState === null) continue
			if (modifierState) {
				if (!key.pressed) {
					key.set("pressed", true)
					added.push(key)
				}
			} else {
				if (key.pressed) {
					key.set("pressed", false)
					removed.push(key)
				}
			}
		}

		if (added.length > 0) {
			this._addToChain(added, e)
			const indexes = keys.map(key => added.indexOf(key)).filter(i => i > -1)
			multisplice(keys, indexes)
		}
		if (removed.length > 0) {
			this._removeFromChain(removed, e)
			const indexes = keys.map(key => added.indexOf(key)).filter(i => i > -1)
			multisplice(keys, indexes)
		}
	}

	/**
	 * Force the manager to update the state of modifier/toggle keys during a keyboard or mouse event.
	 */
	updateModifiersState(e: KeyboardEvent | MouseEvent): void {
		this._checkSpecialKeys(e, [])
	}

	private _unknownKey(e: KeyboardEvent): void {
		this.cb(new KnownError(ERROR.UNKNOWN_KEY_EVENT, `An unknown key (code: ${e.code} key:${e.key}) was pressed.`, { e }), this, e)
	}

	private _keydown(e: KeyboardEvent): void {
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)))!

		for (const listener of this._listeners) listener({ event: e, keys, isKeydown: true })

		if (keys.length === 0) { this._unknownKey(e); return }
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e, keys)
		this._checkLabel(e, "key", keys)
		this._addToChain(keys, e)
	}

	private _keyup(e: KeyboardEvent): void {
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)))!

		for (const listener of this._listeners) listener({ event: e, keys, isKeydown: false })

		if (keys.length === 0) {this._unknownKey(e); return}
		this._setKeyState(keys, false)
		this._checkSpecialKeys(e, keys)
		this._checkLabel(e, "key", keys)
		this._removeFromChain(keys, e)
	}

	private _wheel(e: WheelEvent): void {
		const dir = e.deltaY < 0 ? "Up" : "Down"
		const code = `Wheel${dir}`
		const keys = this.keys.query(key => (key.id === code || key.variants?.includes(code)) && !key.pressed)!

		for (const listener of this._listeners) listener({ event: e, keys, isKeydown: true })

		this._setKeyState(keys, true)
		this._checkSpecialKeys(e, keys)
		this._checkLabel(e, "deltaY", keys)
		this._addToChain(keys, e)
		this._setKeyState(keys, false)
		this._removeFromChain(keys, e)
	}

	private _mousedown(e: MouseEvent): void {
		const button = e.button.toString()
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && !key.pressed)!

		for (const listener of this._listeners) listener({ event: e, keys, isKeydown: true })

		this._setKeyState(keys, true)
		this._checkSpecialKeys(e, keys)
		this._checkLabel(e, "button", keys)
		this._addToChain(keys, e)
	}

	private _mouseup(e: MouseEvent): void {
		const button = e.button.toString()
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && key.pressed)!

		for (const listener of this._listeners) listener({ event: e, keys, isKeydown: false })

		this._setKeyState(keys, false)
		this._checkSpecialKeys(e, keys)
		this._checkLabel(e, "button", keys)
		this._removeFromChain(keys, e)
	}

	private _mouseenter(e: MouseEvent): void {
		for (const listener of this._listeners) listener({ event: e, keys: [], isKeydown: false })
		this._checkSpecialKeys(e, [])
	}

	private _keysAddHook(_self: any, _entries: any, entry: Key): void {
		if (entry.is.toggle === "native"
			&& isToggleRootKey(entry)
			&& !this._nativeToggleKeys.includes(entry as ToggleRootKey)
		) {
			this._nativeToggleKeys.push(entry as ToggleRootKey)
		}
		if (entry.is.modifier === "native" && !this._nativeModifierKeys.includes(entry)) {
			this._nativeModifierKeys.push(entry)
		}
		if ([true, "both", "navigator"].includes(this.labelStrategy)) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			this._labelPromise.then(() => {
				if (this.keyboardMap) this._keyboardMapLabel(this.keyboardMap, entry)
			})
		}
	}

	private _keysRemoveHook(_self: any, _entries: any, entry: Key): void {
		const i = this._nativeToggleKeys.indexOf(entry as ToggleRootKey)
		if (i > -1) {
			this._nativeToggleKeys.splice(i)
		}
		const i2 = this._nativeModifierKeys.indexOf(entry)
		if (i2 > -1) {
			this._nativeToggleKeys.splice(i)
		}
		this._selfKeyboardMap.delete(entry)
	}

	private _keysAllowsRemoveHook(_self: any, _entries: any, entry: Key): Result<true, KnownError<ERROR.KEY_IN_USE>> {
		const found = this.shortcuts.query(shortcut => shortcut.containsKey(entry))

		if (found.length > 0) {
			return Err(new KnownError(ERROR.KEY_IN_USE, crop`
				Cannot remove key ${entry.id}, it is in used by the following shortcuts:

				${indent(found.map(shortcut => this.stringifier.stringify(shortcut.chain)).join("\n"), 4)}
				`, { entries: found }))
		}
		return Ok(true)
	}

	private _commandsAllowsRemoveHook(_self: any, _entries: any, entry: Command): Result<true, KnownError < ERROR.COMMAND_IN_USE >> {
		const found = this.shortcuts.query(shortcut => shortcut.command === entry)
		if (found.length > 0) {
			return Err(new KnownError(ERROR.COMMAND_IN_USE, crop`
				Cannot remove command ${entry.name}, it is in used by the following shortcuts:

				${indent(found.map(shortcut => this.stringifier.stringify(shortcut.chain)).join("\n"), 4)}
				`, { entries: found }))
		}
		return Ok(true)
	}

	private _shortcutAddHook(_self: any, _entries: any, shortcut: Shortcut): void {
		shortcut.addHook("allows", this._boundShortcutAllowsHook)
	}

	private _shortcutRemoveHook(_self: any, _entries: any, shortcut: Shortcut): void {
		shortcut.removeHook("allows", this._boundShortcutAllowsHook)
		if (this._nextIsChord && !this.inChain()) {
			this._nextIsChord = false
			this.clearChain()
		}
	}

	private _shortcutAllowsHook(prop: string, value: any, _old: any, self: Shortcut): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUT | ERROR.UNKNOWN_COMMAND_IN_SHORTCUT>> {
		if (prop === "chain") {
			return checkShortcutKeys({ chain: value as Key[][], command: self.command }, this.keys, this.stringifier, self)
		}
		if (prop === "command") {
			return checkShortcutCommands({ chain: self.chain, command: value as Command }, this.commands, this.stringifier, self)
		}
		return Ok(true)
	}

	protected override _set(key: keyof Manager | "replace", value: any): void {
		switch (key) {
			case "checkStateOnAllEvents": {
				if (this[key]) { // is enabled
					if (!value) { // gets disabled
						for (const el of this._els) {
							el.removeEventListener("mouseenter", this._boundMouseEnter)
						}
					}
				} else { // is disabled
					if (value) { // gets enabled
						for (const el of this._els) {
							el.addEventListener("mouseenter", this._boundMouseEnter)
						}
					}
				}
				setReadOnly(this, key, value)
				break
			}
			case "chain": {
				const isEmpty = value.length === 0
				if (!this._bypassChainSet) {
					if (this.pressedNonModifierKeys().length > 0) {
						setReadOnly(this, "isAwaitingKeyup", true)
					}
					this._checkUntrigger()
				}
				setReadOnly(this, "chain", Manager.cloneChain(value))

				if (!this._bypassChainSet) {
					if (!isEmpty) {
						this._nextIsChord = this.inChain()
						this._checkTrigger()
						this._checkUntrigger()
					} else {
						this._nextIsChord = true
					}
				}

				break
			}
			case "labelStrategy": {
				const deleteNav = value === false || value === "pressed"
				setReadOnly(this, "labelStrategy", value)
				if (deleteNav) {
					this.keyboardMap = undefined
					this._selfKeyboardMap = new Map()
				}
				this._labelPromise = this._labelStrategyStatus()
				break
			}
			case "replace":
				castType<ManagerReplaceValue>(value)
				if (value.shortcuts) {
					if (this.shortcuts) {
						this.shortcuts.removeHook("add", this._boundShortcutAddHook)
						this.shortcuts.removeHook("remove", this._boundShortcutRemoveHook)
						for (const entry of this.shortcuts.entries) entry.removeHook("allows", this._boundShortcutAllowsHook)
					}
					setReadOnly(this, "shortcuts", value.shortcuts)
					this.shortcuts.stringifier = this.stringifier
					this.shortcuts.stringifier = this.stringifier
					this.shortcuts.sorter = this.sorter
					this.shortcuts.addHook("add", this._boundShortcutAddHook)
					this.shortcuts.addHook("remove", this._boundShortcutRemoveHook)
					for (const entry of this.shortcuts.entries) entry.addHook("allows", this._boundShortcutAllowsHook)
				}
				if (value.keys) {
					if (this.keys) {
						this.keys.removeHook("add", this._boundKeysAddHook)
						this.keys.removeHook("remove", this._boundKeysRemoveHook)
						this.keys.removeHook("allowsRemove", this._boundKeysAllowsRemoveHook)
					}

					setReadOnly(this, "keys", value.keys)
					this.keys.stringifier = this.stringifier
					this._nativeToggleKeys = this.keys.query(k => k.is.toggle === "native" && isToggleRootKey(k), true) as ToggleRootKey[]
					this._nativeModifierKeys = this.keys.query(k => k.is.modifier === "native", true)

					this.keys.addHook("add", this._boundKeysAddHook)
					this.keys.addHook("remove", this._boundKeysRemoveHook)
					this.keys.addHook("allowsRemove", this._boundKeysAllowsRemoveHook)

					// eslint-disable-next-line @typescript-eslint/no-shadow
					for (const key of this._selfKeyboardMap.keys()) {
						if (this.keys.entries[key.id] !== key) {
							this._selfKeyboardMap.delete(key)
						}
					}
				}
				if (value.commands) {
					if (this.commands) {
						this.commands.removeHook("allowsRemove", this._boundCommandsAllowsRemoveHook)
					}
					setReadOnly(this, "commands", value.commands)
					this.commands.addHook("allowsRemove", this._boundCommandsAllowsRemoveHook)
				}
				break

			default:
				(this as any)[key] = value
				break
		}
	}

	protected override _allows<TKey extends keyof ManagerHook>(key: TKey, value: ManagerHook[TKey]["value"]): Result<true, ManagerHook[TKey]["error"]> {
		switch (key) {
			case "chain":
				castType<Key[][]>(value)
				// bypass checks for empty chords
				if (value.length === 1 && value[0].length === 0) return Ok(true)
				return isValidChain(this, value, this.stringifier, this.sorter)
			case "replace":
				castType<ManagerReplaceValue>(value)
				return checkManagerShortcuts(value.shortcuts ?? this.shortcuts, value.keys ?? this.keys, value.commands ?? this.commands, this.stringifier)
			case "shortcuts":
				return checkManagerShortcuts(value as Shortcuts, this.keys, this.commands, this.stringifier)
			case "keys":
				return checkManagerShortcuts(this.shortcuts, value as Keys, undefined, this.stringifier)
			case "commands":
				return checkManagerShortcuts(this.shortcuts, undefined, value as Commands, this.stringifier)
			default:
				return Ok(true)
		}
	}

	/**
	 * Exports the main state of the manager's shortcuts, commands, and keys in such a way that they can easily be stringified to/from JSON and imported again.
	 *
	 * Note that commands don't export their execute functions and you will most likely want to delete the commands property when exporting for end users.
	 */
	export(): ExportedManager {
		return {
			shortcuts: this.shortcuts.export(),
			commands: this.commands.export(),
			keys: this.keys.export(),
		}
	}

	/**
	 * Converts exported manager state back into real instance that can then be added.
	 *
	 * This takes care of mapping, for example, a shortcut's string keys to real keys. Same thing with commands.
	 *
	 * You can control how conditions are parsed (e.g. use a custom class) by passing a `parseCondition` function.
	 *
	 * This will by default only look at commands/keys in the inputed data. You can control whether to also attempt to fallback to the manager's keys/commands using the `fallbackToManager*` options.
	 *
	 * Note that with commands, if the command is found in the input, a "dummy" command is created. It will have not execute function. This can be useful, but usually what you'll want for an app is to force the user to use the built in commands and not allow importing/modifying exisiting ones.
	 *
	 * The function does not require you to give a list of commands, so what you can do is remove the commands property from the exported data (this would normally already be done when exporting so that you never export a list of commands anyways) and set `fallbackToManagerCommands: true` effectively forcing the function to only use existing commands.
	 *
	 * The same can be done with keys, though in that case it's effectively ignoring the exported keys completely. You should still go through them to import things like key positions/labels if you allow modifying those.
	 */
	import(
		input: ExportedManager,
		parseCondition: (condition: string) => Condition = (condition => new Condition(condition)),
		{
			fallbackToManagerKeys = false,
			fallbackToManagerCommands = false,
		}: {
			fallbackToManagerKeys?: boolean
			fallbackToManagerCommands?: boolean
		} = {}
	): Result<{ keys: Key[], commands: Command[], shortcuts: Shortcut[] }, KnownError<ERROR.IMPORT_COMMAND | ERROR.IMPORT_SHORTCUT_COMMAND |
	ERROR.IMPORT_SHORTCUT_KEY> | Error> {
		const generated: { keys: Record<string, Key>, commands: Record<string, Command>, shortcuts: Shortcut[] } = { keys: {}, commands: {}, shortcuts: []}
		if (input.keys) {
			for (const _key of Object.values(input.keys)) {
				const key = this.keys.create({ id: _key.id, opts: { ..._key as any } })
				generated.keys[key.id] = key
			}
		}
		if (input.commands) {
			for (const _command of Object.values(input.commands)) {
				const rawEntry: RawCommand = { ..._command, opts: { ..._command, condition: undefined } }
				if (_command.condition) {
					rawEntry.opts!.condition = parseCondition(_command.condition)
				}
				const command = this.commands.create(rawEntry)
				generated.commands[command.name] = command
			}
		}
		if (input.shortcuts) {
			for (const _shortcut of input.shortcuts) {
				for (const chord of _shortcut.chain) {
					for (const id of chord) {
						const key = generated.keys[id]
							?? (fallbackToManagerKeys ? this.keys.get(id) : undefined)
						if (key === undefined) {
							return Result.Err(new KnownError(ERROR.IMPORT_SHORTCUT_KEY, `Unknown key ${id} for shortcut ${pretty(_shortcut.chain, { oneline: true })}`, { id, shortcut: _shortcut }))
						}
					}
				}
				const rawEntry: RawShortcut = {
					chain: mapKeys(_shortcut.chain, id => this.keys.get(id)),
					opts: {
						..._shortcut,
						command: undefined,
						condition: undefined,
					},
				}
				if (_shortcut.command) {
					const found = generated.commands[_shortcut.command] ?? (fallbackToManagerCommands ? this.commands.get(_shortcut.command) : undefined)
					if (!found) {
						return Result.Err(new KnownError(ERROR.IMPORT_SHORTCUT_COMMAND, `Unknown command ${_shortcut.command} for shortcut ${pretty(_shortcut.chain, { oneline: true })}`, { command: _shortcut.command, shortcut: _shortcut }))
					} else {
						rawEntry.opts!.command = found
					}
				}
				if (_shortcut.condition) {
					rawEntry.opts!.condition = parseCondition(_shortcut.condition)
				}
				const shortcut = this.shortcuts.create(rawEntry)
				generated.shortcuts.push(shortcut)
			}
		}
		return Ok({
			keys: Object.values(generated.keys),
			commands: Object.values(generated.commands),
			shortcuts: generated.shortcuts,
		})
	}
}
