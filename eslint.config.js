import { allFileTypes, tsEslintConfig, vueConfig } from "@alanscodelog/eslint-config"
export default tsEslintConfig( // this is just a re-export of tsEslint.config
	// https://github.com/AlansCodeLog/eslint-config
	...vueConfig,
	{
		files: [`**/*.{${allFileTypes.join(",")}}`],
		// experimentalUseProjectService is getting overloaded
		languageOptions: {
			parserOptions: {
				// eslint-disable-next-line camelcase
				EXPERIMENTAL_useProjectService: false,
				project: "./tsconfig.eslint.json",
			},
		},
		ignores: [
			// ...
		],
		rules: {
			"jsdoc/check-tag-names": ["warn", {
				definedTags: [
					"RequiresSet",
					"experimental"
				]
			}],
		},
	},
	{
		files: [`demo/**/*.{${allFileTypes.join(",")}}`],
		rules: {
			"@typescript-eslint/explicit-function-return-type": "off"
		}
	}
	// RULE LINKS
	// Eslint: https://eslint.org/docs/rules/
	// Typescript: https://typescript-eslint.io/rules/
	// Vue: https://eslint.vuejs.org/rules/
)
