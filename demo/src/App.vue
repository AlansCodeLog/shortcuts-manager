<template>
	<div id="root">
		here <img :src="githubLogo">
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeMount } from "vue"

import githubLogo from '@/assets/GitHub-Mark-Light-120px-plus.png'

import * as lib from "@lib/index"
console.log(lib);


export default defineComponent({
	name: "app",
	components: {
	},
	setup() {
		return {githubLogo}
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
	background: black;
	// overflow: overlay;
}
#root {
	min-height: 100vh;
	margin: 0;
}
</style>
