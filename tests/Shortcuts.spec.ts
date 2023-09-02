import { type Result, testName } from "@alanscodelog/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { k } from "./helpers.keys.js"

import { Condition } from "shortcuts-manager/classes/Condition.js"
import { Shortcut } from "shortcuts-manager/classes/Shortcut.js"
import { Shortcuts } from "shortcuts-manager/classes/Shortcuts.js"
import type { KnownError } from "shortcuts-manager/helpers/KnownError.js"
import { ERROR } from "shortcuts-manager/types/enums.js"


const shortcut1 = new Shortcut([[k.a]])
const shortcut1c = new Shortcut([[k.a]], { condition: new Condition("other") })
const shortcut2 = new Shortcut([[k.b]])
const shortcut3 = new Shortcut([[k.c]])

describe("Shortcuts", () => {
	it("throws if adding duplicates", () => {
		expect(() => {
			new Shortcuts([
				new Shortcut([[k.a]]),
				new Shortcut([[k.a]]),
			])
		}).to.throw()
	})
	it("does not throw if adding \"duplicates\" with different conditions", () => {
		expect(() => {
			new Shortcuts([
				new Shortcut([[k.a]]),
				new Shortcut([[k.a]], { condition: new Condition("other") }),
			])
		}).to.not.throw()
	})
	const shortcuts = new Shortcuts([
		shortcut1,
		shortcut1c,
		shortcut2,
		shortcut3,
	])
	
	it("querying", () => {
		const res = shortcuts.query(val => shortcuts.stringifier.stringify(val.chain) === "a")
		expect(res?.length).to.equal(2)
		expect(res[0]).to.equal(shortcut1)
		expect(res[1]).to.equal(shortcut1c)
	})
	it("querying - single", () => {
		const res2 = shortcuts.query(val => shortcuts.stringifier.stringify(val.chain) === "a", false)
		expect(res2).to.equal(shortcut1)
	})
	it("does not allow changing to duplicate", () => {
		shortcut1.allows("chain", [[k.c]])
		expect((shortcut1.allows("chain", [[k.c]]) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.DUPLICATE_SHORTCUT)
	})
	it("removes listener from shortcuts", () => {
		expect(shortcut3.hooks.allows.length).to.equal(1)
		expect(shortcuts.entries.length).to.equal(4)
		shortcuts.remove(shortcut3)
		expect(shortcuts.entries.length).to.equal(3)

		expect(shortcut3.hooks.allows.length).to.equal(0)

		shortcuts.add(shortcut3)
		expect(shortcuts.entries.length).to.equal(4)
		expect(shortcut3.hooks.allows.length).to.equal(1)

		expect(() => {
			shortcuts.allows("add", shortcut3).unwrap()
		}).to.throw()
		expect(shortcut3.hooks.allows.length).to.equal(1)
	})
	it("canSwapChords", () => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const shortcuts = new Shortcuts([
			new Shortcut([[k.a], [k.b]]),
			new Shortcut([[k.b], [k.b]]),
			// new Shortcut([[k.b]]),
			new Shortcut([[k.c]]),
		])
		expect(shortcuts.canSwapChords([[k.a]], [[k.b]]).isOk).to.equal(true)
		expect((shortcuts.canSwapChords([[k.a]], [[k.a]]) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.INVALID_SWAP_CHORDS)
		//
		expect((shortcuts.canSwapChords([[k.modA]], [[k.modA, k.b], []]) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.INVALID_SWAP_CHORDS)
		expect((shortcuts.canSwapChords([[k.a]], [[k.b]], shortcut => {
			if (shortcut.chain[0][0] === k.a) return false
			return true
		}) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.DUPLICATE_SHORTCUT)

		const CAB = new Shortcut([[k.c], [k.a], [k.b]])
		const CA = new Shortcut([[k.c], [k.c]])
		const shortcuts2 = new Shortcuts([
			CAB,
			CA,
		])
		//
		expect((shortcuts2.canSwapChords([CA.chain[0]], CAB.chain) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.INVALID_SWAP_CHORDS)
		expect((shortcuts2.canSwapChords(CAB.chain, [CA.chain[0]]) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		const AB = new Shortcut([[k.c], [k.a], [k.b]])
		const A = new Shortcut([[k.c], [k.c]])
		const shortcuts3 = new Shortcuts([
			AB,
			A,
		], { ignoreChainConflicts: true })
		//
		expect((shortcuts3.canSwapChords([A.chain[0]], AB.chain) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.INVALID_SWAP_CHORDS)
		expect((shortcuts3.canSwapChords(AB.chain, [A.chain[0]]) as Result.ErrResult<KnownError>).error.code).to.equal(ERROR.INVALID_SWAP_CHORDS)
	})
	it("swapChords", () => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const shortcuts = new Shortcuts([
			new Shortcut([[k.a], [k.c]]),
			new Shortcut([[k.b], [k.d]]),
			new Shortcut([[k.b]]),
			new Shortcut([[k.c]]),
			new Shortcut([[k.modA]]),
			new Shortcut([[k.modA, k.a]]),
		], { ignoreChainConflicts: true, ignoreModifierConflicts: true })

		const res = shortcuts.swapChords([[k.a]], [[k.b]])
		const res2 = shortcuts.swapChords([[k.modA]], [[k.modB]])
		expect(res.isOk).to.equal(true)
		expect(res2.isOk).to.equal(true)
		expect(shortcuts.entries.map(shortcut => shortcut.chain)).to.deep.equal([
			[[k.b], [k.c]],
			[[k.a], [k.d]],
			[[k.a]],
			[[k.c]],
			[[k.modB]],
			[[k.modA, k.a]], // note this is not swapped
		])
	})
})
