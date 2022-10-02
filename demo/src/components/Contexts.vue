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
export default {
	name: "contexts-component",
}
</script>
<script setup lang="ts">
import { defineProps, PropType, ref } from "vue";

const props= defineProps({
	contexts: { type: Array as PropType<string[]>, required: true, default: () => [] },
})
const emit = defineEmits<(e: "addContext", val:string) => void>()
const addVal = ref("")
</script>
