import { Condition, Plugin, Shortcut, Shortcuts } from "@/classes"
import { ERROR } from "@/types"
import { ErrorW, testName } from "@alanscodelog/utils"
import { expect } from "./chai"
import { k } from "./helpers.keys"
const plugin = new Plugin(
	"test",
	{ prop: "default" },
)
const shortcut1 = new Shortcut([[k.a]])
const shortcut1b = new Shortcut([[k.a]])
const shortcut1c = new Shortcut([[k.a]], {condition: new Condition("other")})
const shortcut2 = new Shortcut([[k.b]], {}, {test:{prop: "override"}}, [plugin])
const shortcut3 = new Shortcut([[k.c]])

describe(testName(), () => {
	it("throws if adding duplicates", () => {
		expect(() => {
			new Shortcuts([
				shortcut1,
				shortcut1b,
			], {}, [plugin])
		}).to.throw()
	})
	let shortcuts: Shortcuts
	expect(() => {
		shortcuts = new Shortcuts([
			shortcut1,
			shortcut1c,
			shortcut2,
			shortcut3
		],{}, [plugin])
	}).to.not.throw()

		it("querying", () => {
			const res = shortcuts.query(val => shortcuts.stringifier.stringify(val.keys) === "a")
			expect(res?.length).to.equal(2)
			expect(res![0]).to.equal(shortcut1)
			expect(res![1]).to.equal(shortcut1c)
		})
		it("querying - single", () => {
			const res2 = shortcuts.query(val => shortcuts.stringifier.stringify(val.keys) === "a", false)
			expect(res2).to.equal(shortcut1)
		})
	it("does not allow changing to duplicate", () => {
			shortcut1.allows("keys", [[k.c]])
			expect((shortcut1.allows("keys", [[k.c]]) as ErrorW<{ code: string }>).code).to.equal(ERROR.DUPLICATE_SHORTCUT)
		})
	it("removes listener from shortcuts", () => {
		expect(shortcut3.listeners.allows.length).to.equal(2)
		expect(shortcuts.entries.length).to.equal(4)
		shortcuts.remove(shortcut3)
		expect(shortcuts.entries.length).to.equal(3)

		expect(shortcut3.listeners.allows.length).to.equal(1)

		shortcuts.add(shortcut3)
		expect(shortcuts.entries.length).to.equal(4)
		expect(shortcut3.listeners.allows.length).to.equal(2)

		expect(() => {
			shortcuts.add(shortcut3)
		}).to.throw()
		expect(shortcut3.listeners.allows.length).to.equal(2)
	})
	it("canSwapChords", () => {
		const shortcuts = new Shortcuts([
			new Shortcut([[k.a], [k.b]]),
			new Shortcut([[k.b], [k.b]]),
			new Shortcut([[k.b]]),
			new Shortcut([[k.c]])
		], {}, [plugin])
		expect(shortcuts.canSwapChords([[k.a]], [[k.b]])).to.equal(true)
		expect((shortcuts.canSwapChords([[k.a]], [[k.a]]) as ErrorW<{ code: any }>).code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		expect((shortcuts.canSwapChords([[k.a]], [[k.a, k.b], []]) as ErrorW<{ code: any }>).code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		expect((shortcuts.canSwapChords([[k.a]], [[k.b]], (shortcut) => {
			if (shortcut.keys[0][0] === k.a) return false
			return true
		}) as ErrorW<{ code: any }>).code).to.equal(ERROR.DUPLICATE_SHORTCUT)

		const AB = new Shortcut([[k.a], [k.b]])
		const A = new Shortcut([[k.a]])
		const shortcuts2 = new Shortcuts([
			AB,
			A
		], {}, [plugin])

		expect((shortcuts2.canSwapChords([[k.a]], [[k.a], [k.b]]) as ErrorW<{ code: any }>).code).to.equal(ERROR.INVALID_SWAP_CHORDS)
		expect((shortcuts2.canSwapChords([[k.a], [k.b]], [[k.a]]) as ErrorW<{ code: any }>).code).to.equal(ERROR.INVALID_SWAP_CHORDS)
	})
	it("swapChords", () => {
		const shortcuts = new Shortcuts([
			new Shortcut([[k.a], [k.c]]),
			new Shortcut([[k.b], [k.d]]),
			new Shortcut([[k.b]]),
			new Shortcut([[k.c]])
		], {}, [plugin])

		shortcuts.swapChords([[k.a]], [[k.b]])
		expect(shortcuts.entries.map(shortcut => shortcut.keys)).to.deep.equal([
			[[k.b], [k.c]],
			[[k.a], [k.d]],
			[[k.a]],
			[[k.c]]
		])
	})
})
