import { catchError, testName } from "@alanscodelog/utils"
import { Key } from "classes/Key.js"
import { Keys } from "classes/Keys.js"
import { ERROR } from "types/enums.js"
import { describe, expect, it, vi } from "vitest"


describe(testName(), () => {
	it("should add keys", () => {
		const keymap = new Keys([
			new Key("a"),
			new Key("b"),
		])
		expect(keymap.entries.a).to.exist
		expect(keymap.entries.b).to.exist
		const keymap2 = new Keys([
			new Key("a"),
		])
		keymap2.add(new Key("b"))

		expect(keymap.entries.a).to.exist
		expect(keymap.entries.b).to.exist
	})
	it("should throw on duplicate keys", () => {
		expect(catchError(() => {
			new Keys([
				new Key("a"),
				new Key("a"),
			])
		}).code).to.equal(ERROR.DUPLICATE_KEY)
		expect(catchError(() => {
			const keys = new Keys([
				new Key("a"),
			])
			keys.allows("add", new Key("a")).unwrap()
		}).code).to.equal(ERROR.DUPLICATE_KEY)
	})
	it("should not throw on duplicate keys with different ids", () => {
		expect(() => {
			new Keys([
				new Key("a1", { variants: ["a"]}),
				new Key("a2", { variants: ["a"]}),
			])
		}).to.not.throw()
	})
	describe("methods", () => {
		const keyA = new Key("a")
		const keys = new Keys([
			keyA,
			new Key("b"),
			new Key("c"),
		])
		it("exists", () => {
			const filter = vi.fn((key: Key) => {
				expect(key).to.not.equal(undefined)
				return key.id === "a"
			})
			expect(keys.get("a")).to.equal(keyA)
			expect(keys.query(filter, false)).to.equal(keyA)
			expect(keys.query(filter, true)![0]).to.equal(keyA)
		})
	})
})
