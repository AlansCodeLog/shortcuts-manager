import { crop, testName } from "@alanscodelog/utils"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Key } from "shortcuts-manager/classes/Key.js"
import { Shortcut } from "shortcuts-manager/classes/Shortcut.js"
import { Shortcuts } from "shortcuts-manager/classes/Shortcuts.js"
import { defaultStringifier, Stringifier } from "shortcuts-manager/classes/Stringifier.js"


describe(testName(), () => {
	it("default methods works", () => {
		const keysList = [
			new Key("a"),
			new Key("b"),
			new Key("c"),
		]

		const shortcuts = new Shortcuts([new Shortcut([[keysList[0]]])])
		expect(defaultStringifier.stringify(shortcuts.entries[0].chain)).to.equal("a")
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

		/* eslint-disable @typescript-eslint/typedef */
		const stringifier = new Stringifier({
			key(key) {return `"${key.label}"`},
			keys(keys) {return keys.join("!")},
			chord(chord) {return chord.join("~")},
			chain(chain) {return chain.join("=")},
		})
		expect(stringifier.stringify(keysList[0])).to.equal(`"a"`)
		expect(stringifier.stringify(keysList)).to.equal(`"a"~"b"~"c"`)
		expect(stringifier.stringify([keysList, keysList])).to.equal(`"a"~"b"~"c"="a"~"b"~"c"`)
		expect(stringifier.stringifyKeys(keysList)).to.equal(crop`"a"!"b"!"c"`)
	})
})
