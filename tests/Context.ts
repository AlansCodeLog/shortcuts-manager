import { testName } from "@alanscodelog/utils"
import { expect } from "chai"

import { Condition, Context } from "@/classes"


describe(testName(), () => {
	it("has no opts", () => {
		const context = new Context({})
		// @ts-expect-error we expect it to be undefined
		expect(context.opts).to.equal(undefined)
	})
	it("equals works", () => {
		const context1 = new Context({
			a: true,
			b: true,
		})

		const context2 = new Context({
			a: true,
			b: true,
		})
		const context3 = new Context({
			a: true,
		})
		const context4 = new Context({
			c: true,
		})
		const context5 = new Context({
			a: true,
			c: true,
		})
		expect(context1.equals(context2)).to.be.true
		expect(context2.equals(context1)).to.be.true

		expect(context1.equals(context3)).to.be.false
		expect(context1.equals(context4)).to.be.false
		expect(context1.equals(context5)).to.be.false
	})
	it("can eval conditions", () => {
		const context = new Context({
			true: true,
		})
		const condition = new Condition("true")
		expect(context.eval(condition)).to.be.true
	})
})
