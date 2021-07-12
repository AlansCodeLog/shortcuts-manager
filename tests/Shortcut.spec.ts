import { Shortcut } from "@/classes"
import { defaultSorter } from "@/classes/KeysSorter"
import { inspectError, testName } from "@alanscodelog/utils"
import { expect } from "./chai"
import { k, properOrder } from "./helpers.keys"




describe(testName(), () => {
	it("allows getting opts back", () => {
		const shortcut = new Shortcut([[k.a]])
		expect(Object.keys(shortcut.opts).length).to.be.greaterThan(0)
	})

	it("should throw if info passed but no plugins", () => {
		expect(inspectError(() => {
			// @ts-expect-error we want the wrong overload to error
			new Shortcut("A", { }, { test: "test" })
		}, false)).to.throw()
	})
	it("should throw if duplicate keys in chords", () => {
		expect(inspectError(() => {
			new Shortcut([[k.a, k.a, k.a]])
		}, false)).to.throw()
	})
	it("should not throw if duplicate keys in different chords", () => {
		expect(inspectError(() => {
			new Shortcut([[k.a], [k.a]])
		}, false)).to.not.throw()
	})
	it("should throw if duplicate mouse buttons", () => {
		expect(inspectError(() => {
			new Shortcut([[k.modMouse1, k.mouse1]])
		}, false)).to.throw()
	})
	it("should throw if duplicate toggle - even different states", () => {
		expect(inspectError(() => {
			new Shortcut([[k.toggle1, k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1, k.toggle1.off!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.on!, k.toggle1.off!]])
		}, false)).to.throw()
	})
	it("should assign keys properly", () => {
		const shortcut2 = new Shortcut([[k.a]])
		expect(shortcut2.keys).to.deep.equal([[k.a]])
	})
	it("should compare equality properly", () => {
		const shortcutA1 = new Shortcut([[k.a]])
		const shortcutA2 = new Shortcut([[k.a]])
		const shortcutA3 = new Shortcut([[k.b]])

		const shortcutB1 = new Shortcut([[k.modA, k.a], [k.a]])
		const shortcutB2 = new Shortcut([[k.modA, k.a], [k.a]])
		const shortcutB3 = new Shortcut([[k.modA, k.a], [k.b]])
		const shortcutB4 = new Shortcut([[k.a], [k.modA, k.a]])

		// Against themselves
		expect(shortcutA1.equals(shortcutA1)).to.be.true
		expect(shortcutB1.equals(shortcutB1)).to.be.true
		// Against other instances
		expect(shortcutA1.equals(shortcutA2)).to.be.true
		expect(shortcutB1.equals(shortcutB2)).to.be.true

		// False
		expect(shortcutA1.equals(shortcutA3)).to.be.false
		expect(shortcutB1.equals(shortcutB3)).to.be.false
		expect(shortcutB1.equals(shortcutB4)).to.be.false
	})
	it("should guard against impossible toggle shortcut", () => {
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.off!], [k.toggle1.off!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.on!], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.a], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.on!, k.explicitToggle.off!], [k.toggle1, k.explicitToggle.off!], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.on!], [k.toggle1], [k.toggle1.on!]])
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.off!], [k.toggle1.on!]])
			// Still a terrible idea but i guess it could work
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.off!]])
			new Shortcut([[k.toggle1], [k.toggle1.off!], [k.toggle1.on!]])
		}, false)).to.not.throw()
	})
	it("should throw if chord only contains modifiers and it's not the last chord", () => {
		expect(inspectError(() => {
			new Shortcut([[k.modA], [k.modB]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.a], [k.modA]])
			new Shortcut([[k.a], [k.modA, k.modB]])
			new Shortcut([[k.a], [k.modA, k.a], [k.modA]])
		}, false)).to.not.throw()
	})
	it("should throw when shortcut contain more than one normal key in a chord", () => {
		expect(inspectError(() => {
			new Shortcut([[k.a, k.b]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.c], [k.a, k.b]])
		}, false)).to.throw()
	})
	it("should throw when shortcut contain more than one wheel key in a chord", () => {
		expect(inspectError(() => {
			new Shortcut([[k.wheelDown, k.wheelUp]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.wheelDown], [k.wheelUp]])
		}, false)).to.not.throw()
	})
	it("should sort keys properly", () => {

		const reverseOrder = [...properOrder].reverse()
		expect(reverseOrder[0]).to.not.equal(properOrder[0])

		const sorted = defaultSorter.sort(reverseOrder)

		expect(sorted).to.partial.deep.equal(properOrder)
	})
})
