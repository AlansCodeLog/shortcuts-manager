/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Command, Commands, Key, Keys, Plugin, Shortcut, Shortcuts } from "@/classes"
import { inspectError, testName } from "@alanscodelog/utils"
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

const conflictingPlugin = new Plugin(
	"name",
	{ test: "default" },
)

// shortcuts won't accept plugins with overrides but we want to test this
// also typescript should complain if we take away this cast
type Ignore = any


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
			], [plugin])

			keys.add({ id: "b" })

			expect(keys.get("b").plugins).to.deep.equal([plugin])
			expect(keys.info("b").name.test).to.equal("TestB")
		})
		it("for commands", () => {
			const commands = new Commands([
				{ name: "a" },
			], [plugin])

			commands.add({ name: "b" })

			expect(commands.get("b").plugins).to.deep.equal([plugin])
			expect(commands.info("b").name.test).to.equal("TestB")
		})
		it("for shortcuts", () => {
			const warn = console.warn
			console.warn = jest.fn()
			const shortcuts = new Shortcuts([
				{ keys: [[k.a]]},
			], [plugin as Ignore]) // doesn't really matter if it has overrides

			shortcuts.add({ keys: [[k.b]]})
			// shortcuts can't use the overrides
			expect((console.warn as jest.Mock<any, any>).mock.calls.length).to.equal(3)
			expect(shortcuts.get(shortcutFilter("b"), false)!.plugins).to.deep.equal([plugin])
			expect(shortcuts.info(shortcutFilter("b"), false)!.name.test).to.equal("default")
			console.warn = warn
		})
	})
	describe("use plugin's equals function", () => {
		// eslint-disable-next-line no-shadow
		const equals = plugin.equals
		plugin.equals = jest.fn((...args) => equals(...args))
		beforeEach(() => {
			(plugin.equals as jest.Mock<any, any>).mockClear()
		})
		it("for keys", () => {
			const a1 = new Key("a", {}, {}, [plugin])
			const a2 = new Key("a", {}, {}, [plugin])
			a1.equals(a2)
			expect((plugin.equals as jest.Mock<any, any>).mock.calls.length).to.equal(1)
		})
		it("for commands", () => {
			const a1 = new Command("a", {}, {}, [plugin])
			const a2 = new Command("a", {}, {}, [plugin])
			a1.equals(a2)
			expect((plugin.equals as jest.Mock<any, any>).mock.calls.length).to.equal(1)
		})
		it("for shortcuts", () => {
			const a1 = new Shortcut([[k.a]], {}, {}, [plugin as Ignore])
			const a2 = new Shortcut([[k.a]], {}, {}, [plugin as Ignore])
			a1.equals(a2)
			expect((plugin.equals as jest.Mock<any, any>).mock.calls.length).to.equal(1)
		})
	})
	describe("throw if conflicting plugins", () => {
		it("for commands", () => {
			expect(inspectError(() => {
				new Commands([
					{ name: "a" },
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
			expect(inspectError(() => {
				new Commands([
					{ name: "a" },
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
			expect(inspectError(() => {
				new Commands([
					{ name: "a" },
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
		})
		it("for shortcuts", () => {
			expect(inspectError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
			expect(inspectError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
			expect(inspectError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
		})
		it("for keys", () => {
			expect(inspectError(() => {
				new Keys([
					{ id: "a" },
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
			expect(inspectError(() => {
				new Keys([
					{ id: "a" },
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
			expect(inspectError(() => {
				new Keys([
					{ id: "a" },
				], [conflictingPlugin, conflictingPlugin])
			})).to.throw()
		})
	})
	describe("adds namespaced plugin to instances", () => {
		it("for keys", () => {
			const keys = new Keys([
				{ id: "a" },
				{ id: "b" },
			], [plugin])

			expect(keys.info("a").name.test).to.equal("TestA")
			expect(keys.info("b").name.test).to.equal("TestB")
		})
		it("for commands", () => {
			const commands = new Commands([
				{ name: "a" },
				{ name: "b" },
			], [plugin])

			expect(commands.info("a").name.test).to.equal("TestA")
			expect(commands.info("b").name.test).to.equal("TestB")
		})
		it("for shortcuts", () => {
			const shortcuts = new Shortcuts([
				{ keys: [[k.a]]},
				{ keys: [[k.b]]},
			], [plugin as Ignore])

			expect(shortcuts.info(shortcutFilter("a"), false)!.name.test).to.equal("default")
			expect(shortcuts.info(shortcutFilter("b"), false)!.name.test).to.equal("default")
		})
	})
	describe("throws if plugins have same namespace or would override property", () => {
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

		it("for keys", () => {
			expect(inspectError(() => {
				new Keys([
					{ id: "a" },
				], [plugin1, plugin2])
			}))
			expect(inspectError(() => {
				new Keys([
					{ id: "a" },
				], [plugin1, plugin3])
			}))
		})
		it("for commands", () => {
			expect(inspectError(() => {
				new Commands([
					{ name: "a" },
					{ name: "b" },
				], [plugin1, plugin2])
			}))
			expect(inspectError(() => {
				new Commands([
					{ name: "a" },
					{ name: "b" },
				], [plugin1, plugin3])
			}))
		})
		it("for shortcuts", () => {
			expect(inspectError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], [plugin1 as Ignore, plugin2 as Ignore])
			}))
			expect(inspectError(() => {
				new Shortcuts([
					{ keys: [[k.a]]},
				], [plugin1 as Ignore, plugin3 as Ignore])
			}))
		})
	})
})
