import { catchError } from "@alanscodelog/utils"
import { describe, expect, it } from "vitest"

import { commands, k, keys, manager, properOrder, properOrderExtraKeys } from "./helpers.keys.js"

import { createShortcut } from "../src/createShortcut.js"
import { defaultSorter } from "../src/defaults/KeysSorter.js"
import { equalsShortcut } from "../src/helpers/equalsShortcut.js"
import { ERROR, type Key } from "../src/types/index.js"
import { chainContainsSubset } from "../src/utils/chainContainsSubset.js"
import { containsKey } from "../src/utils/containsKey.js"
import { equalsKeys } from "../src/utils/equalsKeys.js"


it("it works", () => {
	expect(() => {
		const shortcut = createShortcut({ chain: [[k.a]]}, manager).unwrap()
	}).to.not.throw()
})

it("should throw if duplicate keys in chords", () => {
	expect(catchError(() => {
		createShortcut({ chain: [[k.a, k.a, k.a]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
})
it("should not throw if duplicate keys in different chords", () => {
	expect(() => {
		createShortcut({ chain: [[k.a], [k.a]]}, manager).unwrap()
	}).to.not.throw()
})
it("should throw if duplicate mouse buttons", () => {
	expect(catchError(() => {
		createShortcut({ chain: [[k.mouse2, k.mouse1]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS)
})
it("should throw if duplicate toggle - even different states", () => {
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1, k.toggle1.toggleOnId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1, k.toggle1.toggleOffId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1.toggleOnId!, k.toggle1.toggleOffId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_DUPLICATE_KEY)
})
it("should assign keys properly", () => {
	const shortcut2 = createShortcut({ chain: [[k.a]]}, manager).unwrap()
	expect(shortcut2.chain).to.deep.equal([[k.a.id]])
})
it("should compare equality properly", () => {
	const shortcutA1 = createShortcut({ chain: [[k.a]]}, manager).unwrap()
	const shortcutA2 = createShortcut({ chain: [[k.a]]}, manager).unwrap()
	const shortcutA3 = createShortcut({ chain: [[k.b]]}, manager).unwrap()

	const shortcutB1 = createShortcut({ chain: [[k.modA, k.a], [k.a]]}, manager).unwrap()
	const shortcutB2 = createShortcut({ chain: [[k.modA, k.a], [k.a]]}, manager).unwrap()
	const shortcutB3 = createShortcut({ chain: [[k.modA, k.a], [k.b]]}, manager).unwrap()
	const shortcutB4 = createShortcut({ chain: [[k.a], [k.modA, k.a]]}, manager).unwrap()

	// Against themselves
	expect(equalsShortcut(shortcutA1, shortcutA1, manager)).to.be.true
	expect(equalsShortcut(shortcutB1, shortcutB1, manager)).to.be.true
	// Against other instances
	expect(equalsShortcut(shortcutA1, shortcutA2, manager)).to.be.true
	expect(equalsShortcut(shortcutB1, shortcutB2, manager)).to.be.true
	// False
	expect(equalsShortcut(shortcutA1, shortcutA3, manager)).to.be.false
	expect(equalsShortcut(shortcutB1, shortcutB3, manager)).to.be.false
	expect(equalsShortcut(shortcutB1, shortcutB4, manager)).to.be.false
})
it("should guard against impossible toggle shortcut", () => {
	expect(catchError(() => {
		const s = createShortcut({ chain: [[k.toggle1.toggleOffId!], [k.toggle1.toggleOffId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1], [k.toggle1.toggleOnId!], [k.toggle1.toggleOnId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1], [k.toggle1.toggleOnId!], [k.toggle1.toggleOnId!], [k.toggle1.toggleOnId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1], [k.toggle1.toggleOnId!], [k.a], [k.toggle1.toggleOnId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
	expect(catchError(() => {
		createShortcut({ chain: [[k.toggle1.toggleOnId!], [k.toggle2.toggleOffId!], [k.toggle1.toggleOnId!], [k.toggle2.toggleOffId!]]}, manager).unwrap()
	}).code).to.equal(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE)
	expect(() => {
		createShortcut({ chain: [[k.toggle1.toggleOnId!], [k.toggle1], [k.toggle1.toggleOnId!]]}, manager).unwrap()
		createShortcut({ chain: [[k.toggle1], [k.toggle1.toggleOnId!], [k.toggle1.toggleOffId!], [k.toggle1.toggleOnId!]]}, manager).unwrap()
		// Still a terrible idea but i guess it could work
		createShortcut({ chain: [[k.toggle1], [k.toggle1.toggleOnId!], [k.toggle1.toggleOffId!]]}, manager).unwrap()
		createShortcut({ chain: [[k.toggle1], [k.toggle1.toggleOffId!], [k.toggle1.toggleOnId!]]}, manager).unwrap()
	}).to.not.throw()
})
it("should throw if chord only contains modifiers and it's not the last chord", () => {
	expect(catchError(() => {
		createShortcut({ chain: [[k.modA], [k.modB]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_ONLY_MODIFIERS)
	expect(() => {
		createShortcut({ chain: [[k.a], [k.modA]]}, manager).unwrap()
		createShortcut({ chain: [[k.a], [k.modA, k.modB]]}, manager).unwrap()
		createShortcut({ chain: [[k.a], [k.modA, k.a], [k.modA]]}, manager).unwrap()
	}).to.not.throw()
})
// todo in future this limitation will be removed
it("should throw when shortcut contain more than one trigger key in a chord", () => {
	expect(catchError(() => {
		createShortcut({ chain: [[k.a, k.b]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS)
	expect(catchError(() => {
		createShortcut({ chain: [[k.c], [k.a, k.b]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_MULTIPLE_TRIGGER_KEYS)
})
it("should throw when shortcut contain more than one wheel key in a chord", () => {
	expect(catchError(() => {
		createShortcut({ chain: [[k.wheelDown, k.wheelUp]]}, manager).unwrap()
	}).code).to.equal(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS)
	expect(() => {
		createShortcut({ chain: [[k.wheelDown], [k.wheelUp]]}, manager).unwrap()
	}).to.not.throw()
	expect(() => {
		createShortcut({ chain: [[k.wheelDown], [k.wheelDown]]}, manager).unwrap()
	}).to.not.throw()
})
it("should sort keys properly", () => {
	const reverseOrder = [...properOrder].reverse()
	expect(reverseOrder[0]).to.not.equal(properOrder[0])
	const entries: Record<string, Key> = {}
	const toggles: Record<string, Key> = {}
	for (const key of [...Object.values(k), ...properOrderExtraKeys]) {
		if (entries[key.id]) {
			throw new Error(`Test k object has duplicate keys "${key.id}".`)
		}
		entries[key.id] = key
		if (key.isToggle) {
			toggles[`${key.id}On`] = key
			toggles[`${key.id}Off`] = key
		}
	}
	const sorted = defaultSorter.sort(reverseOrder, { ...manager.keys, entries, toggles })
	expect(sorted).to.deep.equal(properOrder)
})
// expect((createShortcut({chain:[[k.a]]}, manager)).equalsKeys([[k.aVariant]])).to.equal(true) ???
it("equalsKeys", () => {
	expect(equalsKeys(
		[[k.a.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(true)

	expect(equalsKeys(
		[[k.a.id], [k.b.id]],
		[[k.a.id], [k.b.id]],
		manager.keys
	)).to.equal(true)

	expect(equalsKeys(
		[[k.b.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(false)

	expect(equalsKeys(
		[[k.a.id, k.b.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(false)

	expect(equalsKeys(
		[[k.a.id], [k.b.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(false)

	expect(equalsKeys(
		[[k.modA.id]],
		[[k.modA.id, k.b.id]],
		manager.keys
	)).to.equal(false)

	expect(equalsKeys(
		[[k.a.id]],
		[[k.modA.id, k.b.id]],
		manager.keys
	)).to.equal(false)

	expect(equalsKeys(
		[[k.a.id]],
		[[k.a.id], [k.b.id]],
		manager.keys
	)).to.equal(false)

	expect(equalsKeys(
		[[k.a.id]],
		[[k.a.id], [k.b.id]],
		manager.keys,
		2
	)).to.equal(false)
})
it("containsSubset", () => {
	expect(chainContainsSubset(
		[[k.a.id]],
		[[]],
		manager.keys
	)).to.equal(true)
	expect(chainContainsSubset(
		[[k.a.id]],
		[],
		manager.keys
	)).to.equal(true)


	expect(chainContainsSubset(
		[[k.a.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id]],
		[[k.a.id], [k.b.id]],
		manager.keys
	)).to.equal(false)

	expect(chainContainsSubset(
		[[k.modA.id, k.a.id]],
		[[k.modA.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.b.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.b.id], [k.c.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.modA.id, k.b.id]],
		[[k.a.id], [k.modA.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.modA.id, k.a.id]],
		[[k.a.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.modA.id, k.b.id]],
		[[k.a.id], [k.b.id]],
		manager.keys
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.b.id], [k.c.id]],
		[[k.a.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(false)

	expect(chainContainsSubset(
		[[k.modA.id, k.a.id]],
		[[k.a.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.modA.id, k.a.id]],
		[[k.modA.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.modA.id, k.a.id]],
		[[k.modA.id, k.a.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(false)


	expect(chainContainsSubset(
		[[k.modA.id, k.modB.id, k.a.id]],
		[[k.modA.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(false)

	expect(chainContainsSubset(
		[[k.modA.id, k.modB.id, k.a.id]],
		[[k.modA.id, k.modB.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.modA.id, k.modB.id, k.a.id]],
		[[k.a.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(false)

	expect(chainContainsSubset(
		[[k.a.id], [k.modA.id, k.b.id]],
		[[k.a.id], [k.b.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.modA.id, k.b.id]],
		[[k.a.id], [k.modA.id]],
		manager.keys,
		{ onlyPressable: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id]],
		[[k.a.id]],
		manager.keys,
		{ onlySubset: true }
	)).to.equal(false)

	expect(chainContainsSubset(
		[[k.a.id]],
		[[]],
		manager.keys,
		{ onlySubset: true }
	)).to.equal(true)

	// expect(chainContainsSubset(
	// 	[[k.a.id]],
	// 	[],
	// 	manager.keys,
	// 	{ onlySubset: true }
	// )).to.equal(true)
	//
	expect(chainContainsSubset(
		[[k.a.id], [k.a.id]],
		[[k.a.id]],
		manager.keys,
		{ onlySubset: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.a.id]],
		[[k.a.id], []],
		manager.keys,
		{ onlySubset: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.modA.id, k.a.id]],
		[[k.a.id], []],
		manager.keys,
		{ onlySubset: true }
	)).to.equal(true)

	expect(chainContainsSubset(
		[[k.a.id], [k.modA.id, k.a.id]],
		[[k.a.id], [k.modA.id]],
		manager.keys,
		{ onlySubset: true }
	)).to.equal(true)
})
