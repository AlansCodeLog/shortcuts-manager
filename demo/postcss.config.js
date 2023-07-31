//
// const postCssComment = require("postcss-comment")
//
// module.exports = {
// 	parser: postCssComment,
// 	plugins: {
// 		"postcss-import":{},
// 		"tailwindcss/nesting":{},
// 		tailwindcss: {},
//
// 		autoprefixer: {},
// 	},
// }
import autoprefixer from "autoprefixer"
import postCssComment from "postcss-comment"
import postCssImport from "postcss-import"
import tailwind from "tailwindcss"
import nesting from "tailwindcss/nesting"

import tailwindConfig from "./tailwind.config.js"


export default {
	parser: postCssComment,
	plugins: [
		postCssImport,
		nesting,
		tailwind(tailwindConfig),
		autoprefixer,
	],
}
