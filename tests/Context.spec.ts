import { afterEach, describe, expect, it, vi } from "vitest"

import { createCondition } from "../src/createCondition.js"
import { createContext } from "../src/createContext.js"
import { equalsContext } from "../src/helpers/equalsContext.js"


it("equals works", () => {
	const context1 = createContext({
		a: true,
		b: true,
	})

	const context2 = createContext({
		a: true,
		b: true,
	})
	const context3 = createContext({
		a: true,
	})
	const context4 = createContext({
		c: true,
	})
	const context5 = createContext({
		a: true,
		c: true,
	})
	expect(equalsContext(context1, context2)).to.equal(true)
	expect(equalsContext(context2, context1)).to.equal(true)
	expect(equalsContext(context1, context3)).to.equal(false)
	expect(equalsContext(context1, context4)).to.equal(false)
})
