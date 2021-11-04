import { Command, Condition } from "@/classes"
import { testName } from "@alanscodelog/utils"
import { expect } from "./chai"



describe(testName(), () => {
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
		const execute = (arg: string): string => arg
		const opts = {
			description: "command description",
			execute,
			condition: new Condition("allowed"),
		}
		const command = new Command<typeof execute>("command", opts)
		expect(command.name).to.equal("command")
		expect(command.description).to.equal(opts.description)
		expect(command.condition).to.equal(opts.condition)
		expect(command.execute("test")).to.equal("test")
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
				const execute = (arg: string) => arg
				const command1 = new Command("command", { execute })
				const command2 = new Command("command", { execute })
				expect(command1.equals(command2)).to.equal(true)
			}
			{
				const command1 = new Command("command", { execute: (arg: string) => arg })
				const command2 = new Command("command", { execute: (arg: string) => arg })
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
