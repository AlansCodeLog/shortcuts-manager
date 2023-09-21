import { testName } from "@alanscodelog/utils"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Condition } from "shortcuts-manager/classes/Condition.js"
import { Context } from "shortcuts-manager/classes/Context.js"


describe(testName(), () => {
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
	it("can eval conditions", () => {
		const context = new Context({
			anything: true, // no actual eval is happening
		})
		expect(context.eval(new Condition("a"))).to.equal(true)
		expect(context.eval(new Condition("b"))).to.equal(true)
	})
})
