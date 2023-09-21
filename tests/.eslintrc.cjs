/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
module.exports = {
	root: false,
	extends: [
		// ./node_modules/@alanscodelog/eslint-config/tests.js
		"@alanscodelog/eslint-config/tests",
	],

	rules : {
		"@typescript-eslint/no-restricted-imports": "off"
	}
}
