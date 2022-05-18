// const pkg = require("./package.json")
const fs = require("fs")
const path = require("path")


module.exports = {
	readme: "README.md",
	entryPoints: [
		"src/index.ts",
		...fs.readdirSync("src")
			.filter(dir => fs.statSync(path.join("src", dir)).isDirectory())
			.map(dir => `src/${dir}/index.ts`),
	],
	out: "docs",
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	validation: {
		invalidLink: true,
	},
	// pluginPages: {
	// 	source: "docs-src",
	// 	output: "",
	// 	pages: [
	// 		{ title: "Development" },
	// 	],
	// },
}
