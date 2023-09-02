/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
module.exports = {
	root: true,
	extends: [
		// https://github.com/AlansCodeLog/eslint-config
		"@alanscodelog/eslint-config/vue",
	],
	ignorePatterns: [
		"coverage",
		"dist",
		"docs",
		"*.html",
	],
	parserOptions: {
		project: "./tsconfig.json"
	},
	rules: {
		// "@typescript-eslint/non-nullable-type-assertion-style":"off"
	},
	settings: {
		jsdoc: {
			mode: "typescript",
		}
	},
	overrides: [
		{
			files: ["./*.{js,cjs,ts,vue}", "./demo/**/*.{js,cjs,ts,vue}"],
			rules: {
				"@typescript-eslint/explicit-function-return-type": "off"
			}
		},
		// Eslint: https://eslint.org/docs/rules/
		// Typescript: https://typescript-eslint.io/rules/
		// Vue: https://eslint.vuejs.org/rules/
		{
			files: ["**/*.js", "**/*.ts", "**/.vue"],
			rules: {
				"jsdoc/check-tag-names": [
					"warn",
					{ definedTags: [
						"RequiresSet",
						"SetHookable",
						"experimental"
					] },
				]
			},
		},
		{
			files: ["**/*"],
			rules: {

			}
		}
	],
}
