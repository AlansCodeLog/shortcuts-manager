import { describe, expect, it } from "vitest"

import { manager } from "./helpers.keys.js"

import { createCommand } from "../src/createCommand.js"
import { createCondition } from "../src/createCondition.js"
import { equalsCommand } from "../src/helpers/equalsCommand.js"
import type { Command } from "../src/types/index.js"


const execute = (..._args: Parameters<NonNullable<Command["execute"]>>): void => {}
it("creates a simple command", () => {
	expect(() => {
		createCommand("command")
	}).to.not.throw()
})
it("sets options", () => {
	const opts = {
		description: "command description",
		execute,
		condition: createCondition("allowed"),
	}
	const command = createCommand<typeof execute>("command", opts)
	expect(command.name).to.equal("command")
	expect(command.description).to.equal(opts.description)
	expect(command.condition).to.equal(opts.condition)
	expect(command.execute!({ isKeydown: true, command })).to.equal(undefined)
	expect(command.condition).to.equal(opts.condition)
})
describe("checks equality from", () => {
	it("name", () => {
		{
			const command1 = createCommand("command")
			const command2 = createCommand("command")
			expect(equalsCommand(command1, command2, manager)).to.equal(true)
		}
		{
			const command1 = createCommand("command")
			const command2 = createCommand("command2")
			expect(equalsCommand(command1, command2, manager)).to.equal(false)
		}
	})
	it("execute instance", () => {
		{
			const command1 = createCommand("command", { execute })
			const command2 = createCommand("command", { execute })
			expect(equalsCommand(command1, command2, manager)).to.equal(true)
		}
		{
			const command1 = createCommand("command", { execute: () => {} })
			const command2 = createCommand("command", { execute: () => {} })
			expect(equalsCommand(command1, command2, manager)).to.equal(false)
		}
	})
	it("description", () => {
		{
			const command1 = createCommand("command", { description: "description" })
			const command2 = createCommand("command", { description: "description" })
			expect(equalsCommand(command1, command2, manager)).to.equal(true)
		}
		{
			const command1 = createCommand("command", { description: "description" })
			const command2 = createCommand("command", { description: "description2" })
			expect(equalsCommand(command1, command2, manager)).to.equal(false)
		}
	})
	it("condition's equality (not by instance)", () => {
		{
			const command1 = createCommand("command", { condition: createCondition("allowed") })
			const command2 = createCommand("command", { condition: createCondition("allowed") })
			expect(equalsCommand(command1, command2, manager)).to.equal(true)
		}
		{
			const command1 = createCommand("command", { condition: createCondition("allowed") })
			const command2 = createCommand("command", { condition: createCondition("allowed2") })
			expect(equalsCommand(command1, command2, manager)).to.equal(false)
		}
	})
})
