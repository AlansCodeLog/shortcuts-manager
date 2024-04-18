import { expectType } from "@alanscodelog/utils"
import { walk } from "@alanscodelog/utils/walk.js"
import { afterEach, beforeEach, describe, expect, it, type Mock, type MockedFunction, vi } from "vitest"

import { manager as baseManager } from "./helpers.keys.js"

import { addCommand } from "../src/addCommand.js"
import { addShortcut } from "../src/addShortcut.js"
import { attach } from "../src/attach.js"
import { createCommand } from "../src/createCommand.js"
import { createCommands } from "../src/createCommands.js"
import { createContext } from "../src/createContext.js"
import { createKey } from "../src/createKey.js"
import { createKeys } from "../src/createKeys.js"
import { createManager } from "../src/createManager.js"
import { createManagerEventListeners } from "../src/createManagerEventListeners.js"
import { createManagerOptions } from "../src/createManagerOptions.js"
import { createShortcut } from "../src/createShortcut.js"
import { createShortcuts } from "../src/createShortcuts.js"
import { detach } from "../src/detach.js"
import { Emulator } from "../src/Emulator.js"
import { forceClear } from "../src/helpers/forceClear.js"
import { isValidManager } from "../src/helpers/isValidManager.js"
import { type KnownError } from "../src/helpers/KnownError.js"
import { labelWithEvent } from "../src/helpers/labelWithEvent.js"
import { safeSetManagerChain } from "../src/helpers/safeSetManagerChain.js"
import { cloneLastChord } from "../src/internal/cloneLastChord.js"
import { setCommandProp } from "../src/setCommandProp.js"
import { setKeyProp } from "../src/setKeyProp.js"
import { setManagerProp } from "../src/setManagerProp.js"
import { setShortcutProp } from "../src/setShortcutProp.js"
import { type ChainErrors,type Command,type CommandExecute, type Context,ERROR, type Key,type Manager, type MultipleErrors, type Shortcut } from "../src/types/index.js"


vi.useFakeTimers()

afterEach(() => {
	vi.useFakeTimers()
})
let ignoreError = false
	

