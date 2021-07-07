// eslint-disable-next-line import/no-extraneous-dependencies
import vue from "@vitejs/plugin-vue"
import path from "path"
import { fileURLToPath } from "url"
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vite"


const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)))


// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
	root: "src-demo",
	plugins: [vue()],
	resolve: {
		alias: {
			"@utils": "@alanscodelog/utils/dist",
			"@lib": path.resolve(rootPath, "./src"),
			"@": path.resolve(rootPath, "./src-demo/src"),
		},
	},
})
