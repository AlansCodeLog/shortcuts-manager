import vue from "@vitejs/plugin-vue"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

import postcss from "./postcss.config.js"


// https://vitejs.dev/config/
export default async ({ mode }: { mode: string }) => defineConfig({
	plugins: [
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
		// getting duplicate imports otherwise i think because of pnpm
		// https://vitejs.dev/config/shared-options.html#resolve-dedupevite
		dedupe: ["@alanscodelog/utils"],
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
