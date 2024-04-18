// import { check_extends } from "./helpers.condition"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createCondition } from "../src/createCondition.js"
import { defaultConditionEquals } from "../src/defaults/defaultConditionEquals.js"
import { equalsContext } from "../src/helpers/equalsContext.js"


it("equals", () => {
	expect(defaultConditionEquals(createCondition("a"), createCondition("a"))).to.equal(true)
	expect(defaultConditionEquals(createCondition("a"), createCondition("b"))).to.equal(false)
})
it.todo("manager can calls evaluateCondition", () => {
// const context = createContext({
// 	true: true,
// 	false: false,
// })

})
