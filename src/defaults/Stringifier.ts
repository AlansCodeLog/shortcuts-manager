import { castType } from "@alanscodelog/utils/castType.js"
import { crop } from "@alanscodelog/utils/crop.js"
import { dedupe } from "@alanscodelog/utils/dedupe.js"
import { isArray } from "@alanscodelog/utils/isArray.js"
import { isObject } from "@alanscodelog/utils/isObject.js"
import { pretty } from "@alanscodelog/utils/pretty.js"
import { unreachable } from "@alanscodelog/utils/unreachable.js"

import { getLabel } from "../helpers/getLabel.js"
import type { Command, Condition, DefaultStringifierOptions, IStringifier, Key, Manager, Shortcut } from "../types/index.js"


/**
 * The default class based implementation of the {@link IStringifier} interface.
 *
 * It can be passed (and a default instance is passed by default) to most functions to specify how to stringify items in errors.
 *
 * The default method `stringify` can be called with any key, chord, chain, shortcut, etc. and calls the respective {@link DefaultStringifierOptions} method depending on the type property or in the case of chains, chords, and keys, the array depth.
 *
 * That method called then calls any others it needs (e.g. if you pass a shortcut, it will call `stringifyShortcut` which will call `stringifyCommand`, `stringifyCondition`, and `stringifyChain`, which will call `stringifyChord` and so on)
 *
 * These can be customized by changing the options of the default instance (see Customizing below). These options are methods that describe in simpler term how items should be joined, without handling all the logic (the class pieces it all together)
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
 * If the condition or command are undefined:
 * 	- For command it will still say it's undefined.
 * 	- The condition is removed entirely if it's undefined.
 * ```
 * Shortcut Key+Key Key+Key+Key (command: undefined)
 * ```
 *
 * `stringifyLists` returns a lists joined by a comma and new line:
 *
 * ```
 * 	 item,
 * 	 item
 * ```
 *
 * ## Customizing
 * Ideally a single stringifier should be created and shared amongst all instances. This is already taken care of if you do not pass a custom stringifier, a default stringifier instance is re-used throughout. Unless you're implementing your own {@link IStringifier}, you should not need to pass the default one around.
 *
 * You can just import it early and change it's options.
 */
 
export class Stringifier implements IStringifier {
	constructor(public opts: DefaultStringifierOptions = {}) {
	}
	
	stringify(
		entry: string | string[] | string[][],
		manager: Pick<Manager, "keys">
	): string

	stringify(
		entry: Shortcut,
		manager: Pick<Manager, "keys" | "commands">
	): string

	stringify(
		entry: Key | Key[] | Command | Condition,
	): string

