import { inspectError, testName } from "@alanscodelog/utils"
import { expect } from "chai"

import { Shortcut, Shortcuts } from "@/classes"


describe(testName(), () => {
	describe("base classes", () => {
		it("should correctly add/call/remove listeners", () => {
			const shortcut = new Shortcut([[]])
			const listener: any = jest.fn(() => true)
			shortcut.addHook("allows", listener)
			shortcut.addHook("set", listener)
			expect(shortcut.listeners.allows.length).to.equal(1)
			expect(shortcut.listeners.set.length).to.equal(1)
			shortcut.set("keys", [[]])
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
			shortcut.removeHook("allows", listener)
			shortcut.removeHook("set", listener)
			expect(shortcut.listeners.allows.length).to.equal(0)
			expect(shortcut.listeners.set.length).to.equal(0)
		})
		it("throw if removing invalid listener", () => {
			const shortcuts = new Shortcut([[]])
			const listener: any = () => {}
			shortcuts.addHook("allows", listener)
			shortcuts.addHook("set", listener)
			expect(shortcuts.listeners.allows.length).to.equal(1)
			expect(shortcuts.listeners.set.length).to.equal(1)
			expect(inspectError(() => {
				const listener2: any = () => {}
				shortcuts.removeHook("allows", listener2)
			})).to.throw()
			expect(inspectError(() => {
				const listener3: any = () => {}
				shortcuts.removeHook("set", listener3)
			})).to.throw()
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcut([[]])
			const err = new Error("some error")
			const listener = jest.fn(() => err)
			shortcuts.addHook("allows", listener)
			const allowed = shortcuts.allows("keys", [])
			expect(allowed).to.equal(err)
			expect(inspectError(() => {
				shortcuts.set("keys", [])
			})).to.throw()
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcut([[]])
			const err = new Error("some error")
			const listener = jest.fn(() => err)
			shortcuts.addHook("allows", listener)
			const allowed = shortcuts.allows("keys", [[]])
			expect(allowed).to.equal(err)
			expect(inspectError(() => {
				shortcuts.set("keys", [[]])
			})).to.throw()
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
		})
	})
	describe("collection classes", () => {
		it("should correctly add/call/remove listeners", () => {
			const shortcuts = new Shortcuts([])
			const listener: any = jest.fn(() => true)
			shortcuts.addHook("allows", listener)
			shortcuts.addHook("add", listener)
			expect(shortcuts.listeners.allows.length).to.equal(1)
			expect(shortcuts.listeners.add.length).to.equal(1)
			shortcuts.add({ keys: [[]]})
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
			shortcuts.removeHook("allows", listener)
			shortcuts.removeHook("add", listener)
			expect(shortcuts.listeners.allows.length).to.equal(0)
			expect(shortcuts.listeners.add.length).to.equal(0)
		})
		it("throw if removing invalid listener", () => {
			const shortcuts = new Shortcuts([])
			const listener: any = () => {}
			shortcuts.addHook("allows", listener)
			shortcuts.addHook("add", listener)
			expect(shortcuts.listeners.allows.length).to.equal(1)
			expect(shortcuts.listeners.add.length).to.equal(1)
			expect(inspectError(() => {
				const listener2: any = () => {}
				shortcuts.removeHook("allows", listener2)
			})).to.throw()
			expect(inspectError(() => {
				shortcuts.removeHook("add", () => { })
			})).to.throw()
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcuts([])
			const err = new Error("some error")
			const listener = jest.fn(() => err)
			shortcuts.addHook("allows", listener)
			const allowed = shortcuts.allows({ keys: [[]]})
			expect(allowed).to.equal(err)
			expect(inspectError(() => {
				shortcuts.add({ keys: [[]]})
			})).to.throw()
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
		})
	})
})
