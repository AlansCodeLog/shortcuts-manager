import { crop, Err, indent, Ok, Result } from "@alanscodelog/utils"

import type { Command } from "./Command"
import type { Commands } from "./Commands"
import type { Keys } from "./Keys"
import { defaultSorter } from "./KeysSorter"
import { defaultStringifier } from "./KeysStringifier"
import type { Shortcut } from "./Shortcut"
import type { Shortcuts } from "./Shortcuts"

import type { Context, Key, KeysSorter, KeysStringifier } from "@/classes"
import { checkShortcutCommands, checkShortcutKeys, isModifierKey, isToggleRootKey, KnownError } from "@/helpers"
import { castType } from "@/helpers/castType"
import { checkManagerShortcuts } from "@/helpers/checkManagerShortcuts"
import { defaultManagerCallback } from "@/helpers/defaultManagerCallback"
import { MixinHookableBase } from "@/mixins/MixinHookableBase"
import { AnyInputEvent, BaseHook, CollectionHook, CommandsHooks, ERROR, KeysHooks, ManagerErrorCallback, ManagerHook, ManagerReplaceValue, ShortcutHooks, ShortcutsHooks, ToggleRootKey, TriggerableShortcut } from "@/types"


const sEnabled = Symbol("enabled")
const sTimers = Symbol("timers")
const sAwaitingKeyup = Symbol("awaitingKeyup")
const sUntrigger = Symbol("untrigger")
const sNativeToggleKeys = Symbol("nativeToggleKeys")
const sNativeModifierKeys = Symbol("nativeModifierKeys")
const sBoundKeydown = Symbol("boundKeydown")
const sBoundKeyup = Symbol("boundKeyup")
const sBoundMousedown = Symbol("boundMousedown")
const sBoundMouseup = Symbol("boundMouseup")
const sBoundWheel = Symbol("boundWheel")
const sBoundKeysAddHook = Symbol("boundKeysAddHook")
const sBoundKeysRemoveHook = Symbol("boundKeysRemoveHook")
const sBoundKeysAllowsRemoveHook = Symbol("boundKeysAllowsRemoveHook")
const sBoundCommandsAllowsRemoveHook = Symbol("boundCommandsAllowsRemoveHook")
const sBoundShortcutAddHook = Symbol("shortcutAddHook")
const sBoundShortcutRemoveHook = Symbol("shortcutRemoveHook")
const sBoundShortcutAllowsHook = Symbol("shortcutAllowsHook")

export class Manager extends MixinHookableBase<ManagerHook> {
	context: Context
	keys!: Keys
	commands!: Commands
	shortcuts!: Shortcuts
	stringifier: KeysStringifier
	sorter: KeysSorter
	private [sTimers]: Map<Key, number | NodeJS.Timeout> = new Map()
	/**
	 * There are cases when a keyup event might never fire because it happened out of focus.
	 *
	 * This sets how long to wait after the last keydown event before simulating a keyup event.
	 *
	 * This will mean a key release is simulated when the user looses focus (since the element will stop getting keydown events).
	 */
	autoReleaseDelay: number
	private [sEnabled]: boolean = true
	private [sAwaitingKeyup]: boolean = false
	private [sUntrigger]: false | TriggerableShortcut = false
	private [sNativeToggleKeys]: ToggleRootKey[] = []
	private [sNativeModifierKeys]: Key[] = []

