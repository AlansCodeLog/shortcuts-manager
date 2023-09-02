import vue from "@vitejs/plugin-vue"
import path from "path"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

import postcss from "./postcss.config.js"


// https://vitejs.dev/config/
export default async ({ mode }: { mode: string }) => defineConfig({
	plugins: [
		// it isn't enough to just pass the deps list to rollup.external since it will not exclude subpath exports
		externalizeDeps(),
		tsconfigPaths(),
		vue({
			script: {
				defineModel: true,
			},
		}),
	],
	base: "/demo",
	build: {
		outDir: "dist",
		...(mode === "production" ? {
			minify: true,
		} : {
			minify: false,
			sourcemap: "inline",
		}),
	},
	resolve: {
		alias: [
			{ find: "shortcuts-manager", replacement: path.resolve("../src") },
		],
	},
	server: {
		// for locally linked repos when using vite server (i.e. not needed for libraries)
		fs: {
			allow: [...(process.env.CODE_PROJECTS ?? [])!],
		},
		watch: {
			// for pnpm
			followSymlinks: true,
			// watch changes in linked repos
			ignored: ["!**/node_modules/@alanscodelog/**"],
		},
	},
	css: {
		postcss,
	},

})
