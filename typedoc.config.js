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
	excludeExternals: true,
	externalPattern: "**/{ast/builders,grammar}/**.ts",
	githubPages: true,
	// prevents typedoc auto-detecting installed plugins
	// // temporarily turn off plugins (just setting plugin: [] will not work)
	// plugin: "none",
	validation: {
		invalidLink: true,
	},
}
