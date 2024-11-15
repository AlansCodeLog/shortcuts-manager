import glob from "fast-glob"
import path from "path"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import { defineConfig } from "vitest/config"


// https://vitejs.dev/config/
export default async ({ mode }: { mode: string }) => defineConfig({
	plugins: [
		// it isn't enough to just pass the deps list to rollup.external since it will not exclude subpath exports
		externalizeDeps({ include: ["@alanscodelog/utils"]}),
		// runs build:types script which takes care of generating types
		// typesPlugin(),
	],
	build: {
		outDir: "dist",
		lib: {
			entry: glob.sync(path.resolve(import.meta.dirname, "src/**/*.ts")),
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
})
