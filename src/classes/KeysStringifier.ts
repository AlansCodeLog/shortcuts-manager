import { unreachable } from "@utils/utils"
import { Key } from "./Key"

const sKey= Symbol ("key")
const sKeys = Symbol ("keys")
const sShortcut = Symbol ("shortcut")
const sChord = Symbol ("chord")

type KeysStringifierOptions = {
	key?:(key: string) => string
	keys?:(key: string[]) => string
	chord?:(key: string[]) => string
	chain?:(key: string[]) => string
}

/**
 * Creates a keys stringifier that can be passed to most classes to specify how to stringify the shortcut chains, shortcut chords, lists of keys, or single keys.
 *
 * The default method `stringify` methods it provided assumes you are passing some part of a shortcut (chain, chord, or key) and calls the respective `stringifyChain`, `stringifyChord`, `stringifyKey` depending on the array depth.
 *
 * That method called then calls the other in a chain (e.g. if you pass a shortcut, it will call `stringifyChain` which will call `stringifyChord` and so on.)
 *
 * This is why the methods you can specify only take in string/string[]. `key` also takes a string because `stringifyKey` will always call a key's `toString` method.
 *
 * The default methods combines keys inside chords with `+` and the chords of shortcut chains with a space ` `.
 * ```
 * Key+Key Key+Key+Key
 * ^Chord^ ^Chord    ^
 * ^Chain            ^
 * ```
 *
 * `stringifyKeys` is for {@link Keys} which only describes a list of keys and not a chord. The default method returns a list of keys joined by a coma `, `.
 *
 * Ideally a single stringifier should be created and shared amongst all instances.
 */
export class KeysStringifier {
	[sKey]: KeysStringifierOptions["key"]
	[sKeys]: KeysStringifierOptions["keys"]
	[sShortcut]: KeysStringifierOptions["chain"]
	[sChord]: KeysStringifierOptions["chord"]
	constructor(opts: KeysStringifierOptions = {}) {
		if (opts.key) this[sKey] = opts.key
		if (opts.keys) this[sKeys] = opts.keys
		if (opts.chord) this[sChord] = opts.chord
		if (opts.chain) this[sShortcut] = opts.chain
	}
	stringify(keyChordOrShorcut: Key | Key[] | Key[][]): string {
		if (keyChordOrShorcut instanceof Key) return this.stringifyKey(keyChordOrShorcut)
		if (Array.isArray(keyChordOrShorcut)) {
			if (keyChordOrShorcut.length == 0) return this.stringifyChord(keyChordOrShorcut as Key[])
			if (Array.isArray(keyChordOrShorcut[0])) return this.stringifyChain(keyChordOrShorcut as Key[][])
			return this.stringifyChord(keyChordOrShorcut as Key[])
		}
		unreachable()
	}
	stringifyKey(key: Key): string {
		if (this[sKey]) return this[sKey]!(key.toString())
		return key.label
	}
	stringifyChord(keys: Key[]): string {
		const stringified = keys.map(key => this.stringifyKey(key))
		if (this[sChord]) return this[sChord]!(stringified)
		return stringified.join("+")
	}
	stringifyChain(shortcut: Key[][]): string {
		const stringified = shortcut.map(chord => this.stringifyChord(chord))
		if (this[sShortcut]) return this[sShortcut]!(stringified)
		return stringified.join(" ")
	}
	stringifyKeys(chord: Key[]): string {
		const stringified = chord.map(key => this.stringifyKey(key))
		if (this[sKeys]) return this[sKeys]!(stringified)
		return stringified.join(", ")
	}
}

export const defaultStringifier = new KeysStringifier()

