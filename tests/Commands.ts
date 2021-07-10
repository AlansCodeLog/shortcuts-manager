import { inspectError, testName } from "@alanscodelog/utils"
import { expect } from "chai"

import { Command, Commands } from "@/classes"


describe(testName(), () => {
	it("adds commands", () => {
		const commands = new Commands([
			new Command("a"),
			new Command("b"),
		])
		expect(commands.entries.a).to.exist
		expect(commands.entries.b).to.exist
		const commands2 = new Commands([
			new Command("a"),
		])
		commands2.add(new Command("b"))

		expect(commands.entries.a).to.exist
		expect(commands.entries.b).to.exist
	})
	it("throws on duplicate commands", () => {
		expect(inspectError(() => {
			new Commands([
				new Command("a"),
				new Command("a"),
			])
		}, false)).to.throw()
		expect(inspectError(() => {
			const commands = new Commands([
				new Command("a"),
			])
			commands.add(new Command("a"))
		}, false)).to.throw()
	})
	it("throws on changing command name to a name that would conflict", () => {
		const a = new Command("a")
		const b = new Command("b")
		new Commands([
			a,
			b,
		])
		expect(inspectError(() => {
			b.set("name", "a")
		})).to.throw()
	})
	it("allows changing command name to a name that doesn't create a conflict", () => {
		const a = new Command("a")
		const b = new Command("b")
		const commands = new Commands([
			a,
			b,
		])
		expect(inspectError(() => {
			b.set("name", "c")
		})).to.not.throw()
		expect(b.name).to.equal("c")
		// @ts-expect-error todo create helper for typescript to understand this.
		expect(commands.entries.c).to.equal(b)
		expect(commands.entries.b).to.not.exist
	})
})
