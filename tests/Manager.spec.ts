import { Commands, Context, Key, Keys, KeysSorter, KeysStringifier, Shortcuts } from "@/classes"
import { Manager } from "@/classes/Manager"
import { testName } from "@alanscodelog/utils"
import { expect } from "./chai"
import { k } from "./helpers.keys"

describe(testName(), () => {
	it("should override options of keys/commands/shortcuts", () => {
		const sorter = new KeysSorter()
		const stringifier = new KeysStringifier()
		const manager = new Manager(
			new Keys([], {
				stringifier: new KeysStringifier(/* ignored */),
			}),
			new Commands([]),
			new Shortcuts([], {
				stringifier: new KeysStringifier(/* ignored */),
				sorter: new KeysSorter(/* ignored */)
			}),
			new Context({}),
			() => true,
			{sorter, stringifier}
		)
		expect(manager.keys.stringifier).to.equal(stringifier)
		expect(manager.shortcuts.stringifier).to.equal(stringifier)
		expect(manager.shortcuts.sorter).to.equal(sorter)
	})
	describe("basic functions", () => {
		it("should correctly add/remove from chain state", () => {
			const manager = new Manager(
				new Keys([
					k.a,
					k.b,
					k.c,
					k.d,
					new Key("Capslock", {is: {toggle: true}}),
					new Key("Control", { is: { modifier: true }, variants: ["ControlLeft", "ControlRight"]})
				]),
				new Commands([]),
				new Shortcuts([], {
					stringifier: new KeysStringifier(/* ignored */),
					sorter: new KeysSorter(/* ignored */)
				}),
				new Context({}),
				() => true,
			)
		})
	})
})
