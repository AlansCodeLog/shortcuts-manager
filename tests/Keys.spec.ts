import { Key, Keys } from "@/classes"
import { ERROR } from "@/types"
import { catchError, testName } from "@alanscodelog/utils"
import { expect } from "./chai"

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
			keys.add(new Key("a"))
		}).code).to.equal(ERROR.DUPLICATE_KEY)
	})
	describe("methods", () => {
		const keyA = new Key("a")
		const keys = new Keys([
			keyA,
			new Key("b"),
			new Key("c"),
		])
		it("exists", () => {
			const filter = jest.fn((key: Key) => {
				expect(key).to.not.equal(undefined)
				return key.id === "a"
			})
			expect(keys.info("a")).to.deep.equal(keyA.info)
			expect(keys.get("a")).to.equal(keyA)
			expect(keys.exists(filter)).to.equal(true)
			expect(keys.filter(filter)[0].id).to.equal("a")
		})
	})
})
