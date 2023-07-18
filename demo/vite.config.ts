/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line no-restricted-imports
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => defineConfig({
	plugins: [
		tsconfigPaths(),
		vue()
	],
	base: "/demo",
	build: {
		outDir: "dist",
		...(mode === "production" ? {
		} : {
			minify: false,
			sourcemap: "inline",
		}),
	},
	resolve: {
		alias: [
		],
	},
	server: {
		fs: {
			allow: [process.env.CODE_PROJECTS!]
		},
		watch: {
			followSymlinks: true,
			// watch changes in linked repos
			ignored: ["!**/node_modules/@alanscodelog/**"],
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				sourceMap: false,
				// import into every scss file
				// note: requires exact (illegal) path to work ????
				// without it there are errors and i think we run into https://github.com/nuxt/vite/issues/71
				additionalData: `
					@import "node_modules/@alanscodelog/vue-components/src/assets/mixins.scss";
				`,
			},
		},
	},
})
