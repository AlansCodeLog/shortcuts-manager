import { run } from "@alanscodelog/utils/node"
import postcss from "./postcss.config"
import path from "path"
import vue from "@vitejs/plugin-vue"
import type { PluginOption } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

const typesPlugin = (): PluginOption => ({
	name: "typesPlugin",
	// eslint-disable-next-line no-console
	writeBundle: async () => run(`npm run build:types`).promise.catch(e => { console.log(e.stdout); process.exit(1) }).then(() => undefined),
})

// https://vitejs.dev/config/
export default async ({ mode }: { mode: string }) => defineConfig({
	plugins: [
		// it isn't enough to just pass the deps list to rollup.external since it will not exclude subpath exports
		externalizeDeps(),
		// even if we don't use aliases, this is needed to get imports based on baseUrl working
		tsconfigPaths(),
		vue({
			script: {
				defineModel: true,
			},
		}),
		// runs build:types script which takes care of generating types and fixing type aliases and baseUrl imports
		typesPlugin(),
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
			{ find: "shortcuts-manager", replacement: path.resolve("../dist")},
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
