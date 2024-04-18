import { expect, it } from "vitest"

import demoPackageJson from "../demo/package.json"
import packageJson from "../package.json"
it("demo package.json uses same dependency versions", () => {
	for (const [dep, version] of Object.entries(demoPackageJson.dependencies)) {
		if (packageJson.dependencies[dep] !== undefined) {
			expect(version).to.equal(packageJson.dependencies[dep], `Sync demo's ${dep} version to package.json's ${packageJson.dependencies[dep]}`)
		}
	}
})
