import { delay, testName } from "@alanscodelog/utils"

import { expect } from "./chai"

import { Command, Commands, Context, Key, Keys, KeysSorter, KeysStringifier, Shortcut, Shortcuts } from "@/classes"
import { Emulator } from "@/classes/Emulator"
import { Manager } from "@/classes/Manager"
import { ERROR } from "@/types"


describe(testName(), () => {
	it("should override options of keys/commands/shortcuts", () => {
		const sorter = new KeysSorter()
		const stringifier = new KeysStringifier()
		const manager = new Manager(
			new Keys([], {
				stringifier: new KeysStringifier(/* ignored */),
			}),
			new Commands([]),
			new Shortcuts([], {
				stringifier: new KeysStringifier(/* ignored */),
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
			const callback = jest.fn(((_e, manager) => manager.clearChain()) as Manager["cb"])
			const execute1 = jest.fn(((isKeydown, _command, _shortcut, manager) => {
				if (isKeydown) {
					manager?.clearChain()
				}
			}) as Command["execute"])
			const execute2 = jest.fn(((isKeydown, _command, _shortcut, manager) => {
				if (isKeydown) {
					manager?.clearChain()
				}
			}) as Command["execute"])
			const a = new Key("KeyA")
			const b = new Key("KeyB")
			const c = new Key("KeyC")
			const d = new Key("KeyD")
			const cl = new Key("Capslock", { is: { toggle: true } })
			const ctrl = new Key("Control", { is: { modifier: true }, variants: ["ControlLeft", "ControlRight"]})
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
				]),
				new Commands([command1, command2]),
				new Shortcuts([
					new Shortcut([[ctrl, a]], { command: command1 }),
					new Shortcut([[ctrl, b], [ctrl, a]], { command: command2 }),
				]),
				new Context({}),
				callback,
			)
			const emulator = new Emulator()

			manager.attach(emulator)

			beforeEach(() => {
				manager.forceClear()
				callback.mockClear()
				execute1.mockClear()
				execute2.mockClear()
			})

			it("should not error or add chain when start chord is not chain", () => {
				emulator.fire("KeyA+")
				expect(manager.chain).to.deep.equal([[a]])
				expect(callback.mock.calls.length).to.equal(0)

				emulator.fire("KeyA-")
				expect(manager.chain).to.deep.equal([[]])
			})

			it("chain", () => {
				emulator.fire("ControlLeft+ KeyB", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl, b], []])
				emulator.fire("ControlLeft-")
				expect(manager.chain).to.deep.equal([[ctrl, b], []])
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				expect(execute2.mock.calls.length).to.equal(1)
				expect(manager.chain).to.deep.equal([[]])
				emulator.fire("KeyA- ControlLeft-")
				expect(execute2.mock.calls.length).to.equal(2)

				expect(execute1.mock.calls.length).to.equal(0)
			})
			it("invalid chain", () => {
				expect(execute2.mock.calls.length).to.equal(0)
				emulator.fire("ControlLeft+ KeyB", ["ControlLeft"])
				expect(manager.chain).to.deep.equal([[ctrl, b], []])
				emulator.fire("ControlLeft-")
				expect(manager.chain).to.deep.equal([[ctrl, b], []])
				emulator.fire("ControlLeft+ KeyD+", ["ControlLeft"])
				expect(callback.mock.calls.length).to.equal(1)
				expect(callback.mock.calls[0][0].code).to.equal(ERROR.NO_MATCHING_SHORTCUT)
				expect(manager.chain).to.deep.equal([[]])

				expect(execute1.mock.calls.length).to.equal(0)
				expect(execute2.mock.calls.length).to.equal(0)
			})
			it("out of focus simulated keyup", async () => {
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				await delay(250)
				expect(ctrl.pressed).to.equal(true)
				expect(a.pressed).to.equal(true)
				emulator.fire("ControlLeft+ KeyA+", ["ControlLeft"])
				await delay(500)
				expect(ctrl.pressed).to.equal(false)
				expect(a.pressed).to.equal(false)
				expect(manager.chain).to.deep.equal([[]])
				expect(execute1.mock.calls.length).to.equal(2)
			})
			it("hooks only fire on initial press", async () => {
				const hook = jest.fn(prop => {
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
				await delay(500)
				expect(hook.mock.results.filter(res => res.value === true).length).to.equal(4)
			})
		})
	})
})
