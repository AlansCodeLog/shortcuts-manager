import { Commands, Context, Keys, Shortcuts } from "@/classes"
import { Manager } from "@/classes/Manager"
import { testName } from "@alanscodelog/utils"

describe(testName(), () => {
	it("should get created", () => {
		new Manager(
			new Keys([]),
			new Commands([]),
			new Shortcuts([]),
			new Context({})
		)
	})
})
