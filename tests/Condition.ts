// import { check_extends } from "./helpers.condition"
import { testName } from "@alanscodelog/utils"
import { expect } from "chai"

import { Condition, Context } from "@/classes"


const context = new Context({
	true: true,
	false: false,
})

describe(testName(), () => {
	it("allows getting opts back", () => {
		const condition = new Condition("a")
		expect(Object.keys(condition.opts).length).to.be.greaterThan(0)
	})
})
