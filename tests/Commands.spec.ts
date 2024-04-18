import { inspectError } from "@alanscodelog/utils"
import { describe, expect, it, type Mock, vi } from "vitest"

import { manager } from "./helpers.keys.js"

import { addCommand } from "../src/addCommand.js"
import { createCommand } from "../src/createCommand.js"
import { createCommands } from "../src/createCommands.js"
import { setCommandProp } from "../src/setCommandProp.js"


it("adds commands", () => {
	const commands = createCommands([
		createCommand("a"),
		createCommand("b"),
	]).unwrap()
	expect(commands.entries.a).to.exist
	expect(commands.entries.b).to.exist
	const commands2 = createCommands([
		createCommand("a"),
	]).unwrap()
	addCommand(createCommand("b"), { ...manager, commands: commands2 }).unwrap()

	expect(commands2.entries.a).to.exist
	expect(commands2.entries.b).to.exist
})
it("throws on duplicate commands", () => {
	expect(inspectError(() => {
		createCommands([
			createCommand("a"),
			createCommand("a"),
		]).unwrap()
	}, false)).to.throw()
	expect(inspectError(() => {
		const commands = createCommands([
			createCommand("a"),
		]).unwrap()
		addCommand(createCommand("a"), { ...manager, commands }).unwrap()
	}, false)).to.throw()
})

