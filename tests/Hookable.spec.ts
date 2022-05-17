import { Shortcut, Shortcuts } from "@/classes"
import { TYPE_ERROR } from "@/types"
import { catchError, Err, Ok, Result, testName } from "@alanscodelog/utils"
import { expect } from "./chai"
import { k } from "./helpers.keys"




describe(testName(), () => {
	describe("base classes", () => {
		it("should correctly add/call/remove listeners", () => {
			const shortcut = new Shortcut([[]])
			const listener: any = jest.fn(() => true)
			shortcut.addHook("allows", listener)
			shortcut.addHook("set", listener)
			expect(shortcut.hooks.allows.length).to.equal(1)
			expect(shortcut.hooks.set.length).to.equal(1)
			shortcut.allows("chain", [[]])
			shortcut.set("chain", [[]])
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
			shortcut.removeHook("allows", listener)
			shortcut.removeHook("set", listener)
			expect(shortcut.hooks.allows.length).to.equal(0)
			expect(shortcut.hooks.set.length).to.equal(0)
		})
		it("throw if removing invalid listener", () => {
			const shortcut = new Shortcut([[k.a]])
			const listener: any = () => {}
			shortcut.addHook("allows", listener)
			shortcut.addHook("set", listener)
			expect(shortcut.hooks.allows.length).to.equal(1)
			expect(shortcut.hooks.set.length).to.equal(1)
			expect(catchError(() => {
				const listener2: any = () => {}
				shortcut.removeHook("allows", listener2)
			}).code).to.equal(TYPE_ERROR.HOOK_DOES_NOT_EXIST)
			expect(catchError(() => {
				const listener3: any = () => {}
				shortcut.removeHook("set", listener3)
			}).code).to.equal(TYPE_ERROR.HOOK_DOES_NOT_EXIST)
		})
		it("throw if allow listener returns error", () => {
			const shortcut = new Shortcut([[k.a]])
			const err = new Error("some error")
			const listener = jest.fn(() => Err(err))
			shortcut.addHook("allows", listener)
			const res = shortcut.allows("chain", [])
			expect(res.isError).to.equal(true)
			if (res.isError) expect(res.error).to.equal(err)
			expect(catchError(() => {
				shortcut.allows("chain", []).unwrap()
			}).message).to.equal(err.message)
		})
		it("throw if allow listener returns error", () => {
			const shortcut = new Shortcut([[k.a]])
			const err = new Error("some error")
			const listener = jest.fn(() => Err(err))
			shortcut.addHook("allows", listener)
			const res = shortcut.allows("chain", [[]])
			expect(res.isError).to.equal(true)
			if (res.isError) expect(res.error).to.equal(err)
			expect(catchError(() => {
				shortcut.allows("chain", [[]]).unwrap()
			}).message).to.equal(err.message)
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
		})
	})
	describe("collection classes", () => {
		it("should correctly add/call/remove listeners", () => {
			const shortcuts = new Shortcuts([])
			const listener: any = jest.fn(() => Ok(true))
			shortcuts.addHook("allowsAdd", listener)
			shortcuts.addHook("add", listener)
			shortcuts.addHook("allowsRemove", listener)
			shortcuts.addHook("remove", listener)
			expect(shortcuts.hooks.allowsAdd.length).to.equal(1)
			expect(shortcuts.hooks.add.length).to.equal(1)
			expect(shortcuts.hooks.allowsRemove.length).to.equal(1)
			expect(shortcuts.hooks.remove.length).to.equal(1)
			shortcuts.allows("add", { chain: [[]]})
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(1)
			shortcuts.add(new Shortcut([[]]))
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
			shortcuts.allows("remove", shortcuts.entries[0])
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(3)
			shortcuts.remove(shortcuts.entries[0])
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(4)
			shortcuts.removeHook("allowsAdd", listener)
			shortcuts.removeHook("add", listener)
			shortcuts.removeHook("allowsRemove", listener)
			shortcuts.removeHook("remove", listener)
			expect(shortcuts.hooks.allowsAdd.length).to.equal(0)
			expect(shortcuts.hooks.add.length).to.equal(0)
			expect(shortcuts.hooks.allowsRemove.length).to.equal(0)
			expect(shortcuts.hooks.remove.length).to.equal(0)
		})
		it("throw if removing invalid listener", () => {
			const shortcuts = new Shortcuts([])
			const listener: any = () => Ok(true)
			shortcuts.addHook("allowsAdd", listener)
			shortcuts.addHook("add", listener)
			shortcuts.addHook("allowsRemove", listener)
			shortcuts.addHook("remove", listener)
			expect(shortcuts.hooks.allowsAdd.length).to.equal(1)
			expect(shortcuts.hooks.add.length).to.equal(1)
			expect(shortcuts.hooks.allowsRemove.length).to.equal(1)
			expect(shortcuts.hooks.remove.length).to.equal(1)
			expect(catchError(() => {
				const listener2: any = () => {}
				shortcuts.removeHook("allowsAdd", listener2)
			}).code).to.equal(TYPE_ERROR.HOOK_DOES_NOT_EXIST)
			expect(catchError(() => {
				shortcuts.removeHook("add", () => { })
			}).code).to.equal(TYPE_ERROR.HOOK_DOES_NOT_EXIST)
			expect(catchError(() => {
				const listener2: any = () => {}
				shortcuts.removeHook("allowsRemove", listener2)
			}).code).to.equal(TYPE_ERROR.HOOK_DOES_NOT_EXIST)
			expect(catchError(() => {
				shortcuts.removeHook("remove", () => { })
			}).code).to.equal(TYPE_ERROR.HOOK_DOES_NOT_EXIST)
		})
		it("throw if allow listener returns error", () => {
			const shortcuts = new Shortcuts([])
			const err = new Error("some error")
			const listener = jest.fn(() => Err(err))
			shortcuts.addHook("allowsAdd", listener as any as (...args: any[]) => Result<true, any>)
			const allowed = shortcuts.allows("add", { chain: [[]]})
			expect(allowed.isError).to.equal(true)
			if (allowed.isError) expect(allowed.error).to.equal(err)
			expect(catchError(() => {
				shortcuts.allows("add", { chain: [[]]}).unwrap()
			}).message).to.equal(err.message)
			expect((listener as jest.Mock<any, any>).mock.calls.length).to.equal(2)
		})
	})
})
