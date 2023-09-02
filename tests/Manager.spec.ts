/* eslint-disable @typescript-eslint/no-shadow */
import { testName } from "@alanscodelog/utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Command, Commands, Context, Emulator, Key, Keys, Manager, Shortcut, Shortcuts, Stringifier } from "shortcuts-manager/classes/index.js"
import { KeysSorter } from "shortcuts-manager/classes/KeysSorter.js"
import { ERROR } from "shortcuts-manager/types/enums.js"


vi.useFakeTimers()

describe(testName(), () => {
	afterEach(() => {
		vi.useFakeTimers()
	})
	it("should override options of keys/commands/shortcuts", () => {
		const sorter = new KeysSorter()
		const stringifier = new Stringifier()
		const manager = new Manager(
			new Keys([], {
				stringifier: new Stringifier(/* ignored */),
			}),
			new Commands([]),
			new Shortcuts([], {
				stringifier: new Stringifier(/* ignored */),
				sorter: new KeysSorter(/* ignored */),
			}),
			new Context({}),
			() => true,
			{ sorter, stringifier }
		)
		expect(manager.keys.stringifier).to.equal(stringifier)
		expect(manager.shortcuts.stringifier).to.equal(stringifier)
		expect(manager.shortcuts.sorter).to.equal(sorter)
	})

	describe("checks", () => {
		const key = new Key("known")
		const command = new Command("known")
		it("should throw when shortcuts use unknown keys", () => {
			expect(() => {
				const manager = new Manager(
					new Keys([]),
					new Commands([]),
					new Shortcuts([
						new Shortcut([[new Key("unknown")]]),
					]),
					new Context({}),
				)
			}).to.throw()
		})
		it("should throw when shortcuts use unknown commands", () => {
			expect(() => {
				const manager = new Manager(
					new Keys([]),
					new Commands([]),
					new Shortcuts([
						new Shortcut([[key]], { command: new Command("unknown") }),
					]),
					new Context({}),
				)
			}).to.throw()
		})
		it("should not throw when shortcuts don't use commands", () => {
			expect(() => {
				const manager = new Manager(
					new Keys([key]),
					new Commands([]),
					new Shortcuts([
						new Shortcut([[key]]),
					]),
					new Context({}),
				)
			}).to.not.throw()
		})
		it("doesn't allow removal of in use keys", () => {
			const key = new Key("key")
			const manager = new Manager(
				new Keys([key]),
				new Commands([]),
				new Shortcuts([
					new Shortcut([[key]]),
				]),
				new Context({}),
			)
			expect(manager.keys.allows("remove", key).isError).to.equal(true)
		})
		it("doesn't allow removal of in use commands", () => {
			const key = new Key("key")

			const command = new Command("command")
			const manager = new Manager(
				new Keys([key]),
				new Commands([command]),
				new Shortcuts([
					new Shortcut([[key]], { command }),
				]),
				new Context({}),
			)
			expect(manager.commands.allows("remove", command).isError).to.equal(true)
		})
		it("should not throw when shortcuts use known commands", () => {
			expect(() => {
				const manager = new Manager(
					new Keys([key]),
					new Commands([command]),
					new Shortcuts([
						new Shortcut([[key]], { command }),
					]),
					new Context({}),
				)
			}).to.not.throw()
		})
	})
	describe("basic functions", () => {
		describe("should correctly add/remove from chain state", () => {
			const callback = vi.fn(((e, manager) => {
				console.log(e)
				manager.clearChain()

				if (e.code === ERROR.UNKNOWN_KEY_EVENT) throw e
			}) as Manager["cb"])
			const execute1 = vi.fn((() => {}))
			const execute2 = vi.fn((({ isKeydown, manager }) => {
				if (isKeydown) {
					manager?.clearChain()
				}
			}))
			const a = new Key("KeyA",)
			const b = new Key("KeyB",)
			const c = new Key("KeyC",)
			const d = new Key("KeyD",)
			const cl = new Key("CapsLock", { is: { toggle: true } })
			const ctrl = new Key("Control", { is: { modifier: true }, variants: ["ControlLeft", "ControlRight"]})
			const sl = new Key("ScrollLock", { is: { toggle: "emulated" } })
			const shift = new Key("shift", { is: { modifier: "emulated" }, variants: ["ShiftLeft", "ShiftRight"]})
			const shiftAlt = new Key("shiftAlt", { is: { modifier: "emulated" }, variants: ["ShiftLeft", "ShiftRight"]})
			const command1 = new Command("test1", { execute: execute1 })
			const command2 = new Command("test2", { execute: execute2 })
			const manager = new Manager(
				new Keys([
					a,
					b,
					c,
					d,
					cl,
					ctrl,
					sl,
					shift,
					// this checks that even though this is the same as shift, shortcuts with only shift or both shift and alt trigger
					shiftAlt,
				]),
				new Commands([command1, command2]),
				new Shortcuts([
					new Shortcut([[ctrl, a]], { command: command1 }),
					new Shortcut([[ctrl, b]], { command: command2 }),
					new Shortcut([[ctrl, c], [ctrl, a]], { command: command1 }),
					new Shortcut([[ctrl, c], [ctrl, b]], { command: command2 }),
					new Shortcut([[sl]], { command: command1 }),
					new Shortcut([[cl]], { command: command1 }),
					new Shortcut([[shift, a]], { command: command1 }),
					new Shortcut([[shift, shiftAlt, d]], { command: command1 }),
				]),
				new Context({}),
				callback,
			)
			const emulator = new Emulator(manager.keys)
			// the emulator can't handler mouseenter events yet
			manager.attach(emulator)
			emulator.mouseenter()

			beforeEach(() => {
				manager.forceClear()
				callback.mockClear()
				execute1.mockClear()
				execute2.mockClear()
			})

			it("should call callback with unknown keys", () => {
				const emulator = new Emulator()
				manager.attach(emulator)
				emulator.mouseenter()
				expect(() => {
					emulator.fire("Unknown")
				}).to.throw() // only because callback throws
				manager.detach(emulator)
				expect(callback.mock.calls.length).to.equal(1)
			})
			it("shortcut with multiple keys that contain same variants fire", () => {
				emulator.fire("ShiftLeft+ KeyD+")
				expect(execute1.mock.calls.length).to.equal(1)
				expect(shift.pressed).to.equal(true)
				expect(shiftAlt.pressed).to.equal(true)
				emulator.fire("ShiftLeft- KeyD-")
			})

			it("should not error or add chain when start chord is not chain", () => {
				emulator.fire("KeyA+")

				expect(manager.chain).to.deep.equal([[a]])
				expect(callback.mock.calls.length).to.equal(0)

				emulator.fire("KeyA-")
				expect(manager.chain).to.deep.equal([])
			})
			it("chain - multiple chord without command and release before trigger", () => {
				console.log(manager.toString())
				emulator.fire("ControlLeft+ KeyC", ["ControlLeft"])
				emulator.fire("ControlLeft-", [])
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft+", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl, c], [ctrl]])
				emulator.fire("ControlLeft-", [])
				expect(manager.chain).to.deep.equal([[ctrl, c], []])
				// checking twice because there was a bug
				emulator.fire("ControlLeft+", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl, c], [ctrl]])
				emulator.fire("ControlLeft-", [])
				expect(manager.chain).to.deep.equal([[ctrl, c], []])
			})


			it("chain - multiple chord with command with self clear", () => {
				emulator.fire("ControlLeft+ KeyC", ["ControlLeft"])

				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft-")
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
				expect(execute2.mock.calls.length).to.equal(2)
				expect(manager.chain).to.deep.equal([])
				emulator.fire("KeyB- ControlLeft-")
				expect(execute2.mock.calls.length).to.equal(2)
			})
			it("chain - multiple chord with command without self clear", () => {
				emulator.fire("ControlLeft+ KeyC", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft-")
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				expect(execute1.mock.calls.length).to.equal(1)
				expect(manager.chain).to.deep.equal([[ctrl, c], [ctrl, a]])
				emulator.fire("KeyA- ControlLeft-")
				expect(execute1.mock.calls.length).to.equal(2)
			})
			it("chain - single chord with command without self clear", () => {
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				expect(execute1.mock.calls.length).to.equal(1)
				expect(manager.chain).to.deep.equal([[ctrl, a]])
				// note this is like also releasing the modifier
				emulator.fire("KeyA-")
				expect(execute1.mock.calls.length).to.equal(2)
				expect(manager.chain).to.deep.equal([])
			})
			it("chain - single chord with command with self clear", () => {
				emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
				expect(execute2.mock.calls.length).to.equal(2)
				expect(manager.chain).to.deep.equal([])
				emulator.fire("KeyB-")
			})

			it("chain - single chord without self clear - modifiers held", () => {
				emulator.fire("ControlLeft+ KeyA", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl]])
				expect(execute1.mock.calls.length).to.equal(2)
				emulator.fire("KeyB", ["ControlLeft"])
				expect(execute2.mock.calls.length).to.equal(2)
			})
			it("setChain will untrigger => trigger => untrigger on set on non self clearing command", () => {
				emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
				// just the opposite execute to differentiate between them
				expect(execute2.mock.calls.length).to.equal(2)
				manager.set("chain", [[ctrl, c], [ctrl, a]])
				expect(execute1.mock.calls.length).to.equal(2) // triggered => untriggered
				expect(manager.chain).to.deep.equal([[ctrl, c], [ctrl, a]])
			})
			it("setChain will untrigger => trigger => untrigger on set on self clearing command", () => {
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				// just the opposite execute to differentiate between them
				expect(execute1.mock.calls.length).to.equal(1)
				manager.set("chain", [[ctrl, c], [ctrl, b]])
				expect(execute2.mock.calls.length).to.equal(2) // triggered => untriggered
				expect(manager.chain).to.deep.equal([]) // self clears
			})
			it("invalid chain", () => {
				expect(execute2.mock.calls.length).to.equal(0)
				emulator.fire("ControlLeft+ KeyC", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft-")
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft+ KeyD+", ["ControlLeft"])
				expect(callback.mock.calls.length).to.equal(1)
				expect(callback.mock.calls[0][0].code).to.equal(ERROR.NO_MATCHING_SHORTCUT)
				expect(manager.chain).to.deep.equal([])

				expect(execute1.mock.calls.length).to.equal(0)
				expect(execute2.mock.calls.length).to.equal(0)
			})
			
			it("hooks only fire on initial press and on final release", () => {
				const hook = vi.fn(prop => {
					if (prop === "pressed") { return true }
					return false
				})
				ctrl.addHook("set", hook)
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				expect(hook.mock.results.filter(res => res.value === true).length).to.equal(1)
				emulator.fire("ControlLeft- KeyA-")
				expect(hook.mock.results.filter(res => res.value === true).length).to.equal(2)

				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				expect(hook.mock.results.filter(res => res.value === true).length).to.equal(3)
				// todo
				// vi.advanceTimersByTime(500)
				// expect(hook.mock.results.filter(res => res.value === true).length).to.equal(4)
			})
			it("ignores keypresses right after triggering for chords", () => {
				emulator.fire("ControlLeft+ KeyC+", ["ControlLeft"])
				emulator.fire("KeyD+")
				expect(c.pressed).to.equal(true)
				expect(manager.chain).to.deep.equal([[ctrl, c]])
				emulator.fire("ControlLeft- KeyC- KeyD-")
				// stops ignoring
				emulator.fire("ControlLeft+ KeyB+", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([])
			})
			it("native modifier key via getModifierState fire shortcuts", () => {
				emulator.fire("KeyA", ["ControlLeft"])
				expect(execute1.mock.calls.length).to.equal(2)
			})
			// it makes no sense to do so since the state change might have happened out of focus a long time ago
			it("native toggle key via getModifierState does NOT fire shortcuts", () => {
				emulator.fire("", ["CapsLock"])
				expect(execute1.mock.calls.length).to.equal(0)
			})
			it("emulated modifier key via getModifierState does NOT fire shortcuts", () => {
				emulator.fire("KeyA", ["ShiftLeft"])
				expect(execute1.mock.calls.length).to.equal(0)
			})
			it("emulated toggle key via getModifierState does NOT fire shortcuts", () => {
				emulator.fire("", ["ScrollLock"])
				expect(execute1.mock.calls.length).to.equal(0)
			})
			describe("hooks", () => {
				it("correctly allows replacement", () => {
					const key1 = new Key("key")
					const command1 = new Command("command")
					const manager = new Manager(
						new Keys([key1]),
						new Commands([command1]),
						new Shortcuts([
							new Shortcut([[key1]], { command: command1 }),
						]),
						new Context({}),
					)
					const command2 = new Command("new command")
					const key2 = new Key("new key")
					const newShortcuts = new Shortcuts([new Shortcut([[key2]], { command: command2 })])
					const newCommands = new Commands([command2])
					const newKeys = new Keys([key2])
					// error individually
					expect(manager.allows("commands", newCommands).isError).to.equal(true)
					expect(manager.allows("shortcuts", newShortcuts).isError).to.equal(true)
					expect(manager.allows("keys", newKeys).isError).to.equal(true)
					expect(manager.allows("replace", {
						shortcuts: newShortcuts,
						commands: newCommands,
					}).isError).to.equal(true)
					expect(manager.allows("replace", {
						shortcuts: newShortcuts,
						keys: newKeys,
					}).isError).to.equal(true)
					expect(manager.allows("replace", {
						commands: newCommands,
						keys: newKeys,
					}).isError).to.equal(true)

					expect(manager.allows("replace", {
						shortcuts: newShortcuts,
						commands: newCommands,
						keys: newKeys,
					}).isOk).to.equal(true)
					manager.set("replace", {
						shortcuts: newShortcuts,
						commands: newCommands,
						keys: newKeys,
					})
					expect(manager.shortcuts).to.equal(newShortcuts)
					expect(manager.commands).to.equal(newCommands)
					expect(manager.keys).to.equal(newKeys)
				})
				it("does not allow setting chain but allows hooks", () => {
					const hook = vi.fn((_prop, _val) => { })
					manager.addHook("set", hook)
					manager.clearChain()
					expect(hook.mock.calls.length).to.equal(1)
					expect(hook.mock.calls[0][0]).to.equal("chain")
					expect(hook.mock.calls[0][1]).to.deep.equal([])
				})
				describe.todo("recording", () => {
					it("works", () => {
						emulator.fire("ControlLeft+ KeyC ControlLeft- ControlLeft+ KeyA ControlLeft-")
						expect(execute1.mock.calls.length).to.equal(2)
						manager.startRecording()
						emulator.fire("ControlLeft+ KeyC ControlLeft- ControlLeft+ KeyA ControlLeft-")
						expect(execute1.mock.calls.length).to.equal(2) // still 2
						expect(manager.chain).to.deep.equal([[ctrl, c], [ctrl, a]])
						manager.stopRecording()
						expect(manager.chain).to.deep.equal([])
					})
				})
			})
		})
	})
	describe("real world examples", () => {
		const callback = vi.fn(((e, manager) => {
			manager.clearChain()
			if (e.code === ERROR.UNKNOWN_KEY_EVENT) throw e
		}) as Manager["cb"])
		let state = {
			indicator: false,
			multiSelected: false,
			madeBold: false,
			madeItalic: false,
		}
		const selectIndicator = vi.fn(({ isKeydown }) => {
			state.indicator = isKeydown
		})
		const multiSelect = vi.fn(() => {
			state.multiSelected = true
		})
		const makeBold = vi.fn(({ isKeydown, manager }) => {
			if (isKeydown) {
				state.madeBold = true
			} else {
				manager.smartClearChain()
			}
		})
		const makeBoldSemiClearing = vi.fn(({ isKeydown, manager }) => {
			if (isKeydown) {
				state.madeBold = true
			} else {
				if (manager.chain.length > 0) {
					manager.set("chain", [manager.lastChord()!])
				}
			}
		})
		const makeBoldNonClearing = vi.fn(({ isKeydown }) => {
			if (isKeydown) {
				state.madeBold = true
			}
		})
		const makeItalic = vi.fn(({ isKeydown, manager }) => {
			if (isKeydown) {
				state.madeItalic = true
			} else {
				manager.smartClearChain()
			}
		})
		const makeItalicNonClearing = vi.fn(({ isKeydown }) => {
			if (isKeydown) {
				state.madeItalic = true
			}
		})
		const i = new Key("KeyI")
		const rb = new Key("0")
		const b = new Key("KeyB")
		const x = new Key("KeyX")
		const ctrl = new Key("Control", { is: { modifier: "emulated" }, variants: ["ControlLeft", "ControlRight"]})
		const commandSelectIndicator = new Command("selectIndicator", { execute: selectIndicator })
		const commandMultiSelect = new Command("multiSelect", { execute: multiSelect })
		const commandMakeBold = new Command("makeBold", { execute: makeBold })
		const commandMakeItalic = new Command("makeItalic", { execute: makeItalic })
		const manager = new Manager(
			new Keys([
				rb,
				i,
				b,
				x,
				ctrl,
			]),
			new Commands([
				commandSelectIndicator,
				commandMultiSelect,
				commandMakeBold,
				commandMakeItalic,
			]),
			new Shortcuts([
				new Shortcut([[ctrl]], { command: commandSelectIndicator }),
				new Shortcut([[ctrl, rb]], { command: commandMultiSelect }),
				new Shortcut([[ctrl, b]], { command: commandMakeBold }),
				new Shortcut([[ctrl, i]], { command: commandMakeItalic }),
				new Shortcut([[ctrl, x], [ctrl, b]], { command: commandMakeBold }),
				new Shortcut([[ctrl, x], [ctrl, i]], { command: commandMakeItalic }),
			], { ignoreModifierConflicts: true }),
			new Context({}),
			callback
		)
		const emulator = new Emulator(manager.keys)

		manager.attach(emulator)

		beforeEach(() => {
			manager.forceClear()
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
			expect(state.madeBold).to.equal(true)
			expect(makeBold.mock.calls.length).to.equal(1)
			emulator.fire("KeyB-")
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
			expect(state.indicator).to.equal(false)
			expect(manager.chain).to.deep.equal([])
		})
		it("makeBold semi clearing allows triggering of make italic", () => {
			commandMakeBold.execute = makeBoldSemiClearing
			emulator.fire("ControlLeft+ KeyX ControlLeft-")
			expect(state.indicator).to.equal(false)
			expect(selectIndicator.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft+ KeyB")
			expect(state.indicator).to.equal(true)
			expect(makeBoldSemiClearing.mock.calls.length).to.equal(2)
			expect(makeItalic.mock.calls.length).to.equal(0)
			emulator.fire("KeyI+")
			expect(state.indicator).to.equal(false)
			expect(makeItalic.mock.calls.length).to.equal(1)
			emulator.fire("KeyI-")
			expect(makeItalic.mock.calls.length).to.equal(2)
			expect(state.indicator).to.equal(true)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)
			commandMakeBold.execute = makeBold
		})
		// probably not a good idea to actually implement this
		it("non clearing makeBold then makeItalic on a chain", () => {
			commandMakeBold.execute = makeBoldNonClearing
			commandMakeItalic.execute = makeItalicNonClearing
			emulator.fire("ControlLeft+ KeyX ControlLeft-")
			expect(state.indicator).to.equal(false)
			expect(selectIndicator.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft+ KeyB+")
			expect(selectIndicator.mock.calls.length).to.equal(2)
			expect(state.indicator).to.equal(false)
			expect(state.madeBold).to.equal(true)
			expect(makeBoldNonClearing.mock.calls.length).to.equal(1)
			emulator.fire("KeyB-")
			expect(state.indicator).to.equal(false)
			expect(makeBoldNonClearing.mock.calls.length).to.equal(2)
			expect(makeItalicNonClearing.mock.calls.length).to.equal(0)

			emulator.fire("KeyI")
			expect(state.indicator).to.equal(false)
			expect(makeItalicNonClearing.mock.calls.length).to.equal(2)
			expect(makeBoldNonClearing.mock.calls.length).to.equal(2)
			emulator.fire("ControlLeft-")
			expect(state.indicator).to.equal(false)
			commandMakeBold.execute = makeBold
			commandMakeItalic.execute = makeItalic
		})
	})
})
