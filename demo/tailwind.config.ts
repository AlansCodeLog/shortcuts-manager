// import componentsConfig from "node_modules/@alanscodelog/vue-components/tailwind.config.ts"
// console.log(componentsConfig)
// console.log(componentsConfig)
//
import { createTailwindPlugin } from "metamorphosis/tailwind"

 import { theme } from "@alanscodelog/vue-components/theme.js"
console.log(createTailwindPlugin, theme)
export default {
	// ...componentsConfig,
	// ... your config
	plugins: [
		// ...your plugins
		// ...componentsConfig.plugins
	]
}
// import {type Config} from "tailwindcss"
// // you can also use your own metamorphosis theme so long as the necessary colors are provided ( warning/ok/danger/accent, neutral is also used, but that is already provided by tailwind )
// // import { theme } from "@alanscodelog/vue-components/theme.js"
// // import { plugin as libraryPlugin } from "@alanscodelog/vue-components/tailwind/plugin.js"
// // import { themePluginOpts } from "@alanscodelog/vue-components/tailwind/themePluginOpts.js"
// import componentsconfig from "@alanscodelog/vue-components/tailwind.config.ts"
//
// const config = {
// 	content: componentsconfig.content,
// 	darkMode: "class",
// 	plugins: [
// 		// integration with my theme library
// 		// createTailwindPlugin(theme, themePluginOpts),
// 		// libraryPlugin,
// 		// .... your plugins
// 	],
// 	// ... your opts
// } satisfies Config
//
// export default config
//
