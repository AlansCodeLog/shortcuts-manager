import { inspectError, testName } from "@alanscodelog/utils"
import { expect } from "chai"

import { Key } from "@/classes"


describe(testName(), () => {
	it("allows getting opts back", () => {
		const key = new Key("a")
		expect(Object.keys(key.opts).length).to.be.greaterThan(0)
	})

	it("should throw if info passed but no plugins", () => {
		expect(inspectError(() => {
			// @ts-expect-error we want the wrong overload to error
			const key = new Key("a", { }, { test: "test" })
		}, false)).to.throw()
	})
	it("should compare equality properly", () => {
		const key1 = new Key("a")
		const key2 = new Key("a")
		expect(key1.equals(key1)).to.be.true
		expect(key1.equals(key2)).to.be.true
		const key3 = new Key("b")
		expect(key1.equals(key3)).to.be.false
	})
	it("should create toggle key properly", () => {
		function label(key: Key): string {
			console.log(key.id)

			return `a ${key.id.endsWith("_on") ? "(On)" : key.id.endsWith("_off") ? "(Off)" : ""}`
		}
		const key2 = new Key("a", { is: { toggle: false } })
		expect(key2.on).to.not.exist
		const key = new Key("a", { is: { toggle: true }, label })
		const on = key.on!
		const off = key.off!


		expect(on).to.exist
		expect(on.id).to.equal("a_on")
		expect(on.label).to.equal("a (On)")
		expect(off.label).to.equal("a (Off)")
		expect(on.toString()).to.equal("a (On)")
		expect(key === on).to.be.false
		expect(key.on === on).to.be.true
		expect(key.equals(on)).to.be.false
		expect(off.equals(on)).to.be.false
		expect(on.equals(on)).to.be.true
		expect(key.equals(on.root)).to.be.true
		expect(on.root.equals(key)).to.be.true

		const props = []
		// eslint-disable-next-line guard-for-in
		for (const prop in on) {
			props.push(prop)
		}

		expect(props.find(prop => ["on", "off"].includes(prop))).to.be.undefined
		expect(props.find(prop => ["root"].includes(prop))).to.be.undefined

		expect("on" in on).to.equal(false)
		expect("off" in on).to.equal(false)
		expect("root" in on).to.equal(true)
		expect("root" in key).to.equal(false)
		// Methods and getters behave the same
		expect("equals" in on).to.equals("equals" in key)
		expect("string" in on).to.equals("string" in key)

		expect(Object.keys(on).includes("on")).to.be.false
		expect(Object.keys(on).includes("off")).to.be.false
		expect(Object.keys(on).includes("root")).to.be.false
		expect(Object.keys(on).includes("equals")).to.equal(Object.keys(key).includes("equals"))
		expect(Object.keys(on).includes("string")).to.equal(Object.keys(key).includes("string"))

		/* eslint-disable no-prototype-builtins */
		expect(key.hasOwnProperty("on")).to.be.true
		expect(key.hasOwnProperty("off")).to.be.true
		expect(key.hasOwnProperty("root")).to.be.false
		expect(on.hasOwnProperty("on")).to.be.false
		expect(on.hasOwnProperty("off")).to.be.false
		expect(on.hasOwnProperty("root")).to.be.true
		expect(on.hasOwnProperty("equals")).to.equal(key.hasOwnProperty("equals"))
		expect(on.hasOwnProperty("string")).to.equal(key.hasOwnProperty("string"))
		expect(key.on!.on).to.equal(undefined)
		expect(key.on!.off).to.equal(undefined)
	})
	it("should create advanced toggles properly", () => {
		{
			const key = new Key("a", {
				is: { toggle: true },
			})
			expect(key.is.toggle).to.equal("native")
		}
		{
			const key = new Key("a", {
				is: { toggle: "native" },
			})
			expect(key.is.toggle).to.equal("native")
		}
	})
	it("toggles should have suffixes", () => {
		const key = new Key("a", { is: { toggle: true } })
		expect(key.id).to.equal("a")
		expect(key.on!.id).to.equal("aOn")
		expect(key.off!.id).to.equal("aOff")
	})
	// it("parser should correctly stringify", () => {
	// 	const key = new Key("doesn't matter")
	// 	const parser = key.parser
	// 	expect(parser.stringify.any(k.a)).to.equal("a")
	// 	expect(parser.stringify.any([k.a])).to.equal("a")
	// 	expect(parser.stringify.any([k.modA, k.a])).to.equal("modA+a")
	// 	expect(parser.stringify.any([[k.modA, k.a]])).to.equal("modA+a")
	// 	expect(parser.stringify.any([[k.modA, k.a]])).to.equal("modA+a")
	// 	expect(parser.stringify.any([[k.modA, k.a], [k.a]])).to.equal("modA+a a")
	// 	expect(parser.stringify.any([[k.modA, k.a, k.toggle1], [k.toggle1.on!], [k.toggle1.off!]])).to.equal("modA+a+toggle1 toggle1_on toggle1_off")
	// })
})