	stringify(
		entry: string | string[] | string[][] | Key | Key[] | Shortcut | Command | Condition,
		manager?: Pick<Manager, "keys" | "commands"> | Pick<Manager, "keys">

	): string {
		if (isObject(entry) && "type" in entry) {
			switch (entry.type) {
				case "key": return this.stringifyKey(entry)
				case "shortcut": return this.stringifyShortcut(entry, manager as any)
				case "command": return this.stringifyCommand(entry)
				case "condition": return this.stringifyCondition(entry)
			}
		} else {
			if (isArray(entry)) {
				if (entry.length === 0) return this.stringifyChord([] as any)
				// not getting correctly narrow :/
				if (!isArray(entry[0])) {
					castType<string[] | Key[]>(entry)
					return this.stringifyChord(entry as any, manager!)
				}
				castType<string[][] | Key[][]>(entry)
				return this.stringifyChain(entry as any, manager!)
			} else {
				return this.stringifyKey(entry, manager!)
			}
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


	protected stringifyShortcut(
		shortcut: Shortcut,
		{ keys, commands }: Pick<Manager, "keys" | "commands">
	): string {
		if (this.opts.shortcut) return this.opts.shortcut(shortcut)
		const command = `command: ${this.stringifyCommand(shortcut.command ? commands.entries[shortcut.command] : undefined)}`
		const chain = this.stringifyChain(shortcut.chain.map(chord => chord.map(id => keys.entries[id] ?? keys.toggles[id] ?? id)))
		const condition = this.stringifyCondition(shortcut.condition)
		return crop`Shortcut ${chain} (${command}${shortcut.condition ? `, ${condition}` : ""})`
	}

	protected stringifyCondition(condition?: Condition): string {
		if (this.opts.condition) return this.opts.condition(condition)
		return condition ? `condition: "${condition?.text}"` : `condition: undefined`
	}

	stringifyCommand(name: string, manager: Pick<Manager, "commands">): string

	stringifyCommand(command?: Command): string
 
	stringifyCommand(nameOrCommand?: string | Command | undefined, manager?: Pick<Manager, "commands">): string {
		const command = typeof nameOrCommand === "string"
			? manager!.commands.entries[nameOrCommand]
			: nameOrCommand

		if (this.opts.command) return this.opts.command(command)
		return command ? command.name : "(None)"
	}

	protected stringifyKey(key: Key): string
 
	protected stringifyKey(key: string, manager: Pick<Manager, "keys">): string
 
	protected stringifyKey(keyOrId: Key | string, manager?: Pick<Manager, "keys">): string {
		if (typeof keyOrId === "string") {
			const key = manager?.keys.entries[keyOrId] ?? manager?.keys.toggles[keyOrId]
			if (key) {
				if (this.opts.key) return this.opts.key(keyOrId, key)
				return getLabel(keyOrId, key)
			} else {
				if (this.opts.key) return this.opts.key(keyOrId)
				return keyOrId
			}
		} else {
			if (this.opts.key) return this.opts.key(keyOrId.id, keyOrId)
			return getLabel(keyOrId.id, keyOrId)
		}
	}

	protected stringifyChord(chord: Key[]): string

	protected stringifyChord(chord: string[], manager: Pick<Manager, "keys">): string

	protected stringifyChord(chord: Key[] | string[], manager?: Pick<Manager, "keys">): string {
		const stringified = dedupe(chord.map(key => this.stringifyKey(key satisfies string | Key as any, manager!)), { mutate: true })
		if (this.opts.chord) return this.opts.chord(stringified)
		return stringified.join("+")
	}

	protected stringifyChain(chain: Key[][]): string

	protected stringifyChain(chain: string[][], manager: Pick<Manager, "keys">): string

	protected stringifyChain(chain: Key[][] | string[][], manager?: Pick<Manager, "keys">): string {
		const stringified = chain.map(chord => this.stringifyChord(chord satisfies string[] | Key[] as any, manager!))

		if (this.opts.chain) return this.opts.chain(stringified)
		return stringified.join(" ")
	}

	stringifyList(type: "keys", entries: Key[]): string

	stringifyList(type: "commands", entries: Command[]): string

	stringifyList(type: "keys", entries: string[], manager: Pick<Manager, "keys">): string

	stringifyList(type: "commands", entries: string[], manager: Pick<Manager, "commands">): string

	stringifyList(type: "shortcuts", entries: Shortcut[], manager: Pick<Manager, "keys" | "commands">): string

	stringifyList(
		type: "keys" | "commands" | "shortcuts",
		entries: Key[] | Command[] | Shortcut[] | string[],
		manager?: Pick<Manager, "commands"> | Pick<Manager, "keys"> | Pick<Manager, "keys">
	): string {
		let stringified: string[]
		if (typeof entries[0] === "string") {
			stringified = (entries as string[]).map(entry => type === "keys"
			? this.stringify(entry, manager as any)
			: this.stringifyCommand(entry, manager as any)
			)
		} else {
			stringified = (entries as any[]).map(entry => this.stringify(entry, manager as any))
		}
		if (this.opts.list) return this.opts.list(stringified, type)
		return stringified.join(",\n")
	}
}

export const defaultStringifier = new Stringifier()

