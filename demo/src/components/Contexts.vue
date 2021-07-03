<template>
	<div class="contexts">
		<div>
			<input v-model="addVal">
			<button type="button" @click="$emit('addContext', addVal); addVal = ''">Add Context</button>
		</div>
		<div v-for="context in contexts" :key="context">{{ context }}</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue"


export default defineComponent({
	name: "contexts-component",
	components: {
	},
	props: {
		contexts: { type: Array as PropType<string[]>, required: true, default: () => [] },
	},
	// eslint-disable-next-line vue/require-emit-validator
	emits: ["addContext"],
	setup() {
		const addVal = ref("")
		return { addVal }
	},
})
</script>
