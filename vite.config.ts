import { run } from "@alanscodelog/utils/node"
import glob from "fast-glob"
import path from "path"
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
		externalizeDeps({}),
		// only for tests, not for src since I can't get the demo to work with code directly from src if using baseUrl/alias imports, so not using them so for the moment
		tsconfigPaths(),
		// runs build:types script which takes care of generating types and fixing type aliases and baseUrl imports
		typesPlugin(),
	],
	build: {
		outDir: "dist",
		lib: {
			entry: glob.sync(path.resolve(__dirname, "src/**/*.ts")),
			formats: ["es"],
		},
		rollupOptions: {
			output: {
				preserveModulesRoot: "src",
				preserveModules: true,
			},
		},
		minify: false,
		...(mode === "production" ? {
		} : {
			sourcemap: "inline",
		}),
	},
	test: {
		cache: process.env.CI ? false : undefined,
	},
	server: {
		watch: {
			// for pnpm
			followSymlinks: true,
			// watch changes in linked repos
			ignored: ["!**/node_modules/@alanscodelog/**"],
		},
	},
})
