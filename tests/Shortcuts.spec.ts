import { catchError } from "@alanscodelog/utils"
import { describe, expect, it } from "vitest"

import { k, manager } from "./helpers.keys.js"

import { createCommand } from "../src/createCommand.js"
import { createCommands } from "../src/createCommands.js"
import { createCondition } from "../src/createCondition.js"
import { createShortcut } from "../src/createShortcut.js"
import { createShortcuts } from "../src/createShortcuts.js"
import { shortcutSwapChords } from "../src/helpers/shortcutSwapChords.js"
import { removeCommand } from "../src/removeCommand.js"
import { removeKey } from "../src/removeKey.js"
import { setShortcutProp } from "../src/setShortcutProp.js"
import { ERROR } from "../src/types/index.js"


describe("Shortcuts", () => {
	it("throws if adding duplicates", () => {
		expect(() => {
			createShortcuts([
				createShortcut({ chain: [[k.a]]}, manager).unwrap(),
				createShortcut({ chain: [[k.a]]}, manager).unwrap(),
			], manager).unwrap()
		}).to.throw()
	})
	it("does not throw if adding \"duplicates\" with different conditions", () => {
		expect(() => {
			createShortcuts([
				createShortcut({ chain: [[k.a]]}, manager).unwrap(),
				createShortcut({ chain: [[k.a]], condition: createCondition("other") }, manager,).unwrap(),
			], manager)
		}).to.not.throw()
	})

	it("does not allow changing to duplicate", () => {
		const shortcut = createShortcut({ chain: [[k.a]]}, manager).unwrap()
		const shortcuts = createShortcuts([
			shortcut,
			createShortcut({ chain: [[k.a]], condition: createCondition("other") }, manager).unwrap(),
			createShortcut({ chain: [[k.b]]}, manager).unwrap(),
			createShortcut({ chain: [[k.c]]}, manager).unwrap(),
		], manager).unwrap()
		const m = { ...manager, shortcuts, hooks: {} }
		const res = setShortcutProp(shortcut, "chain", [[k.c.id]], m)
		expect(res.isError).to.equal(true)
		if (res.isError) {
			expect(res.error.code).to.equal(ERROR.DUPLICATE_SHORTCUT)
		}
	})
	it("does not allow unknown keys", () => {
		expect(catchError(() =>
			createShortcut({ chain: [["unknown key"]]}, manager).unwrap()
		).code).to.equal(ERROR.UNKNOWN_KEY)
	})
	it("does not allow removal of in use keys", () => {
		const shortcuts = createShortcuts([
			createShortcut({ chain: [[k.a]]}, manager).unwrap(),
		], manager).unwrap()
		
		expect(catchError(() =>
			removeKey(k.a, { ...manager, shortcuts }, { check: "only" }).unwrap()
		).code).to.equal(ERROR.KEY_IN_USE)
	})
	it("does not allow removal of in use commands", () => {
		const commands = createCommands([
			createCommand("test"),
		]).unwrap()
		const m = { ...manager, commands }
		const shortcuts = createShortcuts([
			createShortcut({ chain: [[k.a]], command: "test" }, m).unwrap(),
		], m).unwrap()
		
		expect(catchError(() =>
			removeCommand(commands.entries.test, { ...m, shortcuts }, { check: "only" }).unwrap()
		).code).to.equal(ERROR.COMMAND_IN_USE)
	})

	it("does not allow unknown commands", () => {
		expect(catchError(() =>
			createShortcut({ chain: [[k.a]], command: "unknown command" }, manager).unwrap()
		).code).to.equal(ERROR.UNKNOWN_COMMAND)
	})
	it("swapChords, check only", () => {
		const shortcuts = createShortcuts([
			createShortcut({ chain: [[k.a], [k.b]]}, manager).unwrap(),
			createShortcut({ chain: [[k.b], [k.b]]}, manager).unwrap(),
			createShortcut({ chain: [[k.c]]}, manager).unwrap(),
		], manager).unwrap()
		
		expect(catchError(() =>
			shortcutSwapChords(shortcuts, [[k.a.id]], [[k.a.id]], manager, { check: "only" }).unwrap()
		).code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		expect(catchError(() =>
			shortcutSwapChords(shortcuts, [[k.modA.id]], [[k.modA.id, k.b.id], []], manager, { check: "only" }).unwrap()
		).code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		expect(catchError(() =>
			shortcutSwapChords(shortcuts, [[k.a.id]], [[k.b.id]], manager, { check: "only" }, shortcut => {
				if (shortcut.chain[0][0] === k.a.id) return false
				return true
			}).unwrap()
		).code).to.equal(ERROR.DUPLICATE_SHORTCUT)


		const CAB = createShortcut({ chain: [[k.c], [k.a], [k.b]]}, manager).unwrap()
		const CA = createShortcut({ chain: [[k.c], [k.c]]}, manager).unwrap()
		const shortcuts2 = createShortcuts([
			CAB,
			CA,
		], manager).unwrap()

		expect(catchError(() =>
			shortcutSwapChords(shortcuts2, [CA.chain[0]], CAB.chain, manager, { check: "only" }).unwrap()
		).code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		const AB = createShortcut({ chain: [[k.c], [k.a], [k.b]]}, manager).unwrap()
		const A = createShortcut({ chain: [[k.c], [k.c]]}, manager).unwrap()
		const shortcuts3 = createShortcuts([
			AB,
			A,
		], manager, { ignoreChainConflicts: true }).unwrap()

		expect(catchError(() =>
			shortcutSwapChords(shortcuts3, [A.chain[0]], AB.chain, manager, { check: "only" }).unwrap()
		).code).to.equal(ERROR.INVALID_SWAP_CHORDS)

		expect(catchError(() =>
			shortcutSwapChords(shortcuts3, [AB.chain[0]], A.chain, manager, { check: "only" }).unwrap()
		).code).to.equal(ERROR.INVALID_SWAP_CHORDS)
	})
	it("swapChords", () => {
	// 	// eslint-disable-next-line @typescript-eslint/no-shadow
		const shortcuts = createShortcuts([
			createShortcut({ chain: [[k.a], [k.c]]}, manager).unwrap(),
			createShortcut({ chain: [[k.b], [k.d]]}, manager).unwrap(),
			createShortcut({ chain: [[k.b]]}, manager).unwrap(),
			createShortcut({ chain: [[k.c]]}, manager).unwrap(),
			createShortcut({ chain: [[k.modA]]}, manager).unwrap(),
			createShortcut({ chain: [[k.modA, k.a]]}, manager).unwrap(),
		], manager, { ignoreChainConflicts: true, ignoreModifierConflicts: true }).unwrap()
		
		const m = { ...manager, shortcuts }
		const res = shortcutSwapChords(shortcuts, [[k.a.id]], [[k.b.id]], m).unwrap()
		const res2 = shortcutSwapChords(shortcuts, [[k.modA.id]], [[k.modB.id]], m).unwrap()
		expect(shortcuts.entries.map(shortcut => shortcut.chain)).to.deep.equal([
			[[k.b.id], [k.c.id]],
			[[k.a.id], [k.d.id]],
			[[k.a.id]],
			[[k.c.id]],
			[[k.modB.id]],
			[[k.modA.id, k.a.id]], // note this should not be not swapped
		])
	})
})
