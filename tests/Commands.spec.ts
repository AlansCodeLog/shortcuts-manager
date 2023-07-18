import { inspectError, testName } from "@alanscodelog/utils"
import { Command } from "classes/Command.js"
import { Commands } from "classes/Commands.js"
import { describe, expect, it, type Mock, vi } from "vitest"


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
			commands.allows("add", new Command("a")).unwrap()
		}, false)).to.throw()
	})
	it("error on changing command name to a name that would conflict", () => {
		const a = new Command("a")
		const b = new Command("b")
		new Commands([
			a,
			b,
		])
		expect(inspectError(() => {
			b.allows("name", "a").unwrap()
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

		// @ts-expect-error typescript doesn't understand this without retyping b
		expect(commands.entries.c).to.equal(b)
		expect(commands.entries.b).to.not.exist
	})
})
