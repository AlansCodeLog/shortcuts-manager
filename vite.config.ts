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
	root: "demo",
	base: "demo",
	plugins: [
		vue(),
	],
	resolve: {
		alias: {
			/*
			 * Same as `@` but to differentiate the library import in case we want to change it.
			 *
			 * Ideally we would setup the demo as it's own package and link to the library but because the library is not esm, we would not get any recompilation if we did it that way.
			 *
			 * It is possible to set it up that way and get recompilation if we do something like `@demo = src` && `@ = ../src`, but that's a bit weird, because normally one would expect `@` to point to the demo/src.
			 *
			 * I think putting the vite config at this level makes it more obvious what's happening.
			 *
			 * That vite is compiling the ts from src for both the library and the demo.
			 */
			"@lib": path.resolve(rootPath, "src"),
			"@demo": path.resolve(rootPath, "demo/src"),
			// for library, must match path "aliases" in tsconfig (and therefore babel config)
			"@utils": "@alanscodelog/utils/dist",
			"@": path.resolve(rootPath, "src"),
		},
	},
	build: {
		outDir: path.resolve(rootPath, "./docs/demo"),
		minify: false,
	},
})
