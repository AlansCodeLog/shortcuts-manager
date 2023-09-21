import { testName } from "@alanscodelog/utils"
import { describe, expect, it } from "vitest"

import { Command } from "shortcuts-manager/classes/Command.js"
import { Condition } from "shortcuts-manager/classes/Condition.js"
import type { CommandOptions } from "shortcuts-manager/types/command.js"


describe(testName(), () => {
	const execute = (..._args: Parameters<NonNullable<CommandOptions["execute"]>>): void => {}
	it("creates a simple command", () => {
		expect(() => {
			new Command("command")
		}).to.not.throw()
	})
	it("allows getting opts back", () => {
		const command = new Command("a")
		expect(Object.keys(command.opts).length).to.be.greaterThan(0)
	})
	it("sets options", () => {
		const opts = {
			description: "command description",
			execute,
			condition: new Condition("allowed"),
		}
		const command = new Command<typeof execute>("command", opts)
		expect(command.name).to.equal("command")
		expect(command.description).to.equal(opts.description)
		expect(command.condition).to.equal(opts.condition)
		expect(command.execute!({ isKeydown: true, command })).to.equal(undefined)
		expect(command.condition).to.equal(opts.condition)
	})
	describe("checks equality from", () => {
		it("name", () => {
			{
				const command1 = new Command("command")
				const command2 = new Command("command")
				expect(command1.equals(command2)).to.equal(true)
			}
			{
				const command1 = new Command("command")
				const command2 = new Command("command2")
				expect(command1.equals(command2)).to.equal(false)
			}
		})
		it("execute instance", () => {
			{
				const command1 = new Command("command", { execute })
				const command2 = new Command("command", { execute })
				expect(command1.equals(command2)).to.equal(true)
			}
			{
				const command1 = new Command("command", { execute: () => {} })
				const command2 = new Command("command", { execute: () => {} })
				expect(command1.equals(command2)).to.equal(false)
			}
		})
		it("description", () => {
			{
				const command1 = new Command("command", { description: "description" })
				const command2 = new Command("command", { description: "description" })
				expect(command1.equals(command2)).to.equal(true)
			}
			{
				const command1 = new Command("command", { description: "description" })
				const command2 = new Command("command", { description: "description2" })
				expect(command1.equals(command2)).to.equal(false)
			}
		})
		it("condition's equality (not by instance)", () => {
			{
				const command1 = new Command("command", { condition: new Condition("allowed") })
				const command2 = new Command("command", { condition: new Condition("allowed") })
				expect(command1.equals(command2)).to.equal(true)
			}
			{
				const command1 = new Command("command", { condition: new Condition("allowed") })
				const command2 = new Command("command", { condition: new Condition("allowed2") })
				expect(command1.equals(command2)).to.equal(false)
			}
		})
	})
})
