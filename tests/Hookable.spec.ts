import { Shortcut, Shortcuts } from "@/classes"
import { TYPE_ERROR } from "@/types"
import { catchError, testName } from "@alanscodelog/utils"
import { expect } from "./chai"



describe(testName(), () => {
	describe("base classes", () => {
		it("should correctly add/call/remove listeners", () => {
			const shortcut = new Shortcut([[]])
			const listener: any = jest.fn(() => true)
			shortcut.addHook("allows", listener)
			shortcut.addHook("set", listener)
			expect(shortcut.listeners.allows.length).to.equal(2)
			expect(shortcut.listeners.set.length).to.equal(1)
			shortcut.set("keys", [[]])
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
			shortcut.removeHook("allows", listener)
			shortcut.removeHook("set", listener)
			expect(shortcut.listeners.allows.length).to.equal(1)
			expect(shortcut.listeners.set.length).to.equal(0)
		})
		it("throw if removing invalid listener", () => {
			const shortcuts = new Shortcut([[]])
			const listener: any = () => {}
			shortcuts.addHook("allows", listener)
			shortcuts.addHook("set", listener)
			expect(shortcuts.listeners.allows.length).to.equal(2)
			expect(shortcuts.listeners.set.length).to.equal(1)
			expect(catchError(() => {
				const listener2: any = () => {}
				shortcuts.removeHook("allows", listener2)
			}).code).to.equal(TYPE_ERROR.LISTENER_DOES_NOT_EXIST)
			expect(catchError(() => {
				const listener3: any = () => {}
				shortcuts.removeHook("set", listener3)
			}).code).to.equal(TYPE_ERROR.LISTENER_DOES_NOT_EXIST)
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcut([[]])
			const err = new Error("some error")
			const listener = jest.fn(() => err)
			shortcuts.addHook("allows", listener)
			const allowed = shortcuts.allows("keys", [])
			expect(allowed).to.equal(err)
			expect(catchError(() => {
				shortcuts.set("keys", [])
			}).message).to.equal(err.message)
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcut([[]])
			const err = new Error("some error")
			const listener = jest.fn(() => err)
			shortcuts.addHook("allows", listener)
			const allowed = shortcuts.allows("keys", [[]])
			expect(allowed).to.equal(err)
			expect(catchError(() => {
				shortcuts.set("keys", [[]])
			}).message).to.equal(err.message)
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
			expect(catchError(() => {
				const listener2: any = () => {}
				shortcuts.removeHook("allows", listener2)
			}).code).to.equal(TYPE_ERROR.LISTENER_DOES_NOT_EXIST)
			expect(catchError(() => {
				shortcuts.removeHook("add", () => { })
			}).code).to.equal(TYPE_ERROR.LISTENER_DOES_NOT_EXIST)
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcuts([])
			const err = new Error("some error")
			const listener = jest.fn(() => err)
			shortcuts.addHook("allows", listener)
			const allowed = shortcuts.allows({ keys: [[]]})
			expect(allowed).to.equal(err)
			expect(catchError(() => {
				shortcuts.add({ keys: [[]]})
			}).message).to.equal(err.message)
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
		})
	})
})
