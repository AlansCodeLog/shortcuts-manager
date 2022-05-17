<template>
<div class="contexts">
	<div>
		<input v-model="addVal">
		<button @click="$emit('addContext', addVal); addVal=''">Add</button>
	</div>
	<div v-for="context in contexts">{{context}}</div>
</div>
</template>

<script lang="ts">
import { castType } from "@utils/utils"
import { Manager,Keys, Key, Commands, Shortcuts, Context, Shortcut, Command} from "shortcuts-visualizer/dist/classes"
import { createLayout } from "shortcuts-visualizer/dist/layouts"
import { defineComponent, reactive,ref, onMounted, Ref, computed, onUnmounted, toRef} from "vue"
import { ManagerListener } from "shortcuts-visualizer/dist/types"


export default defineComponent({
	name: "contexts",
	components: {
	},
	emits: ["addContext"],
	props: {
		contexts: Array
	},
	setup(props) {
		const addVal = ref("")
		return { addVal }
	},
})
</script>
