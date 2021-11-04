/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Command, Commands, Condition, Key, Keys, Plugin, Shortcut, Shortcuts } from "@/classes"
import { TYPE_ERROR } from "@/types"
import { catchError, testName } from "@alanscodelog/utils"
import { expect } from "./chai"
import { k } from "./helpers.keys"



const pluginInfoDict = {
	a: { test: "TestA" },
	b: { test: "TestB" },
}


const plugin = new Plugin(
	"name",
	{ test: "default" },
	pluginInfoDict,
)
const pluginNoOverrides = new Plugin(
	"name",
	{ test: "default" },
)

const conflictingPlugin = new Plugin(
	"name",
	{ test: "default" },
)



// this is a single key find for testing only
const shortcutFilter = (id: string) => (entry: Shortcut) => entry.keys.find(chord => chord.find(key => key.id === id) !== undefined) !== undefined

/** Note there should also be no intellisense "errors" here when accessing properties. */

describe(testName(), () => {
	it("has no opts", () => {
		// @ts-expect-error opts should be undefined
		expect(plugin.opts).to.equal(undefined)
	})
	describe("inits incompatible instances", () => {
		it("for keys", () => {
			const keys = new Keys([
				{ id: "a" },
			], {}, [plugin])

			keys.add({ id: "b" })

			expect(keys.get("b").plugins).to.deep.equal([plugin])
			expect(keys.get("b").info.name.test).to.equal("TestB")
		})
		it("for commands", () => {
			const commands = new Commands([
				{ name: "a" },
			], [plugin])

			commands.add({ name: "b" })

			expect(commands.get("b").plugins).to.deep.equal([plugin])
			expect(commands.get("b").info.name.test).to.equal("TestB")
		})
		it("for shortcuts", () => {
			const warn = console.warn
			console.warn = jest.fn()
			const shortcuts = new Shortcuts([
				{ keys: [[k.a]] },
				//@ts-expect-error typescript already warns you cant
			], [plugin])

			shortcuts.add({ keys: [[k.b]]})
			// shortcuts can't use the overrides
			expect((console.warn as jest.Mock<any, any>).mock.calls.length).to.equal(2)
			expect(shortcuts.query(shortcutFilter("b"), false)!.plugins).to.deep.equal([plugin])
			expect(shortcuts.query(shortcutFilter("b"), false)!.info!.name.test).to.equal("default")
			console.warn = warn
		})
	})
	describe("use plugin's equals function", () => {
		// eslint-disable-next-line no-shadow
		const equals = jest.fn(() => () => true)
		const plugin = new Plugin(false, {}, undefined, {equals: equals as any})
		beforeEach(() => {
			equals.mockClear()
		})
		it("for keys", () => {
			const a1 = new Key("a", {}, {}, [plugin])
			const a2 = new Key("a", {}, {}, [plugin])
			expect(a1.equals(a2)).to.equal(true)
			expect(equals.mock.calls.length).to.equal(1)
		})
		it("for commands", () => {
			const a1 = new Command("a", {}, {}, [plugin])
			const a2 = new Command("a", {}, {}, [plugin])
			expect(a1.equals(a2)).to.equal(true)
			expect(equals.mock.calls.length).to.equal(1)
		})
		it("for conditions", () => {
			const a1 = new Condition("a", {}, {}, [plugin])
			const a2 = new Condition("a", {}, {}, [plugin])
			expect(a1.equals(a2)).to.equal(true)
			expect(equals.mock.calls.length).to.equal(1)
		})
		it("for shortcuts", () => {
			const a1 = new Shortcut([[k.a]], {}, {}, [plugin])
			const a2 = new Shortcut([[k.a]], {}, {}, [plugin])
			expect(a1.equals(a2)).to.equal(true)
			expect(equals.mock.calls.length).to.equal(1)
		})
	})
	describe("throw if conflicting plugins", () => {
		it("for commands", () => {
			expect(catchError(() => {
				new Commands([
					{ name: "a" },
				], [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
			expect(catchError(() => {
				new Commands([
					{ name: "a" },
				], [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
			expect(catchError(() => {
				new Commands([
					{ name: "a" },
				], [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
		})
		it("for shortcuts", () => {
			expect(catchError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], {}, [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
			expect(catchError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], {}, [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
			expect(catchError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], {}, [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
		})
		it("for keys", () => {
			expect(catchError(() => {
				new Keys([
					{ id: "a" },
				],{}, [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
			expect(catchError(() => {
				new Keys([
					{ id: "a" },
				],{}, [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
			expect(catchError(() => {
				new Keys([
					{ id: "a" },
				],{}, [conflictingPlugin, conflictingPlugin])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
		})
	})
	describe("adds namespaced plugin to instances", () => {
		it("for keys", () => {
			const keys = new Keys([
				{ id: "a" },
				{ id: "b" },
			], {}, [plugin])

			expect(keys.get("a").info.name.test).to.equal("TestA")
			expect(keys.get("b").info.name.test).to.equal("TestB")
		})
		it("for commands", () => {
			const commands = new Commands([
				{ name: "a" },
				{ name: "b" },
			], [plugin])

			expect(commands.get("a").info.name.test).to.equal("TestA")
			expect(commands.get("b").info.name.test).to.equal("TestB")
		})
		it("for shortcuts", () => {
			const shortcuts = new Shortcuts([
				{ keys: [[k.a]]},
				{ keys: [[k.b]]},
			], {}, [pluginNoOverrides])

			expect(shortcuts.query(shortcutFilter("a"), false)!.info.name.test).to.equal("default")
			expect(shortcuts.query(shortcutFilter("b"), false)!.info.name.test).to.equal("default")
		})
	})
	describe("throws if plugins have same namespace", () => {
		const plugin1 = new Plugin("A",
			{ test: "default1" },
			pluginInfoDict,
		)
		const plugin2 = new Plugin("A",
			{ test: "default2" },
			pluginInfoDict,
		)
		const plugin3 = new Plugin("test",
			{ test: "default3" },
			pluginInfoDict,
		)

		it.only("for keys", () => {
			expect(catchError(() => {
				new Keys([
					{ id: "a" },
				], {}, [plugin1, plugin2])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
		})
		it("for commands", () => {
			expect(catchError(() => {
				new Commands([
					{ name: "a" },
					{ name: "b" },
				], [plugin1, plugin2])
			}).code).to.equal(TYPE_ERROR.CONFLICTING_PLUGIN_NAMESPACES)
		})
		it("for shortcuts", () => {
			const warn = console.warn
			// we don't care about this output
			console.warn = () => {}
			expect(catchError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], {}, [plugin1 as any, plugin2 as any])
			}))
			console.warn = warn
		})
	})
})
