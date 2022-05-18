const path = require("path")


module.exports = {
	root: true,
	extends: [
		// https://github.com/AlansCodeLog/my-eslint-config
		// extends:
		// ./node_modules/@alanscodelog/eslint-config/js.js
		// prev + ./node_modules/@alanscodelog/eslint-config/typescript.js (default)
		// prev + ./node_modules/@alanscodelog/eslint-config/vue.js
		// add /js, /typescript, /vue for specific config
		"@alanscodelog/eslint-config/vue",
	],
	// for vscode, so it doesn't try to lint files in here when we open them
	ignorePatterns: [
		"coverage",
		"dist",
		"docs",
	],
	parserOptions: {
		project: path.resolve(__dirname, "./tsconfig.json"),
		extraFileExtensions: [".vue"],
		sourceType: "module",
	},
	rules: {
		"import/no-extraneous-dependencies": "off",
	},
	// 🟠 - I like to toggle these on occasionally, but otherwise keep off
	overrides: [
		// Eslint: https://eslint.org/docs/rules/
		{
			files: ["**/*.js", "**/*.ts", "**/.vue"],
			rules: {
				// "import/no-unused-modules": [ "warn", { unusedExports: true, missingExports: false }] // 🟠
				// CAREFUL: the auto fix for this one is dangerous and can remove documentation if just added to a project that has errors for it
				// "jsdoc/empty-tags": "warn", // 🟠
				// "import/no-extraneous-dependencies": ["warn", { devDependencies: false }],
				"import/no-extraneous-dependencies": "off",
			},
		},
		// Typescript: https://github.com/typescript-eslint/typescript-eslint/master/packages/eslint-plugin#supported-rules
		{
			files: ["**/*.ts", "**/*.vue"],
			rules: {
				// "@typescript-eslint/strict-boolean-expressions": ["warn", {allowNullableBoolean: true}], // 🟠
				// "@typescript-eslint/no-unnecessary-condition": "warn", // 🟠
				// "@typescript-eslint/no-confusing-void-expression": "warn", // 🟠
				// "vue/attribute-hyphenation": ["warn", "never"],
				// "vue/no-mutating-props": ["warn"],
			},
		},
		// Vue: https://eslint.vuejs.org/rules/
		{
			files: ["**/*.vue"],
			rules: {
			},
		},
	],
}
