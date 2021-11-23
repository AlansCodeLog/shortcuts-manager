import { unreachable } from "@utils/utils"

import { Key } from "./Key"


type KeysStringifierOptions = {
	key?: (key: Key) => string
	keys?: (key: string[]) => string
	chord?: (key: string[]) => string
	chain?: (key: string[]) => string
}

/**
 * Creates a keys stringifier that can be passed to most classes to specify how to stringify the shortcut chains, shortcut chords, lists of keys, or single keys.
 *
 * The default method `stringify` methods it provided assumes you are passing some part of a shortcut (chain, chord, or key) and calls the respective `stringifyChain`, `stringifyChord`, `stringifyKey` depending on the array depth.
 *
 * That method called then calls the other in a chain (e.g. if you pass a shortcut, it will call `stringifyChain` which will call `stringifyChord` and so on.)
 *
 * This is why most of the methods you can specify only take in `string[]`. `key` is the only exception. If you need something more complex you can always extend from the class and override methods.
 *
 * The default method uses a key's label and combines keys inside chords with `+` and the chords of shortcut chains with a space ` `.
 * ```
 * Key+Key Key+Key+Key
 * ^Chord^ ^Chord    ^
 * ^Chain            ^
 * ```
 *
 * `stringifyKeys` is for {@link Keys} which only describes a list of keys and not a chord. The default method returns a list of keys joined by a coma `, `.
 *
 * Ideally a single stringifier should be created and shared amongst all instances. This is already taken care of if you do not pass a custom stringifier, a default stringifier instance is re-used throughout.
 */
export class KeysStringifier {
	protected _key: KeysStringifierOptions["key"]
	protected _keys: KeysStringifierOptions["keys"]
	protected _shortcut: KeysStringifierOptions["chain"]
	protected _chord: KeysStringifierOptions["chord"]
	constructor(opts: KeysStringifierOptions = {}) {
		if (opts.key) this._key = opts.key
		if (opts.keys) this._keys = opts.keys
		if (opts.chord) this._chord = opts.chord
		if (opts.chain) this._shortcut = opts.chain
	}
	stringify(keyChordOrShorcut: Key | Key[] | Key[][]): string {
		if (keyChordOrShorcut instanceof Key) return this.stringifyKey(keyChordOrShorcut)
		if (Array.isArray(keyChordOrShorcut)) {
			if (keyChordOrShorcut.length === 0) return this.stringifyChord(keyChordOrShorcut as Key[])
			if (Array.isArray(keyChordOrShorcut[0])) return this.stringifyChain(keyChordOrShorcut as Key[][])
			return this.stringifyChord(keyChordOrShorcut as Key[])
		}
		unreachable()
	}
	stringifyKey(key: Key): string {
		if (this._key) return this._key(key)
		return key.label
	}
	stringifyChord(keys: Key[]): string {
		const stringified = keys.map(key => this.stringifyKey(key))
		if (this._chord) return this._chord(stringified)
		return stringified.join("+")
	}
	stringifyChain(shortcut: Key[][]): string {
		const stringified = shortcut.map(chord => this.stringifyChord(chord))
		if (this._shortcut) return this._shortcut(stringified)
		return stringified.join(" ")
	}
	stringifyKeys(chord: Key[]): string {
		const stringified = chord.map(key => this.stringifyKey(key))
		if (this._keys) return this._keys(stringified)
		return stringified.join(", ")
	}
}

export const defaultStringifier = new KeysStringifier()

