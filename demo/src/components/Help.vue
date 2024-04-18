<template>
<lib-popup
	class="backdrop:bg-neutral-900 backdrop:opacity-50"
	:preferred-horizontal="['center-screen']"
	:preferred-vertical="['center-screen']"
	v-model="showHelp"
>
	<template #button="{extractEl}">
		<div class="text-center underline text-neutral-700 text-xs hover:cursor-pointer" v-extract-root-el="extractEl" @click="showHelp = !showHelp">Help</div>
	</template>
	<template #popup="{extractEl}">
		<div class="h-[500px] p-10" :ref="extractEl">
			<div class="bg-white h-full p-4 rounded border border-neutral-500">
				Basics:
				<ul class="list-disc ml-4">
					<li>
						Managers are autosaved to localstorage. They can be cloned/deleted/exported from the dropdown.
					</li>
					<li>
						The tab and escape keys will not register on the keyboard. Tab performs it's default actions, and escape clears the chain. You can press the keys with the mouse or use the recording inputs in the list to register shortcuts with those keys.
					</li>
					<li>
						In the recorder input, NO keys will escape the recording mode. You must hold escape/enter to cancel/accept.
					</li>
				</ul>
			</div>
		</div>
	</template>
</lib-popup>
</template>
<script setup lang="ts">
import { ref } from "vue"


const showHelp = ref(false)
</script>
