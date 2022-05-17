import vue from "@vitejs/plugin-vue"
import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"

const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)))


// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
	root: "demo",
	plugins: [
		vue(),
	],
	resolve: {
		alias: {
			"@utils": "@alanscodelog/utils/dist",
			// "@lib": "shortcuts-visualizer/dist",
			"@": path.resolve(rootPath, "./demo/src"),
		},
	},
	server: {
		fs: {
			strict: false,
		}
	},
	optimizeDeps: {
		include: ["shortcuts-visualizer"],
	},
	build: {
		outDir: path.resolve(rootPath, "./demo/dist"),
		commonjsOptions: {
			include: [/shortcuts-visualizer/, /node_modules/]
		},
		minify:false
	}
})
