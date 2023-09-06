import { catchError, testName } from "@alanscodelog/utils"
import { describe, expect, it } from "vitest"

import { k, properOrder } from "./helpers.keys.js"

import { defaultSorter } from "shortcuts-manager/classes/KeysSorter.js"
import { Shortcut } from "shortcuts-manager/classes/Shortcut.js"
import { ERROR } from "shortcuts-manager/types/enums.js"


describe(testName(), () => {
	it("allows getting opts back", () => {
		const shortcut = new Shortcut([[k.a]])
		expect(Object.keys(shortcut.opts).length).to.be.greaterThan(0)
	})

	it("should throw if duplicate keys in chords", () => {
		expect(catchError(() => {
			new Shortcut([[k.a, k.a, k.a]])
		}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
	})
	it("should not throw if duplicate keys in different chords", () => {
		expect(() => {
			new Shortcut([[k.a], [k.a]])
		}).to.not.throw()
	})
	it("should throw if duplicate mouse buttons", () => {
		expect(catchError(() => {
			new Shortcut([[k.modMouse1, k.mouse1]])
		}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
	})
	it("should throw if duplicate toggle - even different states", () => {
		expect(catchError(() => {
			new Shortcut([[k.toggle1, k.toggle1.on!]])
		}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
		expect(catchError(() => {
			new Shortcut([[k.toggle1, k.toggle1.off!]])
		}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
		expect(catchError(() => {
			new Shortcut([[k.toggle1.on!, k.toggle1.off!]])
		}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
	})
	it("should assign keys properly", () => {
		const shortcut2 = new Shortcut([[k.a]])
		expect(shortcut2.chain).to.deep.equal([[k.a]])
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
		expect(catchError(() => {
			new Shortcut([[k.toggle1.off!], [k.toggle1.off!]])
		}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
		expect(catchError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.on!]])
		}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
		expect(catchError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.on!], [k.toggle1.on!]])
		}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
		expect(catchError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.a], [k.toggle1.on!]])
		}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
		expect(catchError(() => {
			new Shortcut([[k.toggle1.on!, k.explicitToggle.off!], [k.toggle1, k.explicitToggle.off!], [k.toggle1.on!]])
		}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
		expect(() => {
			new Shortcut([[k.toggle1.on!], [k.toggle1], [k.toggle1.on!]])
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.off!], [k.toggle1.on!]])
			// Still a terrible idea but i guess it could work
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.off!]])
			new Shortcut([[k.toggle1], [k.toggle1.off!], [k.toggle1.on!]])
		}).to.not.throw()
	})
	it("should throw if chord only contains modifiers and it's not the last chord", () => {
		expect(catchError(() => {
			new Shortcut([[k.modA], [k.modB]])
		}).code).to.equal(ERROR.CHORD_W_ONLY_MODIFIERS)
		expect(() => {
			new Shortcut([[k.a], [k.modA]])
			new Shortcut([[k.a], [k.modA, k.modB]])
			new Shortcut([[k.a], [k.modA, k.a], [k.modA]])
		}).to.not.throw()
	})
	it("should throw when shortcut contain more than one normal key in a chord", () => {
		expect(catchError(() => {
			new Shortcut([[k.a, k.b]])
		}).code).to.equal(ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS)
		expect(catchError(() => {
			new Shortcut([[k.c], [k.a, k.b]])
		}).code).to.equal(ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS)
	})
	it("should throw when shortcut contain more than one wheel key in a chord", () => {
		expect(catchError(() => {
			new Shortcut([[k.wheelDown, k.wheelUp]])
		}).code).to.equal(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS)
		expect(() => {
			new Shortcut([[k.wheelDown], [k.wheelUp]])
		}).to.not.throw()
		expect(() => {
			new Shortcut([[k.wheelDown], [k.wheelDown]])
		}).to.not.throw()
	})
	it("should sort keys properly", () => {
		const reverseOrder = [...properOrder].reverse()
		expect(reverseOrder[0]).to.not.equal(properOrder[0])

		const sorted = defaultSorter.sort(reverseOrder)

		expect(sorted).to.deep.equal(properOrder)
	})
	it("equalsKeys", () => {
		expect((new Shortcut([[k.a]])).equalsKeys([[k.a]])).to.equal(true)
		// expect((new Shortcut([[k.a]])).equalsKeys([[k.aVariant]])).to.equal(true) ???
		expect((new Shortcut([[k.a], [k.b]])).equalsKeys([[k.a], [k.b]])).to.equal(true)
		expect((new Shortcut([[k.a]])).equalsKeys([[k.b]])).to.equal(false)
		expect((new Shortcut([[k.a]])).equalsKeys([[k.a, k.b]])).to.equal(false)
		expect((new Shortcut([[k.a]])).equalsKeys([[k.a], [k.b]])).to.equal(false)
		expect((new Shortcut([[k.modA, k.b]])).equalsKeys([[k.modA]])).to.equal(false)
		expect((new Shortcut([[k.a], [k.b]])).equalsKeys([[k.a]])).to.equal(false)
		expect((new Shortcut([[k.a], [k.b]])).equalsKeys([[k.a]], 1)).to.equal(true)
		expect((new Shortcut([[k.a], [k.b]])).equalsKeys([[k.a]], 2)).to.equal(false)
	})
	it("containsSubset", () => {
		expect((new Shortcut([[k.a]]).containsSubset([]))).to.equal(true)
		expect((new Shortcut([[k.a]]).containsSubset([[k.a]]))).to.equal(true)

		expect((new Shortcut([[k.a]]).containsSubset([[k.a], [k.b]]))).to.equal(false)
		// expect((new Shortcut([[k.a]]).containsSubset([[k.a]], {onlySubset: true}))).to.equal(false)
		expect((new Shortcut([[k.modA, k.a]]).containsSubset([[k.modA]]))).to.equal(true)
		expect((new Shortcut([[k.a], [k.b]]).containsSubset([[k.a]]))).to.equal(true)

		expect((new Shortcut([[k.a], [k.b], [k.c]]).containsSubset([[k.a]]))).to.equal(true)


		expect((new Shortcut([[k.a], [k.modA, k.b]]).containsSubset([[k.a], [k.modA]]))).to.equal(true)
		expect((new Shortcut([[k.modA, k.a]]).containsSubset([[k.a]]))).to.equal(true)
		expect((new Shortcut([[k.a], [k.modA, k.b]]).containsSubset([[k.a], [k.b]]))).to.equal(true)


		expect((new Shortcut([[k.a], [k.b], [k.c]]).containsSubset([[k.a]], { onlyPressable: true }))).to.equal(false)

		// todo maybe have an option so this is not true
		expect((new Shortcut([[k.modA, k.a]]).containsSubset([[k.a]], { onlyPressable: true }))).to.equal(true)

		expect((new Shortcut([[k.modA, k.a]]).containsSubset([[k.modA]], { onlyPressable: true }))).to.equal(true)

		expect((new Shortcut([[k.modA, k.modB, k.a]]).containsSubset([[k.modA]], { onlyPressable: true }))).to.equal(false)

		expect((new Shortcut([[k.modA, k.modB, k.a]]).containsSubset([[k.modA]], { onlyPressable: true }))).to.equal(false)
		expect((new Shortcut([[k.modA, k.modB, k.a]]).containsSubset([[k.modA, k.modB]], { onlyPressable: true }))).to.equal(true)

		expect((new Shortcut([[k.modA, k.modB, k.a]]).containsSubset([[k.a]], { onlyPressable: true }))).to.equal(false)

		// todo same as above
		expect((new Shortcut([[k.a], [k.modA, k.b]]).containsSubset([[k.a], [k.b]], { onlyPressable: true }))).to.equal(true)

		expect((new Shortcut([[k.a], [k.modA, k.b]]).containsSubset([[k.a], [k.modA]], { onlyPressable: true }))).to.equal(true)
	})
})
