<template>
	<div id="root">
		{{ pretty(layout) }}
	</div>
</template>

<script lang="ts">
// import * as lib from "@lib/index"
import { pretty } from "@utils/utils"
import { defineComponent, reactive } from "vue"


export default defineComponent({
	name: "app",
	components: {
	},
	setup() {
		const $ = reactive({
			layout: null as any,
			pretty,
		})
		document.addEventListener("keydown", e => {
			console.log(e.code, e.key, e.keyCode, $.layout.get(e.code))
			e.preventDefault()
			return false
		})
		const asyncSetup = async (): Promise<void> => {
			$.layout = await navigator.keyboard.getLayoutMap()
			console.log([...$.layout.entries()])
		}

		void asyncSetup()
		return $
	},
})
</script>

<style lang="scss">
* {
	box-sizing: border-box;
}
body {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	margin: 0;
	font-size: 1.1rem;
	// overflow: overlay;
}
#root {
	min-height: 100vh;
	margin: 0;
}
</style>
