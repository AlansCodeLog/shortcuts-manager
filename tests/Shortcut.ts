import { inspectError, testName } from "@alanscodelog/utils"
import { expect } from "chai"

import { k, properOrder, reverseOrder } from "./helpers.keys"

import { Command, Condition, Shortcut } from "@/classes"
import { defaultSorter } from "@/classes/KeysSorter"


describe(testName(), () => {
	it("allows getting opts back", () => {
		const shortcut = new Shortcut([[k.a]])
		expect(Object.keys(shortcut.opts).length).to.be.greaterThan(0)
	})

	it("should throw if info passed but no plugins", () => {
		expect(inspectError(() => {
			// @ts-expect-error we want the wrong overload to error
			new Shortcut("A", { }, { test: "test" })
		}, false)).to.throw()
	})
	it("should throw if duplicate keys in chords", () => {
		expect(inspectError(() => {
			new Shortcut([[k.a, k.a]])
		}, false)).to.throw()
	})
	it("should not throw if duplicate keys in different chords", () => {
		expect(inspectError(() => {
			new Shortcut([[k.a], [k.a]])
		}, false)).to.not.throw()
	})
	it("should throw if duplicate mouse buttons", () => {
		expect(inspectError(() => {
			new Shortcut([[k.modMouse1, k.mouse1]])
		}, false)).to.throw()
	})
	it("should throw if duplicate toggle - even different states", () => {
		expect(inspectError(() => {
			new Shortcut([[k.toggle1, k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1, k.toggle1.off!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.on!, k.toggle1.off!]])
		}, false)).to.throw()
	})
	it("should assign keys properly", () => {
		const shortcut2 = new Shortcut([[k.a]])
		expect(shortcut2.keys).to.deep.equal([[k.a]])
	})
	it("should compare equality properly", () => {
		const shortcutA1 = new Shortcut([[k.a]])
		const shortcutA2 = new Shortcut([[k.a]])
		const shortcutA3 = new Shortcut([[k.b]])

		const shortcutB1 = new Shortcut([[k.modA, k.a], [k.a]])
		const shortcutB2 = new Shortcut([[k.modA, k.a], [k.a]])
		const shortcutB3 = new Shortcut([[k.modA, k.a], [k.b]])
		const shortcutB4 = new Shortcut([[k.a], [k.modA, k.a]])

		// Against themselves
		expect(shortcutA1.equals(shortcutA1)).to.be.true
		expect(shortcutB1.equals(shortcutB1)).to.be.true
		// Against other instances
		expect(shortcutA1.equals(shortcutA2)).to.be.true
		expect(shortcutB1.equals(shortcutB2)).to.be.true

		// False
		expect(shortcutA1.equals(shortcutA3)).to.be.false
		expect(shortcutB1.equals(shortcutB3)).to.be.false
		expect(shortcutB1.equals(shortcutB4)).to.be.false
	})
	it("should guard against impossible toggle shortcut", () => {
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.off!], [k.toggle1.off!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.on!], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.a], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.on!, k.explicitToggle.off!], [k.toggle1, k.explicitToggle.off!], [k.toggle1.on!]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.toggle1.on!], [k.toggle1], [k.toggle1.on!]])
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.off!], [k.toggle1.on!]])
			// Still a terrible idea but i guess it could work
			new Shortcut([[k.toggle1], [k.toggle1.on!], [k.toggle1.off!]])
			new Shortcut([[k.toggle1], [k.toggle1.off!], [k.toggle1.on!]])
		}, false)).to.not.throw()
	})
	it("should throw if chord only contains modifiers and it's not the last chord", () => {
		expect(inspectError(() => {
			new Shortcut([[k.modA], [k.modB]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.a], [k.modA]])
			new Shortcut([[k.a], [k.modA, k.modB]])
			new Shortcut([[k.a], [k.modA, k.a], [k.modA]])
		}, false)).to.not.throw()
	})
	it("should throw when shortcut contain more than one normal key in a chord", () => {
		expect(inspectError(() => {
			new Shortcut([[k.a, k.b]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.c], [k.a, k.b]])
		}, false)).to.throw()
	})
	it("should throw when shortcut contain more than one wheel key in a chord", () => {
		expect(inspectError(() => {
			new Shortcut([[k.wheelDown, k.wheelUp]])
		}, false)).to.throw()
		expect(inspectError(() => {
			new Shortcut([[k.wheelDown], [k.wheelUp]])
		}, false)).to.not.throw()
	})
	it("should sort keys properly", () => {
		/**
		 * Tests the actual default sort function because if we tested this with an actual shortcut we wouldn't be able to feed it all the keys (since it would throw errors because of the duplicate keys).
		 */

		const keys = [...reverseOrder]

		const sorted = keys.sort(defaultSorter.sort)
		expect(sorted).to.deep.equal(properOrder)
	})
	describe("should handle it's condition and command's condition properly", () => {
		describe("should throw", () => {
			it("using a condition that is not a subcondition of the command", () => {
				expect(inspectError(() => {
					new Shortcut([[]], {
						command: new Command("command", { condition: new Condition("a") }),
						condition: new Condition("b"),
					})
				}, false)).to.throw()
			})
			it("trying to change to a condition that is not a subcondition of the command", () => {
				const shortcut = new Shortcut([[]], {
					command: new Command("command", { condition: new Condition("a") }),
				})
				expect(inspectError(() => {
					shortcut.set("condition", new Condition("b"))
				}, false)).to.throw()
			})
			it("trying to change to the command's condition to a narrower one", () => {
				const command = new Command("command", { condition: new Condition("a") })
				new Shortcut([[]], {
					condition: new Condition("a"),
					command,
				})
				expect(inspectError(() => {
					command.set("condition", new Condition("b"))
				}, false)).to.throw()
			})
		})
		describe("should not throw ", () => {
			it("condition is subcondition of command", () => {
				expect(inspectError(() => {
					new Shortcut([[]], {
						command: new Command("command", { condition: new Condition("a") }),
						condition: new Condition("a"),
					})
				}, false)).to.not.throw()
			})

			it("trying to change condition to subcondition of command", () => {
				const shortcut = new Shortcut([[]], {
					command: new Command("command", { condition: new Condition("a") }),
				})
				expect(inspectError(() => {
					shortcut.set("condition", new Condition("a"))
				}, false)).to.not.throw()
			})
			it("trying to change command to a wider condition", () => {
				const command = new Command("command", { condition: new Condition("b") })
				new Shortcut([[]], {
					command,
					condition: new Condition("b"),
				})
				expect(inspectError(() => {
					command.set("condition", new Condition("c || b"))
				}, false)).to.not.throw()
			})
			it("condition is blank but command has condition", () => {
				expect(inspectError(() => {
					new Shortcut([[]], {
						command: new Command("command", { condition: new Condition("a") }),
						condition: new Condition(""),
					})
				}, false)).to.not.throw()
			})
			it("command condition is blank but had condition", () => {
				expect(inspectError(() => {
					new Shortcut([[]], {
						command: new Command("command", { condition: new Condition("") }),
						condition: new Condition("a"),
					})
				}, false)).to.not.throw()
			})
			it("trying to change to condition that is blank but command has condition", () => {
				const condition = new Condition("a")
				expect(inspectError(() => {
					const shortcut = new Shortcut([[]], {
						command: new Command("command", { condition: new Condition("a") }),
						condition,
					})
					shortcut.set("condition", new Condition(""))
				}, false)).to.not.throw()
			})
			it("trying to change to condition that  command condition is blank but had condition", () => {
				const command = new Command("command", { condition: new Condition("a") })
				expect(inspectError(() => {
					new Shortcut([[]], {
						command,
						condition: new Condition("a"),
					})
					command.set("condition", new Condition(""))
				}, false)).to.not.throw()
			})
		})
	})
})
