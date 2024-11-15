import { allFileTypes,tsEslintConfig, vueConfig } from "@alanscodelog/eslint-config"

export default tsEslintConfig(
	// https://github.com/AlansCodeLog/eslint-config
	...vueConfig,
	{
		rules: {
			"jsdoc/check-tag-names": ["warn", {
				definedTags: ["experimental", "RequiresSet"],
			}],
		},
	},
	{
		files: [`demo/**/*.{${allFileTypes.join(",")}}`],
		rules: {
			"@typescript-eslint/explicit-function-return-type": "off"
		}
	},
)
