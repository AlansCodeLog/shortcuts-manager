import { config } from "@alanscodelog/vue-components/tailwind/config.js"
import tailwindPlugin from "tailwindcss/plugin.js"


export default {
	...config,
	content: [
		...config.content,
		"./index.html",
		"./src/**/*.vue",
		"./node_modules/@alanscodelog/vue-components/src/**/*.vue",
	],
	plugins: [
		...config.plugins,

	],
}