	private [sBoundKeydown]: Manager["_keydown"]
	private [sBoundKeyup]: Manager["_keyup"]
	private [sBoundMousedown]: Manager["_mousedown"]
	private [sBoundMouseup]: Manager["_mouseup"]
	private [sBoundWheel]: Manager["_wheel"]
	private [sBoundKeysAddHook]: CollectionHook<"add", KeysHooks>
	private [sBoundKeysRemoveHook]: CollectionHook<"remove", KeysHooks>
	private [sBoundKeysAllowsRemoveHook]: CollectionHook<"allowsRemove", KeysHooks>
	private [sBoundCommandsAllowsRemoveHook]: CollectionHook<"allowsRemove", CommandsHooks>
	private [sBoundShortcutAddHook]: CollectionHook<"add", ShortcutsHooks>
	private [sBoundShortcutRemoveHook]: CollectionHook<"remove", ShortcutsHooks>
	private [sBoundShortcutAllowsHook]: BaseHook<"allows", ShortcutHooks>
	/**
	 * The current chain of chords.
	 *
	 * Note that it does not allow `allows` hooks, only `set` hooks.
	 */
	readonly chain!: Key[][]
	/**
	 * The error callback for recoverable errors such as multiple shortcuts matching, or no shortcut matching once a chord chain has been "started".
	 *
	 * Usually you will want to clear the manager's chain when this happens and display the error to the user.
	 *
	 * In the case of multiple valid shortcuts, if you trigger any of the shortcuts "manually" note that you will to simulate both the keydown/keyup calls if you differentiate between them.
	 *
	 * The default callback logs the error and clears the chain.
	 *
	 * Note the event parameter might be undefined because it might not exist when the manager needs to emulate a key release. See {@link Manager.autoReleaseDelay}
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
	 * 		// for when keyup events happen out of focus
	 * 		autoReleaseDelay: 500
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
	 * ### Notes
	 *
	 * - **The creation of the manager can throw since it checks whether shortcuts contain known keys/commands.**
	 *
	 * - The manager adds hooks to the {@link Keys} and {@link Commands} to prevent removal of keys/commands that are in use.
	 *
	 * ### Other
	 *
	 * - If you need to emulate keypresses for testing see {@link Emulator}.
	 *
	 * Other common things you might want/need to do though:
	 *
	 * - Add a shortcut to a command that can clear the manager's chord chain (e.g. `Escape`).
	 *
	 * - Add a set hook to listen to key presses to display that for the user.
	 *
	 * - Add a trigger/allows hook for shortcut/command triggers if there is some outside state you want to check that is not easily translated to the context object. Note that not triggering a shortcut will not clear the current chord chain.
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
			autoKeyupDelay = 500,
		}: {
			stringifier?: KeysStringifier
			sorter?: KeysSorter
			autoKeyupDelay?: number
		} = {},
	) {
		super()
		this[sBoundKeydown] = this._keydown.bind(this)
		this[sBoundKeyup] = this._keyup.bind(this)
		this[sBoundMousedown] = this._mousedown.bind(this)
		this[sBoundMouseup] = this._mouseup.bind(this)
		this[sBoundWheel] = this._wheel.bind(this)
		this[sBoundKeysAddHook] = this._keysAddHook.bind(this)
		this[sBoundKeysRemoveHook] = this._keysRemoveHook.bind(this)
		this[sBoundKeysAllowsRemoveHook] = this._keysAllowsRemoveHook.bind(this)
		this[sBoundCommandsAllowsRemoveHook] = this._commandsAllowsRemoveHook.bind(this)
		this[sBoundShortcutAddHook] = this._shortcutAddHook.bind(this)
		this[sBoundShortcutRemoveHook] = this._shortcutRemoveHook.bind(this)
		this[sBoundShortcutAllowsHook] = this._shortcutAllowsHook.bind(this)

		this._mixin({
			hookable: { keys: ["allows", "set"]},
		})

		if (cb) this.cb = cb

		this.set("chain", [[]])

		this.context = context
		this.stringifier = stringifier ?? defaultStringifier
		this.sorter = sorter ?? defaultSorter
		this.autoReleaseDelay = autoKeyupDelay
		if (this.allows("replace", { shortcuts, keys, commands }).unwrap()) {
			this.set("replace", { shortcuts, keys, commands })
		}
	}
	/**
	 * Returns if the manager is waiting for all keys to release.
	 *
	 * See {@link Manager.setChain}
	 */
	isAwaitingKeyup(): boolean {
		return this[sAwaitingKeyup]
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
	 * Attach the manager to an element so it can listen to the needed event listeners.
	 */
	attach(el: { addEventListener: HTMLElement["addEventListener"] }): void {
		el.addEventListener("keydown", this[sBoundKeydown])
		el.addEventListener("keyup", this[sBoundKeyup])
		el.addEventListener("wheel", this[sBoundWheel])
		el.addEventListener("mousedown", this[sBoundMousedown])
		el.addEventListener("mouseup", this[sBoundMouseup])
	}
	/**
	 * Detach the manager from an element and remove all it's event listeners.
	 */
	detach(el: { removeEventListener: HTMLElement["removeEventListener"] }): void {
		el.removeEventListener("keydown", this[sBoundKeydown])
		el.removeEventListener("keyup", this[sBoundKeyup])
		el.removeEventListener("wheel", this[sBoundWheel])
		el.removeEventListener("mousedown", this[sBoundMousedown])
		el.removeEventListener("mouseup", this[sBoundMouseup])
	}
	/**
	 * Return whether the current chord chain state partially matches a shortcut which can be triggered.
	 *
	 * Returns false if awaiting keyup.
	 */
	inChain(): boolean {
		if (this[sAwaitingKeyup]) return false
		const shortcuts = this.shortcuts.query(shortcut =>
			shortcut.enabled &&
			shortcut.command &&
			shortcut.command.execute &&
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
	 * In the rare case you might want to set the chain, this is a wrapper around `set("chain", ...)`\* that will set it properly such that:
	 *
	 * If there are still keys being pressed, the manager waits until they are all released before allowing keys to be added to the chain again.
	 *
	 * This prevents us from getting into potentially invalid states or triggering shortcuts when we shouldn't.
	 *
	 * **\*Avoid using `set("chain", ...)` directly.**
	 */
	setChain(keys: Key[][]): void {
		this.set("chain", keys)
		if (this.pressedKeys().length > 0) {
			this[sAwaitingKeyup] = true
		}
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
		this[sUntrigger] = false
		this[sAwaitingKeyup] = false
		for (const [key] of this[sTimers].entries()) {
			this._clearKeyTimer(key)
		}
		for (const key of Object.values(this.keys.entries)) {
			if ((key.is.modifier === "native" || key.is.toggle === "native") && ignoreNative) return
			key.set("pressed", false)
			if (isToggleRootKey(key)) {
				key.on!.set("pressed", false)
				key.off!.set("pressed", false)
			}
		}
	}
	private _checkTrigger(e?: AnyInputEvent): void {
		if (this[sUntrigger]) {
			const untrigger: TriggerableShortcut = this[sUntrigger] as TriggerableShortcut
			untrigger.command.execute(false, untrigger.command, untrigger, this, e)
			this[sUntrigger] = false
		}
		const res = this._getTriggerableShortcut()
		if (res.isError) {
			this.cb(res.error, this, e)
		} else if (res.value) {
			this[sUntrigger] = res.value
			res.value.command.execute(true, res.value.command, res.value, this, e)
		}
		if (this.chain[this.chain.length - 1].find(key => !isModifierKey(key))) {
			if (this.inChain()) {
				this.set("chain", [...this.chain, []])
				this[sAwaitingKeyup] = true
			} else if ((res.isOk && !res.value) && this.chain.length > 1) {
				const error = new KnownError(ERROR.NO_MATCHING_SHORTCUT, "A chord containing a non-modifier key was pressed while in a chord chain, but no shortcut found to trigger.", { chain: this.chain })
				this.cb(error, this, e)
			}
		}
	}
	private _getTriggerableShortcut(): Result<false | TriggerableShortcut, KnownError<ERROR.MULTIPLE_MATCHING_SHORTCUTS>> {
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
		// the chain was just cleared
		// the user could have released only part of the keys then pressed others
		// we should ignore all keypresses until they are all released
		if (this[sAwaitingKeyup]) return
		const length = this.chain.length - 1
		const lastChord = [...this.chain[length]]
		for (const key of keys) {
			if (!lastChord.includes(key) && !this[sAwaitingKeyup]) {
				lastChord.push(key)
				this.set("chain", [...this.chain.slice(0, length), lastChord])
				this.sorter.sort(lastChord)
				this._checkTrigger(e)
			}
		}
	}
	private _removeFromChain(keys: Key[], e?: AnyInputEvent): void {
		if (this[sUntrigger]) {
			const untrigger: TriggerableShortcut = this[sUntrigger] as TriggerableShortcut
			untrigger.command.execute(false, untrigger.command, untrigger, this, e)
			this[sUntrigger] = false
		}
		const lastChord = [...this.chain[this.chain.length - 1]]

		if (this[sAwaitingKeyup]) {
			if (this.pressedKeys().length === 0) {
				this[sAwaitingKeyup] = false
			}
		} else {
			for (const key of keys) {
				const i = lastChord.indexOf(key)

				if (i > -1) {
					lastChord.splice(i, 1)
					this._checkTrigger(e)
				}
			}
			this.set("chain", [...this.chain.slice(0, this.chain.length - 1), lastChord])
		}
	}
	private _setEmulatedToggleState(key: Key, value: boolean): void {
		key.on!.set("pressed", value)
		key.off!.set("pressed", !value)
	}
	private _setKeyTimer(key: Key): void {
		this[sTimers].set(key, setTimeout(() => {
			key.set("pressed", false)
			this._removeFromChain([key], undefined)
		}, this.autoReleaseDelay))
	}
	private _clearKeyTimer(key: Key): void {
		const timer = this[sTimers].get(key)
		clearTimeout(timer as number)
		this[sTimers].delete(key)
	}
	private _setKeyState(keys: Key[], state: boolean): void {
		for (const key of keys) {
			key.set("pressed", state)
			this._clearKeyTimer(key)
			if (state) {
				// toggles are considered active on keydown
				if (key.is.toggle === "emulated") {
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
				this._setKeyTimer(key)
			}
		}
	}
	private _getModifierState(key: Key, e: AnyInputEvent): boolean {
		return [key.id, ...key.variants ?? []].find(code => e.getModifierState(code)) !== undefined
	}
	/**
	 * Should be checked after we attempt to process the event and set key states.
	 *
	 * This should cause it to only actually change the state if it was changed off-focus.
	 *
	 * Technically not neccesary with wheel/mouse events, but ordered similarly for consistency.
	 *
	 * Modifiers need to be added/removed from the chain on changes, but not toggles.
	 */
	private _checkSpecialKeys(e: AnyInputEvent): void {
		for (const key of this[sNativeToggleKeys]) {
			if (key.on.pressed && key.off.pressed) {
				throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key as Key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key: key as Key })
			}
			// this does not guarantee the key code is valid
			// it just returns false even for made up keys
			if (this._getModifierState(key as Key, e)) {
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
		const added = []
		const removed = []
		for (const key of this[sNativeModifierKeys]) {
			if (this._getModifierState(key, e)) {
				if (!key.pressed) {
					key.set("pressed", true)
					this._clearKeyTimer(key)
					this._setKeyTimer(key)
					added.push(key)
				}
			} else {
				if (key.pressed) {
					key.set("pressed", false)
					this._clearKeyTimer(key)
					this._setKeyTimer(key)
					removed.push(key)
				}
			}
		}

		this._addToChain(added, e)
		this._removeFromChain(removed, e)
	}
	private _keydown(e: KeyboardEvent): void {
		if (!this[sEnabled]) return
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e)
		this._addToChain(keys, e)
	}
	private _keyup(e: KeyboardEvent): void {
		if (!this[sEnabled]) return
		const keys = this.keys.query(key => (key.id === e.code || key.variants?.includes(e.code)) && key.pressed)!
		this._setKeyState(keys, false)
		this._checkSpecialKeys(e)
		this._removeFromChain(keys, e)
	}
	private _wheel(e: WheelEvent): void {
		if (!this[sEnabled]) return
		const dir = e.deltaY < 0 ? "Up" : "Down"
		const code = `Wheel${dir}`
		const keys = this.keys.query(key => (key.id === code || key.variants?.includes(code)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e)
		this._addToChain(keys, e)
		this._setKeyState(keys, false)
		this._removeFromChain(keys, e)
	}
	private _mousedown(e: MouseEvent): void {
		if (!this[sEnabled]) return
		const button = e.button as any as string
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && !key.pressed)!
		this._setKeyState(keys, true)
		this._checkSpecialKeys(e)
		this._addToChain(keys, e)
	}
	private _mouseup(e: MouseEvent): void {
		if (!this[sEnabled]) return
		const button = e.button as any as string
		const keys = this.keys.query(key => (key.id === button || key.variants?.includes(button)) && key.pressed)!
		this._setKeyState(keys, false)
		this._checkSpecialKeys(e)
		this._removeFromChain(keys, e)
	}
	private _keysAddHook(entry: Key): void {
		if (entry.is.toggle === "native"
			&& isToggleRootKey(entry)
			&& !this[sNativeToggleKeys].includes(entry as ToggleRootKey)
		) {
			this[sNativeToggleKeys].push(entry as ToggleRootKey)
		}
		if (entry.is.modifier === "native" && !this[sNativeModifierKeys].includes(entry)) {
			this[sNativeModifierKeys].push(entry)
		}
	}
	private _keysRemoveHook(entry: Key): void {
		const i = this[sNativeToggleKeys].indexOf(entry as ToggleRootKey)
		if (i > -1) {
			this[sNativeToggleKeys].splice(i)
		}
		const i2 = this[sNativeModifierKeys].indexOf(entry)
		if (i2 > -1) {
			this[sNativeToggleKeys].splice(i)
		}
	}
	private _keysAllowsRemoveHook(entry: Key): Result<true, KnownError<ERROR.KEY_IN_USE>> {
		const found = this.shortcuts.query(shortcut => shortcut.containsKey(entry))

		if (found.length > 0) {
			return Err(new KnownError(ERROR.KEY_IN_USE, crop`
				Cannot remove key ${entry.id}, it is in used by the following shortcuts:

				${indent(found.map(shortcut => this.stringifier.stringify(shortcut.chain)).join("\n"), 4)}
				`, { entries: found }))
		}
		return Ok(true)
	}
	private _commandsAllowsRemoveHook(entry: Command): Result<true, KnownError < ERROR.COMMAND_IN_USE >> {
		const found = this.shortcuts.query(shortcut => shortcut.command === entry)
		if (found.length > 0) {
			return Err(new KnownError(ERROR.COMMAND_IN_USE, crop`
				Cannot remove command ${entry.name}, it is in used by the following shortcuts:

				${indent(found.map(shortcut => this.stringifier.stringify(shortcut.chain)).join("\n"), 4)}
				`, { entries: found }))
		}
		return Ok(true)
	}
	private _shortcutAddHook(shortcut: Shortcut): void {
		shortcut.addHook("allows", this[sBoundShortcutAllowsHook])
	}
	private _shortcutRemoveHook(shortcut: Shortcut): void {
		shortcut.removeHook("allows", this[sBoundShortcutAllowsHook])
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
	protected override _set(key: string, value: any): void {
		switch (key) {
			case "replace":
				castType<ManagerReplaceValue>(value)
				if (value.shortcuts) {
					if (this.shortcuts) {
						this.shortcuts.removeHook("add", this[sBoundShortcutAddHook])
						this.shortcuts.removeHook("remove", this[sBoundShortcutRemoveHook])
						for (const entry of this.shortcuts.entries) entry.removeHook("allows", this[sBoundShortcutAllowsHook])
					}
					this.shortcuts = value.shortcuts
					this.shortcuts.stringifier = this.stringifier
					this.shortcuts.stringifier = this.stringifier
					this.shortcuts.sorter = this.sorter
					this.shortcuts.addHook("add", this[sBoundShortcutAddHook])
					this.shortcuts.addHook("remove", this[sBoundShortcutRemoveHook])
					for (const entry of this.shortcuts.entries) entry.addHook("allows", this[sBoundShortcutAllowsHook])
				}
				if (value.keys) {
					if (this.keys) {
						this.keys.removeHook("add", this[sBoundKeysAddHook])
						this.keys.removeHook("remove", this[sBoundKeysRemoveHook])
						this.keys.removeHook("allowsRemove", this[sBoundKeysAllowsRemoveHook])
					}

					this.keys = value.keys
					this.keys.stringifier = this.stringifier
					this[sNativeToggleKeys] = this.keys.query(k => k.is.toggle === "native" && isToggleRootKey(k), true) as ToggleRootKey[]
					this[sNativeModifierKeys] = this.keys.query(k => k.is.modifier === "native", true)

					this.keys.addHook("add", this[sBoundKeysAddHook])
					this.keys.addHook("remove", this[sBoundKeysRemoveHook])
					this.keys.addHook("allowsRemove", this[sBoundKeysAllowsRemoveHook])
				}
				if (value.commands) {
					if (this.commands) {
						this.commands.removeHook("allowsRemove", this[sBoundCommandsAllowsRemoveHook])
					}
					this.commands = value.commands
					this.commands.addHook("allowsRemove", this[sBoundCommandsAllowsRemoveHook])
				}
				break
			default:
				(this as any)[key] = value
				break
		}
	}
	protected override _allows(key: string, value: any): Result<true, KnownError<ERROR.UNKNOWN_KEYS_IN_SHORTCUTS | ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS>> {
		switch (key) {
			case "replace":
				castType<ManagerReplaceValue>(value)
				return checkManagerShortcuts(value.shortcuts ?? this.shortcuts, value.keys ?? this.keys, value.commands ?? this.commands, this.stringifier)
			case "shortcuts":
				return checkManagerShortcuts(value, this.keys, this.commands, this.stringifier)
			case "keys":
				return checkManagerShortcuts(this.shortcuts, value, undefined, this.stringifier)
			case "commands":
				return checkManagerShortcuts(this.shortcuts, undefined, value, this.stringifier)
			default:
				return Ok(true)
		}
	}
}
