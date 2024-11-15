import { catchError } from "@alanscodelog/utils"
import { afterEach, describe, expect, it, vi } from "vitest"

import { manager } from "./helpers.keys.js"

import { createKey } from "../src/createKey.js"
import { createKeys } from "../src/createKeys.js"
import { defaultStringifier, Stringifier } from "../src/defaults/Stringifier.js"
import { getLabel } from "../src/helpers/getLabel.js"
import { virtualPress } from "../src/helpers/virtualPress.js"
import { setKeyProp } from "../src/setKeyProp.js"
import { ERROR } from "../src/types/enums.js"
import { equalsKey } from "../src/utils/equalsKey.js"


it("should compare equality properly", () => {
	const key1 = createKey("a").unwrap()
	const key2 = createKey("b").unwrap()
	const keys = createKeys([key1, key2]).unwrap()
	expect(equalsKey("a", "a", keys)).to.be.true
	expect(equalsKey("a", "b", keys)).to.be.false
})

it("should compare equality properly with variants", () => {
	const key1 = createKey("variant1", { variants: ["a"]}).unwrap()
	const key2 = createKey("variant2", { variants: ["a"]}).unwrap()
	const keys = createKeys([key1, key2]).unwrap()
	expect(equalsKey(key1.id, key2.id, keys)).to.be.true
	expect(equalsKey(key2.id, key1.id, keys)).to.be.true
	expect(equalsKey(key1.id, key2.id, keys, { allowVariants: false })).to.be.false
	expect(equalsKey(key2.id, key1.id, keys, { allowVariants: false })).to.be.false
})
it("should create toggle key properly", () => {
	const key2 = createKey("b", { isToggle: false }).unwrap()
	expect(key2.toggleOnId).to.not.exist

	const key = createKey("a", { isToggle: "native" }).unwrap()
	const keys = createKeys([key, key2]).unwrap()
	const on = key.toggleOnId!
	const off = key.toggleOffId!


	expect(on).to.equal("aOn")
	expect(off).to.equal("aOff")
	expect(getLabel(on, key)).to.equal("a (On)")
	expect(getLabel(off, key)).to.equal("a (Off)")
	expect(defaultStringifier.stringify(on, { keys })).to.equal("a (On)")
	expect(defaultStringifier.stringify(off, { keys })).to.equal("a (Off)")

	expect(equalsKey(key.id, on, keys)).to.be.false
	expect(equalsKey(key.id, off, keys)).to.be.false
	expect(equalsKey(on, off, keys)).to.be.false

	expect(equalsKey(on, on, keys)).to.be.true
	expect(equalsKey(off, off, keys)).to.be.true
})
it("virtual press works", () => {
	const key = createKey("a").unwrap()
	const key1 = createKey("a1", { isToggle: "native" }).unwrap()
	const key2 = createKey("a2", { isToggle: "emulated" }).unwrap()
	const key3 = createKey("a3", { isModifier: "native" }).unwrap()
	const key4 = createKey("a4", { isModifier: "emulated" }).unwrap()
	const keysList = [key, key1, key2, key3, key4]
	const keys = createKeys(keysList, manager).unwrap()

	for (const k of keysList) {
		virtualPress({ ...manager, keys }, k.id!)
		expect(k.pressed).to.equal(true)
	}
	for (const k of [key, key3, key4]) {
		expect(k.toggleOnPressed).to.equal(undefined)
		expect(k.toggleOffPressed).to.equal(undefined)
	}
	for (const k of [key1, key2]) {
		expect(k.toggleOnPressed).to.equal(true)
		expect(k.toggleOffPressed).to.equal(false)
	}
})
it("stringify works", () => {
	const stringifier = new Stringifier({ key: _key => "Bla" })
	const key1 = createKey("a").unwrap()
	const key2 = createKey("a").unwrap()
	expect(defaultStringifier.stringify(key1)).to.equal("a")
	expect(stringifier.stringify(key2)).to.equal("Bla")
})
it("gaurds against invalid variant", () => {
	expect(catchError(() => {
		createKey("a", { variants: ["a"]}).unwrap()
	}).code).to.equal(ERROR.INVALID_VARIANT)
})
