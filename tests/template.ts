import { testName } from "@alanscodelog/utils"
import { describe, expect, it } from "vitest"


describe(testName(), () => {
	it("missing tests", () => {
		expect(true).to.equal(false)
	})
})
