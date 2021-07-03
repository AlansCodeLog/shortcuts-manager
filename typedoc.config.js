// @ts-ignore
const pkg = require("./package.json")
const fs = require("fs")
const path = require("path")


module.exports = {
	readme: "README.md",
	// TOCONFIGURE
	entryPoints: [
		"src/index.ts",
		...fs.readdirSync("src")
			.filter(dir => fs.statSync(path.join("src", dir)).isDirectory())
			.map(dir => `src/${dir}/index.ts`)
	],
	out: "docs",
	excludePrivate: true,
	excludeExternals: true,
	theme: "./node_modules/typedoc-neo-theme/bin/default",
	source: [{
		path: `${pkg.repository.url}/tree/master/`,
		line: "L",
	}],
	// prevents typedoc auto-detecting installed plugins
	// explicity listing them also makes things easier to debug
	plugin: [
		"typedoc-neo-theme",
		"typedoc-plugin-param-names",
	],
	// temporarily turn off plugins (just setting plugin: [] will not work)
	// plugin:"none",
	// topbar
	links: [
		{label: "Repository", url: pkg.repository},
		{label: "Issues", url: `${pkg.repository}/issues`},
	],
	// TOCONFIGURE
	// customStyles: [{
	// 	"path": path.resolve("./docs-src/custom_styles.css")
	// }],
	// customScripts: [{
	// 	"path": path.resolve("./docs-src/custom_scripts.js")
	// }]
}
