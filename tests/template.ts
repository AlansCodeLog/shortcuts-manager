import { testName } from "@alanscodelog/utils"

import { expect } from "./chai"


describe(testName(), () => {
	it("missing tests", () => {
		expect(true).to.equal(false)
	})
})
