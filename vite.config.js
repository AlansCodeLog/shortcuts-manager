import vue from "@vitejs/plugin-vue"
import path from "path"
import {fileURLToPath} from 'url'
import {defineConfig} from "vite"

const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)))


// https://vitejs.dev/config/
export default defineConfig({
  root:"demo",
  plugins: [vue()],
  resolve: {
    alias: {
      '@utils': "@alanscodelog/utils/dist",
      "@lib": path.resolve(rootPath, './src'),
      "@": path.resolve(rootPath, './demo/src'),
    },
  }
})