describe("basic functions", () => {
	describe("should correctly add/remove from manager.state.chain state", () => {
		const callback = vi.fn(((manager, error, _e) => {
			setManagerProp(manager, "state.chain", [])
			if (!ignoreError && error.code === ERROR.UNKNOWN_KEY_EVENT) {
				throw error
			}
		}) as Manager["options"]["cb"])

		type MockedCommandFunction = MockedFunction<CommandExecute>
		// eslint-disable-next-line no-empty-pattern
		const executeNoClear: MockedCommandFunction = vi.fn((({}) => {}))
		const executeOnKeydown: MockedCommandFunction = vi.fn((({ isKeydown, manager }) => {
			if (isKeydown) {
				safeSetManagerChain(manager!, [])
			}
		}))
		const executeOnKeyup: MockedCommandFunction = vi.fn((({ isKeydown, manager }) => {
			if (!isKeydown) {
				safeSetManagerChain(manager!, [])
			}
		}))
		const a = createKey("KeyA").unwrap()
		const b = createKey("KeyB").unwrap()
		const c = createKey("KeyC").unwrap()
		const d = createKey("KeyD").unwrap()
		const esc = createKey("Escape", { enabled: false }).unwrap()
		const cl = createKey("CapsLock", { isToggle: "native" }).unwrap()
		const ctrl = createKey("Control", { isModifier: "native", variants: ["ControlLeft", "ControlRight"]}).unwrap()
		const sl = createKey("ScrollLock", { isToggle: "emulated" }).unwrap()
		const shift = createKey("shift", { isModifier: "emulated", variants: ["ShiftLeft", "ShiftRight"]}).unwrap()
		const shiftVariant = createKey("shiftVariant", { isModifier: "emulated", variants: ["ShiftLeft", "ShiftRight"]}).unwrap()
		const commandNoClear = createCommand("noClear", { execute: executeNoClear })
		const commandKeydown = createCommand("onKeydown", { execute: executeOnKeydown })
		const commandKeyup = createCommand("onKeyup", { execute: executeOnKeyup })
		const keys = createKeys([
			a,
			b,
			c,
			d,
			esc,
			cl,
			ctrl,
			sl,
			shift,
			// this checks that even though this is the same as shift, shortcuts with only shift or both shift and alt trigger
			shiftVariant,
		]).unwrap()
		const commands = createCommands([commandNoClear, commandKeydown, commandKeyup]).unwrap()
		const temp = { options: { ...baseManager.options }, keys, commands }

		const shortcuts = createShortcuts([
			createShortcut({ chain: [[esc]], command: commandNoClear.name }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, a]], command: commandNoClear.name }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, b]], command: commandKeydown.name }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, c]], command: commandKeyup.name }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, d], [ctrl, a]], command: commandNoClear.name }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, d], [ctrl, b]], command: commandKeydown.name }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, d], [ctrl, c]], command: commandKeyup.name }, temp).unwrap(),
			createShortcut({ chain: [[sl]], command: commandNoClear.name }, temp).unwrap(),
			createShortcut({ chain: [[cl]], command: commandNoClear.name }, temp).unwrap(),
			createShortcut({ chain: [[shift, a]], command: commandNoClear.name }, temp).unwrap(),
			createShortcut({ chain: [[shift, shiftVariant, d]], command: commandNoClear.name }, temp).unwrap(),
		], temp).unwrap()
		const context = createContext({})
		const manager = createManager(
			{
				...temp,
				context,
				shortcuts,
				options: {
					...temp.options,
					cb: callback,
				},
			}
		).unwrap()
		const emulator = new Emulator(manager.keys)
		// the emulator can't handler mouseenter events yet
		const listeners = createManagerEventListeners(manager)
		attach(emulator, listeners)
		emulator.mouseenter()

		beforeEach(() => {
			forceClear(manager)
			callback.mockClear()
			executeNoClear.mockClear()
			executeOnKeydown.mockClear()
			ignoreError = false
		})

		it("should call callback with unknown keys", () => {
			const emulatorWithoutKeysValidation = new Emulator()
			const emu = emulatorWithoutKeysValidation
			attach(emu, listeners)
			expect(() => {
				// regular emulator for testing throws on unknown key
				emulator.fire("Unknown")
			}).to.throw() // only because callback throws
			// this emu won't and it should reach the manger
			ignoreError = true
			emu.fire("Unknown+")
			
			detach(emu, listeners)
			expect(callback.mock.calls.length).to.equal(1)
		})
		it("disabled keys are not updated. shortcuts using them will not fire", () => {
			emulator.fire("Escape+")
			expect(esc.pressed).to.equal(false)
			emulator.fire("Escape-")
			expect(executeNoClear.mock.calls.length).to.equal(0)
		})
		it("shortcut with multiple keys that contain same variants fire", () => {
			emulator.fire("ShiftLeft+ KeyD+")
			expect(executeNoClear.mock.calls.length).to.equal(1)
			expect(shift.pressed).to.equal(true)
			expect(shiftVariant.pressed).to.equal(true)
			emulator.fire("ShiftLeft- KeyD-")
			expect(executeNoClear.mock.calls.length).to.equal(2)
		})
		it("should not error or add chain when start chord is not chain", () => {
			emulator.fire("KeyA+")

			expect(manager.state.chain).to.deep.equal([[a.id]])
			expect(callback.mock.calls.length).to.equal(0)

			emulator.fire("KeyA-")
			expect(manager.state.chain).to.deep.equal([])
		})
		it("chain - multiple chord without command and release before trigger", () => {
			emulator.fire("ControlLeft+ KeyD", ["ControlLeft"])
			emulator.fire("ControlLeft-", [])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft+", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id]])
			emulator.fire("ControlLeft-", [])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], []])
			// checking twice because there was a bug
			emulator.fire("ControlLeft+", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id]])
			emulator.fire("ControlLeft-", [])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], []])
		})
		it("chain - multiple chord with command with self clear on keydown", () => {
			emulator.fire("ControlLeft+ KeyD", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft-")
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
			// chain is cleared, but ctrl is still being held, once it's released
			// the manager can trigger new shortcuts
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
			expect(ctrl.pressed).to.equal(true)
			expect(manager.state.untrigger).to.equal(false)
			expect(manager.state.isAwaitingKeyup).to.equal(true)
			emulator.fire("ControlLeft+ KeyC+", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
			expect(manager.state.isAwaitingKeyup).to.equal(true)
			// other shorcuts will not trigger
			expect(executeOnKeyup.mock.calls.length).to.equal(0)

			emulator.fire("KeyB- KeyC- ControlLeft-")
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
			expect(manager.state.chain).to.deep.equal([])
		})
		it("chain - multiple chord with command with self clear on keyup", () => {
			emulator.fire("ControlLeft+ KeyD", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft-")
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft+ KeyC+", ["ControlLeft"])
			expect(executeOnKeyup.mock.calls.length).to.equal(1)
			// they will stay pressed until they are released
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, c.id]])
			expect(ctrl.pressed).to.equal(true)
			expect(manager.state.untrigger).to.not.equal(false)
			emulator.fire("ControlLeft+ KeyC-", ["ControlLeft"])
			expect(executeOnKeyup.mock.calls.length).to.equal(2)
			// new shortcuts can now trigger because there are only modifiers pressed
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
			expect(ctrl.pressed).to.equal(true)
			expect(manager.state.isAwaitingKeyup).to.equal(false)
			expect(manager.state.untrigger).to.equal(false)
			emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
			expect(manager.state.isAwaitingKeyup).to.equal(true)

			emulator.fire("KeyB- KeyC- ControlLeft-")
			expect(executeOnKeyup.mock.calls.length).to.equal(2)
			expect(manager.state.chain).to.deep.equal([])
		})
		it("chain - multiple chord with command without self clear", () => {
			emulator.fire("ControlLeft+ KeyD", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft-")
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
			expect(executeNoClear.mock.calls.length).to.equal(1)
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, a.id]])
			emulator.fire("KeyA- ControlLeft-")
			expect(executeNoClear.mock.calls.length).to.equal(2)
		})
		it("chain - single chord with command without self clear", () => {
			emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
			expect(executeNoClear.mock.calls.length).to.equal(1)
			expect(manager.state.chain).to.deep.equal([[ctrl.id, a.id]])
			// NOTE! this is like also releasing the modifier
			emulator.fire("KeyA-")
			expect(executeNoClear.mock.calls.length).to.equal(2)
			expect(manager.state.chain).to.deep.equal([])
		})
		it("chain - single chord with command with self clear", () => {
			emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
			emulator.fire("KeyB-")
		})

		it("chain - single chord without self clear - modifiers held", () => {
			emulator.fire("ControlLeft+ KeyA", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
			expect(executeNoClear.mock.calls.length).to.equal(2)
			emulator.fire("KeyB", ["ControlLeft"])
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
		})
		it("setChain will untrigger => trigger => untrigger on set on non self clearing command", () => {
			emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
			// just the opposite execute to differentiate between them
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
			safeSetManagerChain(manager, [[ctrl.id, d.id], [ctrl.id, a.id]])
			expect(executeNoClear.mock.calls.length).to.equal(2) // triggered => untriggered
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, a.id]])
		})
		it("setChain will untrigger => trigger => untrigger on set on self clearing command", () => {
			emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
			// just the opposite execute to differentiate between them
			expect(executeNoClear.mock.calls.length).to.equal(1)
			safeSetManagerChain(manager, [[ctrl.id, d.id], [ctrl.id, b.id]])
			expect(executeOnKeydown.mock.calls.length).to.equal(2) // triggered => untriggered
			expect(manager.state.chain).to.deep.equal([[ctrl.id]]) // self clears
		})
		it("invalid chain", () => {
			expect(executeOnKeydown.mock.calls.length).to.equal(0)
			emulator.fire("ControlLeft+ KeyD", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft-")
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft+ KeyD+", ["ControlLeft"])
			expect(callback.mock.calls.length).to.equal(1)
			expect(callback.mock.calls[0][1].code).to.equal(ERROR.NO_MATCHING_SHORTCUT)
			expect(manager.state.chain).to.deep.equal([])

			expect(executeNoClear.mock.calls.length).to.equal(0)
			expect(executeOnKeydown.mock.calls.length).to.equal(0)
		})
							
		it("ignores keypresses while maintaining modifiers right after triggering for chords", () => {
			emulator.fire("ControlLeft+ KeyD+", ["ControlLeft"])
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("KeyB+", ["ControlLeft"])
			expect(d.pressed).to.equal(true)
			expect(b.pressed).to.equal(true)
			expect(manager.state.isAwaitingKeyup).to.equal(true)
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			emulator.fire("ControlLeft- KeyD- KeyB-")
			expect(manager.state.isAwaitingKeyup).to.equal(false)
			// chord is kept
			expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id]])
			// stops ignoring
			emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
			expect(executeOnKeydown.mock.calls.length).to.equal(2)
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
		})
		it("native modifier key via getModifierState fire shortcuts", () => {
			emulator.fire("KeyA", ["ControlLeft"])
			expect(executeNoClear.mock.calls.length).to.equal(2)
		})
		// it makes no sense to do so since the state change might have happened out of focus a long time  ago
		it("native toggle key via getModifierState does NOT fire shortcuts", () => {
			emulator.fire("", ["CapsLock"])
			expect(executeNoClear.mock.calls.length).to.equal(0)
		})
		it("emulated modifier key via getModifierState does NOT fire shortcuts", () => {
			emulator.fire("KeyA", ["ShiftLeft"])
			expect(executeNoClear.mock.calls.length).to.equal(0)
		})
		it("emulated toggle key via getModifierState does NOT fire shortcuts", () => {
			emulator.fire("", ["ScrollLock"])
			expect(executeNoClear.mock.calls.length).to.equal(0)
		})
		describe("recording", () => {
			it("works reccommended usage", () => {
				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyB ControlLeft-")
				expect(executeOnKeydown.mock.calls.length).to.equal(2)
				safeSetManagerChain(manager, [])
				// using a non clearing shortcut last because it's the worst case scenerio
				// and why the chain should be cleared before changing state
				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyA ControlLeft-")
				expect(executeNoClear.mock.calls.length).to.equal(2)
				expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], []])

				safeSetManagerChain(manager, [])
				setManagerProp(manager, "state.isRecording", true)

				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyA ControlLeft-")
				// should not fire
				expect(executeNoClear.mock.calls.length).to.equal(2)
				expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, a.id]])


				safeSetManagerChain(manager, [])

				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyB ControlLeft-")
				// should not fire
				expect(executeOnKeydown.mock.calls.length).to.equal(2)
				expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, b.id]])

				safeSetManagerChain(manager, [])
				setManagerProp(manager, "state.isRecording", false)

				expect(manager.state.chain).to.deep.equal([])
			})
			it("works as intended when not used correctly - non-clearing", () => {
				// using a non clearing shortcut because it's the worst case scenerio
				// and why the chain should be cleared before changing state
				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyA ControlLeft-")
				expect(executeNoClear.mock.calls.length).to.equal(2)

				safeSetManagerChain(manager, [])
				expect(manager.state.chain).to.deep.equal([])
				setManagerProp(manager, "state.isRecording", true)

				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyA ControlLeft-")
				// should not fire
				expect(executeNoClear.mock.calls.length).to.equal(2)
				expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, a.id]])

				safeSetManagerChain(manager, [])
				setManagerProp(manager, "state.isRecording", false)
				expect(manager.state.chain).to.deep.equal([])
			})
			it("works as intended when not used correctly - self-clearing", () => {
				// using a self clearing shortcut
				// to observe the chain being left untouched
				// after stopping recording incorrectly
				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyB ControlLeft-")
				expect(executeOnKeydown.mock.calls.length).to.equal(2)
				expect(manager.state.chain).to.deep.equal([])

				setManagerProp(manager, "state.isRecording", true)

				emulator.fire("ControlLeft+ KeyD ControlLeft- ControlLeft+ KeyB ControlLeft-")
				expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, b.id]])

				setManagerProp(manager, "state.isRecording", false)
				// the manager is in a bit of a weird state at this point
				// it has a chain that could press a shortcut
				// but recording does not let it look for shortcuts
				// this is correct because we do not want to trigger when we stop recording
				expect(manager.state.chain).to.deep.equal([[ctrl.id, d.id], [ctrl.id, b.id]])
				expect(manager.state.untrigger).to.equal(false)

				// but the user NEEDS to clear the chain to avoid weird behavior
				safeSetManagerChain(manager, [])
				// when they clear, because there was no pending untrigger, it should not trigger anything
				expect(executeOnKeydown.mock.calls.length).to.equal(2)
			})
		})
	})

	it("multiple property \"replacement\" workaround", () => {
		const key1 = createKey("key").unwrap()
		const command1 = createCommand("command")
		const keys = createKeys([key1]).unwrap()
		const commands = createCommands([command1]).unwrap()
		const temp = { options: { ...baseManager.options }, keys, commands }

		const shortcuts = createShortcuts([
			createShortcut({ chain: [[key1]], command: command1.name }, temp).unwrap(),
			
		], temp).unwrap()
		const context = createContext({})
		const manager = createManager(
			{
				...temp,
				context,
				shortcuts,
				commands,
				keys,
				options: {
					...temp.options,
				},
			}
		).unwrap()
					
		const command2 = createCommand("new command")
		const key2 = createKey("new key").unwrap()
		const newCommands = createCommands([command2]).unwrap()
		const newKeys = createKeys([key2]).unwrap()
		const newM = { ...manager, keys: newKeys, commands: newCommands }
		const newShortcuts = createShortcuts([
			createShortcut({ chain: [[key2]], command: command2.name }, newM).unwrap(),
		], newM).unwrap()

		// error individually
		expect(setManagerProp(manager, "commands", newCommands).isError).to.equal(true)
		expect(setManagerProp(manager, "shortcuts", newShortcuts).isError).to.equal(true)
		expect(setManagerProp(manager, "keys", newKeys).isError).to.equal(true)


		// error in incompatible pairs
		expect(isValidManager({ ...manager, shortcuts: newShortcuts, keys: newKeys }).isOk).to.equal(false)
		expect(isValidManager({ ...manager, shortcuts: newShortcuts, commands: newCommands }).isOk).to.equal(false)
		expect(isValidManager({ ...manager, keys: newKeys, commands: newCommands }).isOk).to.equal(false)

		// only full replacement should work
		expect(isValidManager({ ...manager, keys: newKeys, commands: newCommands, shortcuts: newShortcuts }).isOk).to.equal(true)
	})
	describe("real world examples", () => {
		const callback = vi.fn(((manager, error, _e) => {
			setManagerProp(manager, "state.chain", [])
			if (error.code === ERROR.UNKNOWN_KEY_EVENT) throw error
		}) as Manager["options"]["cb"])

		let state = {
			indicator: false,
			multiSelected: false,
			madeBold: false,
			madeItalic: false,
		}
		type MockedCommandFunction = MockedFunction<CommandExecute>

		const selectIndicator: MockedCommandFunction = vi.fn(({ isKeydown }) => {
			state.indicator = isKeydown
		})

		// eslint-disable-next-line no-empty-pattern
		const multiSelect: MockedCommandFunction = vi.fn(({}) => {
			state.multiSelected = true
		})
		const makeBold: MockedCommandFunction = vi.fn(({ isKeydown, manager }) => {
			if (!isKeydown) {
				state.madeBold = !state.madeBold
				safeSetManagerChain(manager!, [])
			}
		})
		const makeBoldForceClearing: MockedCommandFunction = vi.fn(({ isKeydown, manager }) => {
			if (!isKeydown) {
				state.madeBold = !state.madeBold
				safeSetManagerChain(manager!, [], { preserveModifiers: false })
			}
		})
		const makeBoldNonClearing: MockedCommandFunction = vi.fn(({ isKeydown }) => {
			if (!isKeydown) {
				state.madeBold = !state.madeBold
			}
		})
		const makeItalic: MockedCommandFunction = vi.fn(({ isKeydown, manager }) => {
			if (!isKeydown) {
				state.madeItalic = !state.madeItalic
				safeSetManagerChain(manager!, [])
			}
		})
		const makeItalicNonClearing: MockedCommandFunction = vi.fn(({ isKeydown }) => {
			if (!isKeydown) {
				state.madeItalic = !state.madeItalic
			}
		})
		const i = createKey("KeyI").unwrap()
		const rb = createKey("0").unwrap()
		const b = createKey("KeyB").unwrap()
		const x = createKey("KeyX").unwrap()
		const ctrl = createKey("Control", { isModifier: "emulated", variants: ["ControlLeft", "ControlRight"]}).unwrap()
		const commandSelectIndicator = createCommand("selectIndicator", { execute: selectIndicator })
		const commandMultiSelect = createCommand("multiSelect", { execute: multiSelect })
		const commandMakeBold = createCommand("makeBold", { execute: makeBold })
		const commandMakeItalic = createCommand("makeItalic", { execute: makeItalic })
		
		const keys = createKeys([
			rb,
			i,
			b,
			x,
			ctrl,
		]).unwrap()
		const commands = createCommands([
			commandSelectIndicator,
			commandMultiSelect,
			commandMakeBold,
			commandMakeItalic,
		]).unwrap()
		const temp = { ...baseManager, keys, commands }
		const shortcuts = createShortcuts([
			createShortcut({ chain: [[ctrl]], command: commandSelectIndicator }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, rb]], command: commandMultiSelect }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, b]], command: commandMakeBold }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, i]], command: commandMakeItalic }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, x], [ctrl, b]], command: commandMakeBold }, temp).unwrap(),
			createShortcut({ chain: [[ctrl, x], [ctrl, i]], command: commandMakeItalic }, temp).unwrap(),
		], temp, { ignoreModifierConflicts: true }).unwrap()

		const context = createContext({})
		const manager = createManager(
			{
				...temp,
				keys,
				commands,
				shortcuts,
				context,
				options: {
					...temp.options,
					cb: callback,
				},
			}
		).unwrap()
		const emulator = new Emulator(manager.keys)
		const listeners = createManagerEventListeners(manager)
		attach(emulator, listeners)

		beforeEach(() => {
			forceClear(manager)
			callback.mockClear()
			Object.values(manager.commands.entries).forEach((entry: any) => {
				entry.execute.mockClear()
			})
			state = {
				indicator: false,
				multiSelected: false,
				madeBold: false,
				madeItalic: false,
			}
		})

		it("multi select without releasing ctrl", () => {
			emulator.fire("ControlLeft+")
			expect(selectIndicator.mock.calls.length).to.equal(1)
			expect(state.indicator).to.equal(true)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)
			expect(selectIndicator.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft+")
			expect(state.indicator).to.equal(true)
			expect(selectIndicator.mock.calls.length).to.equal(3)
			expect(state.multiSelected).to.equal(false)
			emulator.fire("0+")
			expect(selectIndicator.mock.calls.length).to.equal(4)
			expect(state.indicator).to.equal(false)
			expect(state.multiSelected).to.equal(true)
			expect(multiSelect.mock.calls.length).to.equal(1)
			emulator.fire("0-")
			expect(state.indicator).to.equal(true)
			expect(multiSelect.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft-")
		})
		it("makeBold then makeItalic without releasing ctrl", () => {
			emulator.fire("ControlLeft+", ["ControlLeft"])
			expect(state.indicator).to.equal(true)
			expect(selectIndicator.mock.calls.length).to.equal(1)
			emulator.fire("KeyB+")
			expect(selectIndicator.mock.calls.length).to.equal(2)
			expect(state.indicator).to.equal(false)
			expect(makeBold.mock.calls.length).to.equal(1)
			expect(state.madeBold).to.equal(false)
			emulator.fire("KeyB-")
			expect(state.madeBold).to.equal(true)
			expect(state.indicator).to.equal(true)
			expect(makeBold.mock.calls.length).to.equal(2)
			emulator.fire("KeyI+")
			expect(state.indicator).to.equal(false)
			expect(makeItalic.mock.calls.length).to.equal(1)
			emulator.fire("KeyI-")
			expect(state.indicator).to.equal(true)
			expect(makeItalic.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)
		})
		it("makeBold chain clears", () => {
			emulator.fire("ControlLeft+ KeyX ControlLeft-")
			expect(state.indicator).to.equal(false)
			expect(selectIndicator.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft+ KeyB")
			expect(state.indicator).to.equal(true)
			expect(manager.state.chain).to.deep.equal([[ctrl.id]])
		})
		it("makeBold allows triggering of make italic without lifting modifier", () => {
			emulator.fire("ControlLeft+")
			expect(selectIndicator.mock.calls.length).to.equal(1)
			emulator.fire("KeyB+")
			expect(selectIndicator.mock.calls.length).to.equal(2)
			expect(state.indicator).to.equal(false)
			emulator.fire("KeyB-")
			// +2 from setting the chain, modifiers are kept
			// so safeset triggers then immediatetly untriggers because
			// a shortcut matches
			// + 1 from the release of the b key checking if a shortcut
			// should be triggered
			expect(selectIndicator.mock.calls.length).to.equal(5)
			expect(state.indicator).to.equal(true)
			expect(makeBold.mock.calls.length).to.equal(2)
			expect(makeItalic.mock.calls.length).to.equal(0)
			emulator.fire("KeyI+")
			expect(state.indicator).to.equal(false)
			expect(makeItalic.mock.calls.length).to.equal(1)
			emulator.fire("KeyI-")
			expect(state.indicator).to.equal(true)
			expect(makeItalic.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)
		})
		it("makeBold force clearing, does not allow triggering of make italic or the state indicator", () => {
			setCommandProp(commandMakeBold, "execute", makeBoldForceClearing, manager)

			emulator.fire("ControlLeft+ KeyB")
			expect(state.indicator).to.equal(false)
			expect(manager.state.chain).to.deep.equal([])
			expect(state.indicator).to.equal(false)
			expect(makeBoldForceClearing.mock.calls.length).to.equal(2)
			expect(makeItalic.mock.calls.length).to.equal(0)
			emulator.fire("KeyI+")
			expect(state.indicator).to.equal(false)
			expect(makeItalic.mock.calls.length).to.equal(0)
			emulator.fire("KeyI-")
			expect(state.indicator).to.equal(false)
			expect(makeItalic.mock.calls.length).to.equal(0)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)

			setCommandProp(commandMakeBold, "execute", makeBold, manager)
		})
		it("safeSetManagerChain to [] or [[]]", () => {
			emulator.fire("ControlLeft+")
			safeSetManagerChain(manager, [], { preserveModifiers: false })
			expect(manager.state.chain).to.deep.equal([])
			expect(manager.state.nextIsChord).to.equal(true)
			emulator.fire("ControlLeft+ KeyX ControlLeft-")
			expect(manager.state.chain).to.deep.equal([[ctrl.id, x.id]])
			safeSetManagerChain(manager, [[]], { preserveModifiers: false })
			expect(manager.state.chain).to.deep.equal([[]])
			expect(manager.state.nextIsChord).to.equal(false)
			emulator.fire("ControlLeft+ KeyX ControlLeft-")
			expect(manager.state.chain).to.deep.equal([[ctrl.id, x.id]])
		})
		// probably not a good idea to actually implement this
		it("non clearing makeBold then makeItalic on a chain", () => {
			setCommandProp(commandMakeBold, "execute", makeBoldNonClearing, manager)
			setCommandProp(commandMakeItalic, "execute", makeItalicNonClearing, manager)

			emulator.fire("ControlLeft+ KeyX ControlLeft-")
			expect(state.indicator).to.equal(false)
			expect(selectIndicator.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft+ KeyB+")
			expect(selectIndicator.mock.calls.length).to.equal(2)
			expect(state.indicator).to.equal(false)
			expect(state.madeBold).to.equal(false)
			expect(makeBoldNonClearing.mock.calls.length).to.equal(1)
			emulator.fire("KeyB-")
			expect(state.madeBold).to.equal(true)
			expect(state.indicator).to.equal(false)
			expect(makeBoldNonClearing.mock.calls.length).to.equal(2)
			expect(makeItalicNonClearing.mock.calls.length).to.equal(0)

			emulator.fire("KeyI")
			expect(state.indicator).to.equal(false)
			expect(makeItalicNonClearing.mock.calls.length).to.equal(2)
			expect(makeBoldNonClearing.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)

			setCommandProp(commandMakeBold, "execute", makeBold, manager)
			setCommandProp(commandMakeItalic, "execute", makeItalic, manager)
		})
	})
	describe("hooks", () => {
		it("hooks only fire on initial press and on final release", () => {
			const hook = vi.fn(prop => {
				if (prop === "pressed") { return true }
				return false
			})
			const manager = createManager({
				keys: createKeys([
					createKey("key").unwrap(),
					createKey("mod", { isModifier: "native" }).unwrap(),
				]).unwrap(),
				options: {
					evaluateCondition: () => true,
				},
				hooks: {
					onSetKeyProp: hook
				}
			}).unwrap()
			const emulator = new Emulator(manager.keys)
			const listeners = createManagerEventListeners(manager)
			attach(emulator, listeners)

			emulator.fire("mod+ key+", ["mod"])
			emulator.fire("mod+ key+", ["mod"])
			expect(hook.mock.calls.length).to.equal(2)
			expect(hook.mock.calls.filter((args: any) => args[2] === true).length).to.equal(2)
			emulator.fire("mod- key-")
			expect(hook.mock.calls.length).to.equal(4)
			expect(hook.mock.calls.filter((args: any) => args[2] === false).length).to.equal(2)

			emulator.fire("mod+", ["mod"])
			emulator.fire("mod+", ["mod"])
			expect(hook.mock.calls.length).to.equal(5)
			expect(hook.mock.calls.filter((args: any) => args[2] === true).length).to.equal(3)
			delete (manager as any).hooks
		})

		it("hook types work", () => {
			class CustomError extends Error {
				type = "CustomError"

				constructor(message: string) {
					super(message)
					this.name = "CustomError"
				}
			}
			class CustomError2 extends Error {
				type = "CustomError2"

				constructor(message: string) {
					super(message)
					this.name = "CustomError2"
				}
			}
			
			const manager = createManager({
				keys: [
					{ id: "key" }
				],
				commands: [
					{ name: "test"	}
				],
				shortcuts: [
					{
						chain: [["key"]],
						command: "test"
					}
				],
				options: {
					evaluateCondition: () => true,
				},
				hooks: {
					canSetKeyProp: () => new CustomError("test"),
					canSetShortcutProp: () => new CustomError2("test")
				}
			}).unwrap()

			const res = setKeyProp(manager.keys.entries.key, "pressed", true, manager)
			if (res.isError) {
				expectType<CustomError | KnownError<ERROR.CANNOT_SET_WHILE_DISABLED>, "===", typeof res.error>(true)
			}
			const res2 = setShortcutProp(manager.shortcuts.entries[0], "chain", [], manager)
			if (res2.isError) {
				res2.error
				expectType<CustomError2 | MultipleErrors<
					| ERROR.DUPLICATE_KEY
					| ERROR.DUPLICATE_SHORTCUT
					| ChainErrors
				>, "===", typeof res2.error>(true)
			}
		})
	})
	describe("types work", () => {
		it("raw manager", () => {
			const manager = createManager({
				keys: [
					{ id: "key" }
				],
				commands: [
					{ name: "test"	}
				],
				shortcuts: [
					{
						chain: [["key"]],
						command: "test"
					}
				],
				options: {
					evaluateCondition: () => true,
				},
			}).unwrap()
			expectType<typeof manager.keys.entries.key, "===", Key>(true)
			expectType<typeof manager.commands.entries.test, "===", Command>(true)
			expectType<typeof manager.shortcuts.entries, "===", Shortcut[]>(true)
		})
		it("piece by piece manager", () => {
			const options = createManagerOptions({ evaluateCondition: () => true })
			const commands = createCommands([
				createCommand("test")
			]).unwrap()
			const keys = createKeys([
				createKey("key").unwrap()
			]).unwrap()
			const shortcuts = createShortcuts([
				createShortcut({ chain: [["key"]], command: "test" }, { keys, commands, options }).unwrap()
			], { keys, commands, options }).unwrap()
			const manager = createManager({
				keys,
				commands,
				shortcuts ,
				options,
			}).unwrap()
			expectType<typeof manager.keys.entries.key, "===", Key>(true)
			expectType<typeof manager.commands.entries.test, "===", Command>(true)
			expectType<typeof manager.shortcuts.entries, "===", Shortcut[]>(true)
		})
	})
})
