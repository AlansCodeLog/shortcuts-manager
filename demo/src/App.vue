<template>
	<div id="root">
		<contexts :contexts="contexts" @add-context="contexts.push($event)"></contexts>
		<keyboard></keyboard>
  </div>
</template>

<script lang="ts">
import { castType } from "@utils/utils"
import { Manager,Keys, Key, Commands, Shortcuts, Context, Shortcut, Command} from "shortcuts-visualizer/dist/classes"
import { createLayout } from "shortcuts-visualizer/dist/layouts"
import { defineComponent, reactive,ref, onMounted, Ref, computed, onUnmounted, toRef} from "vue"
import { ManagerListener } from "shortcuts-visualizer/dist/types"
import keyboard from "@/components/Keyboard.vue"
import contexts from "@/components/Contexts.vue"

export default defineComponent({
	name: "app",
	components: {
		keyboard,
		contexts
	},
	setup() {
		return {
			contexts: ["context"]
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
