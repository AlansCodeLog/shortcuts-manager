// import { check_extends } from "./helpers.condition"
import { Condition, Context } from "@/classes"
import { testName } from "@alanscodelog/utils"
import { expect } from "./chai"



const context = new Context({
	true: true,
	false: false,
})

describe(testName(), () => {
	it("allows getting opts back", () => {
		const condition = new Condition("a")
		expect(Object.keys(condition.opts).length).to.be.greaterThan(0)
	})
	it("equals", () => {
		expect((new Condition("a")).equals((new Condition("a")))).to.equal(true)
		expect((new Condition("a")).equals((new Condition("b")))).to.equal(false)
		// plugins already checked in ./Plugable.spec.ts
	})
	it("custom equals", () => {
		const conditiona = new Condition("a", {equals: () => true})
		const conditionb = new Condition("b", {equals: () => false})
		expect(conditiona.equals(conditionb)).to.equal(true)
		expect(conditionb.equals(conditiona)).to.equal(false)
	})
	it("eval", () => {
		expect(new Condition("a").eval(context)).to.equal(true)
	})
	it("custom eval", () => {
		expect(new Condition("a", {eval: () => false}).eval(context)).to.equal(false)
	})
})
