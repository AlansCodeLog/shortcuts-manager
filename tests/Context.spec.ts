import { Condition, Context } from "@/classes"
import { testName } from "@alanscodelog/utils"
import { expect } from "./chai"



describe(testName(), () => {
	it("has no opts", () => {
		const context = new Context({})
		expect(context.opts).to.deep.equal({equals: undefined})
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
		expect(context1.equals(context2)).to.equal(true)
		expect(context2.equals(context1)).to.equal(true)

		expect(context1.equals(context3)).to.equal(false)
		expect(context1.equals(context4)).to.equal(false)
		expect(context1.equals(context5)).to.equal(false)
	})
	it("custom equals", () => {
		const contexta = new Context("a", { equals: () => true })
		const contextb = new Context("b", { equals: () => false })
		expect(contexta.equals(contextb)).to.equal(true)
		expect(contextb.equals(contexta)).to.equal(false)
	})
	it("can eval conditions", () => {
		const context = new Context({
			anything: true, // no actual eval is happening
		})
		expect(context.eval(new Condition("a"))).to.equal(true)
		expect(context.eval(new Condition("b"))).to.equal(true)
		expect(context.eval(new Condition("b", { eval: () => false }))).to.equal(false)
	})
	it("custom eval", () => {
		const context = new Context({
			anything: true,
		})
		expect(new Condition("a", { eval: () => false }).eval(context)).to.equal(false)
		expect(new Condition("a", { eval: () => true }).eval(context)).to.equal(true)
	})
})
