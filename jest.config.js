// https://jestjs.io/docs/en/configuration.html


/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	// this will remove jsdom, which has an issue with node 10 (https://github.com/jsdom/jsdom/issues/2961)
	// it also makes tests faster
	testEnvironment: "node",
	moduleFileExtensions: [
		"ts",
		"js",
		"json",
	],
	transform: {
		"^.+\\.(ts|js)$": "babel-jest",
	},
	transformIgnorePatterns: [
		"/node_modules/",
	],
	testMatch: [
		"**/tests/**/*.spec.(js|ts)|**/__tests__/*.(js|ts)",
	],
	testURL: "http://localhost/",
	watchPlugins: [
		"jest-watch-typeahead/filename",
		"jest-watch-typeahead/testname",
	],
	collectCoverageFrom: [
		"**/src/**/*.ts",
		"!**/node_modules/**",
	],
	coveragePathIgnorePatterns: [
		".*?/index.ts",
	],
	coverageDirectory: "coverage",
}
