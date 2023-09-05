import { crop, dedupe, pretty, unreachable } from "@alanscodelog/utils"

import { type Command } from "./Command.js"
import { Condition } from "./Condition.js"
import { type Key } from "./Key.js"
import { type Shortcut } from "./Shortcut.js"


type StringifierOptions = {
	key?: (key: Key) => string
	keys?: (key: readonly string[]) => string
	chord?: (key: readonly string[]) => string
	chain?: (key: readonly string[]) => string
	shortcut?: (shortcut: Shortcut) => string
	command?: (command?: Command) => string
	condition?: (condition?: Condition) => string
	propertyValue?: (propertyValue?: any) => string
}

/**
 * Creates a stringifier that can be passed to most classes to specify how to stringify the shortcuts, commands, key chains, key chords, lists of keys, or single keys.
 *
 * The default method `stringify` methods it provided assumes you are passing some part of a `Shortcut`, `Command`, or `Key` and calls the respective `stringify*` method depending on the instance type or in the case of chains, chords, and keys, the array depth.
 *
 * That method called then calls any others it needs (e.g. if you pass a shortcut, it will call `stringifyShortcut` which will call `stringifyCommand`, `stringifyCondition`, and `stringifyChain`, which will call `stringifyChord` and so on)
 *
 * This is why the key related methods take in `string[]`. If you need something more complex you can always extend from the class and override methods.
 *
 * For chains the default method uses a key's label and combines keys inside chords with `+` and the chords of shortcut chains with a space ` `.
 * ```
 * Key+Key Key+Key+Key
 * ^Chord^ ^Chord    ^
 * ^Chain            ^
 * ```
 *
 * For shortcuts, the default is:
 * ```
 * Shortcut Key+Key Key+Key+Key (command: command_name, condition: condition_text)
 * ```
 * If the condition or command are undefined: (for command it will still say it's undefined, the condition on the other hand is removed entirely)
 * ```
 * Shortcut Key+Key Key+Key+Key (command: undefined)
 * ```
 *
 * `stringifyKeys` is for {@link Keys} which only describes a list of keys and not a chord. The default method returns a list of keys joined by a coma `, `. Can only be called directly.
 * `stringifyPropertyValues` is for stringifying the property values of instances when there is an error (e.g. "You cannot change prop x from a to b because of y." a and b here being the property values) and can only be called directly (`stringify` will not auto call it).
 *
 *
 * Ideally a single stringifier should be created and shared amongst all instances. This is already taken care of if you do not pass a custom stringifier, a default stringifier instance is re-used throughout.
 */
export class Stringifier {
	protected _key: StringifierOptions["key"]

	protected _keys: StringifierOptions["keys"]

	protected _chain: StringifierOptions["chain"]

	protected _chord: StringifierOptions["chord"]

	protected _shortcut: StringifierOptions["shortcut"]

	protected _command: StringifierOptions["command"]

	protected _condition: StringifierOptions["condition"]

	protected _propertyValue: StringifierOptions["propertyValue"]

	constructor(opts: StringifierOptions = {}) {
		if (opts.key) this._key = opts.key
		if (opts.keys) this._keys = opts.keys
		if (opts.chord) this._chord = opts.chord
		if (opts.chain) this._chain = opts.chain
		if (opts.shortcut) this._shortcut = opts.shortcut
		if (opts.command) this._command = opts.command
		if (opts.condition) this._condition = opts.condition
		if (opts.propertyValue) this._propertyValue = opts.propertyValue
	}

	stringify(entry: Key | Key[] | Key[][] | Shortcut | Command | Key): string {
		// todo fix this abomination
		// @ts-expect-error .
		if (entry._class === "Command") return this.stringifyCommand(entry as Command)
		// @ts-expect-error .
		if (entry._class === "Shortcut") return this.stringifyShortcut(entry as Shortcut)
		if (entry instanceof Condition) return this.stringifyCondition(entry)
		// @ts-expect-error .
		if (entry._class === "Key") return this.stringifyKey(entry as Key)
		if (Array.isArray(entry)) {
			if (entry.length === 0) return this.stringifyChord([] as Key[])
			if (Array.isArray(entry[0])) return this.stringifyChain(entry as Key[][])
			return this.stringifyChord(entry as Key[])
		}
		unreachable()
	}

	stringifyPropertyValue(entry: any): string {
		let res = ""
		try {
			res = this.stringify(entry)
			return res
		} catch (e) {
			// ignore
		}
		const type = typeof entry
		switch (type) {
			case "string": return entry
			case "number":
			case "boolean":
				return `${entry}`
			case "function":
				return `function "${entry.constructor.name}"`
			case "object":
				return pretty(entry)
			default:
				return entry.toString()
		}
	}

	stringifyShortcut(shortcut: Shortcut): string {
		if (this._shortcut) return this._shortcut(shortcut)
		const command = this.stringifyCommand(shortcut.command)
		const chain = this.stringifyChain(shortcut.chain)
		const condition = this.stringifyCondition(shortcut.condition)
		return crop`Shortcut ${chain} (${command}${shortcut.condition ? `, ${condition}` : ""})`
	}

	stringifyCondition(condition?: Condition): string {
		if (this._condition) return this._condition(condition)
		return condition ? `condition: "${condition?.text}"` : `condition: undefined`
	}

	stringifyCommand(command?: Command): string {
		if (this._command) return this._command(command)
		return command ? `command: "${command?.name}"` : `command: undefined`
	}

	stringifyKey(key: Key): string {
		if (this._key) return this._key(key)
		return key.label ?? key.id
	}

	stringifyChord(keys: Key[]): string {
		const stringified = dedupe(keys.map(key => this.stringifyKey(key)), { mutate: true })
		if (this._chord) return this._chord(stringified)
		return stringified.join("+")
	}

	stringifyChain(chain: Key[][]): string {
		const stringified = chain.map(chord => this.stringifyChord(chord))
		if (this._chain) return this._chain(stringified)
		return stringified.join(" ")
	}

	stringifyKeys(chord: Key[]): string {
		const stringified = chord.map(key => this.stringifyKey(key))
		if (this._keys) return this._keys(stringified)
		return stringified.join(", ")
	}
}

export const defaultStringifier = new Stringifier()

