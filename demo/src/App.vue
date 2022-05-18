<template>
	<div id="root">
		<contexts :contexts="contexts" @add-context="contexts.push($event)"/>
		<keyboard/>
	</div>
</template>

<script lang="ts">
import contexts from "@demo/components/Contexts.vue"
import keyboard from "@demo/components/Keyboard.vue"
import { defineComponent } from "vue"


export default defineComponent({
	name: "app",
	components: {
		keyboard,
		contexts,
	},
	setup() {
		return {
			contexts: ["context"],
		}
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
}
#root {
	overflow:auto-scroll;
	min-height: 100vh;
	margin: 0;
}
</style>
