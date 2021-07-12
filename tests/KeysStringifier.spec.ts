import { Key } from "@/classes"
import { defaultStringifier, KeysStringifier } from "@/classes/KeysStringifier"
import { crop, testName } from "@alanscodelog/utils"
import { expect } from "./chai"


describe(testName(), () => {
	it("default methods works", () => {
		const keysList = [
			new Key("a"),
			new Key("b"),
			new Key("c"),
		]
		expect(defaultStringifier.stringify(keysList[0])).to.equal("a")
		expect(defaultStringifier.stringify(keysList)).to.equal("a+b+c")
		expect(defaultStringifier.stringify([keysList, keysList])).to.equal("a+b+c a+b+c")
		expect(defaultStringifier.stringifyKeys(keysList)).to.equal(crop`a, b, c`)
	})
	it("custom methods work", () => {
		const keysList = [
			new Key("a"),
			new Key("b"),
			new Key("c"),
		]

		const stringifier = new KeysStringifier({
			key(key) {return `"${key}"`},
			keys(keys) {return keys.join("!")},
			chord(chord) {return chord.join("~")},
			chain(chain) {return chain.join("=")}
		})
		expect(stringifier.stringify(keysList[0])).to.equal(`"a"`)
		expect(stringifier.stringify(keysList)).to.equal(`"a"~"b"~"c"`)
		expect(stringifier.stringify([keysList, keysList])).to.equal(`"a"~"b"~"c"="a"~"b"~"c"`)
		expect(stringifier.stringifyKeys(keysList)).to.equal(crop`"a"!"b"!"c"`)
	})


})
