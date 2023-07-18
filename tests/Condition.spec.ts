// import { check_extends } from "./helpers.condition"
import { testName } from "@alanscodelog/utils"
import { Condition } from "classes/Condition.js"
import { Context } from "classes/Context.js"
import { afterEach, describe, expect, it, vi } from "vitest"


const context = new Context({
	true: true,
	false: false,
})

describe(testName(), () => {
	it("equals", () => {
		expect((new Condition("a")).equals((new Condition("a")))).to.equal(true)
		expect((new Condition("a")).equals((new Condition("b")))).to.equal(false)
		// plugins already checked in ./Plugable.spec.ts
	})
	it("eval", () => {
		expect(new Condition("a").eval(context)).to.equal(true)
	})
})
