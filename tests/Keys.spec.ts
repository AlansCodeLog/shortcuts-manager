import { catchError } from "@alanscodelog/utils"
import { describe, expect, it, vi } from "vitest"

import { manager } from "./helpers.keys.js"

import { addKey } from "../src/addKey.js"
import { createKey } from "../src/createKey.js"
import { createKeys } from "../src/createKeys.js"
import { ERROR, type Key } from "../src/types/index.js"


it("should add keys", () => {
	const keys = createKeys([
		createKey("a").unwrap(),
		createKey("b").unwrap(),
	], manager).unwrap()
	expect(keys.entries.a).to.exist
	expect(keys.entries.b).to.exist
	const keys2 = createKeys([
		createKey("a").unwrap(),
	]).unwrap()

	addKey(createKey("b").unwrap(), { ...manager, keys })
	addKey(createKey("b").unwrap(), { ...manager, keys: keys2 })

	expect(keys.entries.a).to.exist
	expect(keys.entries.b).to.exist
})
it("should throw on duplicate keys", () => {
	expect(catchError(() => {
		createKeys([
			createKey("a").unwrap(),
			createKey("a").unwrap(),
		]).unwrap()
	}).code).to.equal(ERROR.DUPLICATE_KEY)
	expect(catchError(() => {
		const keys = createKeys([
			createKey("a").unwrap(),
		]).unwrap()
		addKey(createKey("a").unwrap(), { ...manager, keys }).unwrap()
	}).code).to.equal(ERROR.DUPLICATE_KEY)
})
it("should not throw on \"duplicate\" keys with different ids", () => {
	expect(() => {
		createKeys([
			createKey("a1", { variants: ["a"]}).unwrap(),
			createKey("a2", { variants: ["a"]}).unwrap(),
		]).unwrap()
	}).to.not.throw()
})
it("should throw on invalid variant pairs", () => {
	expect(() => {
		createKeys([
			createKey("a1", { variants: ["a"], isModifier: "native" }).unwrap(),
			createKey("a2", { variants: ["a"]}).unwrap(),
		]).unwrap()
	}).to.throw()
	expect(() => {
		createKeys([
			createKey("a1", { variants: ["a"], isToggle: "native" }).unwrap(),
			createKey("a2", { variants: ["a"]}).unwrap(),
		]).unwrap()
	}).to.throw()
})
	
it("should not throw on compatible variant pairs", () => {
	expect(() => {
		createKeys([
			createKey("a1", { variants: ["a"], isModifier: "native" }).unwrap(),
			createKey("a2", { variants: ["a"], isModifier: "emulated" }).unwrap(),
		]).unwrap()
	}).to.not.throw()
	expect(() => {
		createKeys([
			createKey("a1", { variants: ["a"], isToggle: "native" }).unwrap(),
			createKey("a2", { variants: ["a"], isToggle: "emulated" }).unwrap(),
		]).unwrap()
	}).to.not.throw()
})
	
