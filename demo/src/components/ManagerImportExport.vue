<template>
<div class="flex flex-row gap-2 items-center flex-wrap">
	<lib-button
		aria-label="Export All"
		title="Export All"
		class="flex-1"
		@click="emit('exportAll', managers)"
	>
		<fa icon="fa file-export" :fixed-width="false"/> Export All
	</lib-button>

	<lib-file-input
		aria-label="Import"
		title="Import"
		class="flex-1 px-2 pl-1 border-[1px] hover:text-accent-600"
		:formats="['.json']"
		:compact="true"
		@input="importManagers"
	>
		<template #icon>
			<fa icon="fa file-import" :fixed-width="false"/>
		</template>

		<template #label>
			Import
		</template>
	</lib-file-input>
</div>
</template>


<script setup lang="ts">

defineProps<{
	managers: string[]
}>()

const emit = defineEmits<{
	exportAll: [val:string[]]
	import: [val:string]
}>()

async function importManagers(files: File[]) {
	const content = await files[0].text()
	emit("import", content)
}
</script>
