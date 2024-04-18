import { crop } from "@alanscodelog/utils"
import { afterEach, describe, expect, it, vi } from "vitest"

import { manager } from "./helpers.keys.js"

import { createKey } from "../src/createKey.js"
import { createKeys } from "../src/createKeys.js"
import { createShortcut } from "../src/createShortcut.js"
import { createShortcuts } from "../src/createShortcuts.js"
import { defaultStringifier, Stringifier } from "../src/defaults/Stringifier.js"
import type { Key } from "../src/types/index.js"


const keys = createKeys([
	createKey("a").unwrap(),
	createKey("b").unwrap(),
	createKey("c").unwrap(),
]).unwrap()
const keysList = Object.values(keys.entries).map(_ => _.id)
const s = createShortcut({ chain: [[keys.entries.a.id]]}, { ...manager, keys }).unwrap()
const shortcuts = createShortcuts([s], { ...manager, keys }).unwrap()

const m = { ...manager, keys, shortcuts }
it("default methods works", () => {
	expect(defaultStringifier.stringify(shortcuts.entries[0].chain, { keys })).to.equal("a")
	expect(defaultStringifier.stringify(keys.entries.a)).to.equal("a")
	expect(defaultStringifier.stringify(keysList, m)).to.equal("a+b+c")
	expect(defaultStringifier.stringify([keysList, keysList], m)).to.equal("a+b+c a+b+c")
	expect(defaultStringifier.stringifyList("keys", keysList, m)).to.equal(
		crop`
		a,
		b,
		c
		`
	)
})
it("custom methods work", () => {
	const stringifier = new Stringifier({
		key(id, key) {
			return `"${key?.label ?? id}"`
		},
		list(ks) {return ks.join("!")},
		chord(chord) {return chord.join("~")},
		chain(chain) {return chain.join("=")},
	})
	expect(stringifier.stringify(keys.entries.a.id, m)).to.equal(`"a"`)
	expect(stringifier.stringify(keysList, m)).to.equal(`"a"~"b"~"c"`)
	expect(stringifier.stringify([keysList, keysList], m)).to.equal(`"a"~"b"~"c"="a"~"b"~"c"`)
	expect(stringifier.stringifyList("keys", keysList, m)).to.equal(crop`"a"!"b"!"c"`)
})
