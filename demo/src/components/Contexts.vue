<template>
<div class="
		contexts
		w-full
		flex
		flex-col
		align-center
		justify-center
	"
>
	<div class="flex flex-wrap gap-2 items-start justify-between">
		<lib-button
			:class="twMerge(`
			flex
			after:inset-0
			after:border-2
			after:border-transparent
			after:rounded
			relative
			after:absolute
			disabled:text-transparent
			`,
				activeContexts.length > 1 && `
				after:border-accent-400
				hover:after:border-accent-600
				after:border-dashed
				text-accent-400
				hover:text-accent-600
			`)"
			:disabled="activeContexts.length <= 1"
			:border="false"
			aria-label="Clear Active Contexts"
			auto-title-from-aria
			@click="deactivateAll"
		>
			<fa icon="fa times"/>
		</lib-button>
		<div class="flex-1 grow-[9000] flex flex-wrap justify-center gap-2 basis-[400px]">
			<div
				:class="twMerge(`
					border
					border-neutral-300
					bg-neutral-100
					rounded
					px-2
					flex
					gap-2
					cursor-pointer
					select-none
					hover:border-accent-500
				`,
					isActive && `border-accent-400 bg-accent-100`
				)"
				tabindex="0"
				:aria-label="'Toggle Context'"
				:title="'Toggle Context'"
				v-for="[name,isActive] in Object.entries(contexts.isActive)"
				:key="name"
				@click="emit(isActive ? 'deactivate' : 'activate' as any /* wat */, name)"
			>
				<span>{{ name }}</span>
				<lib-button
					:border="false"
					:aria-label="contexts.count[name] > 0 ? `Cannot remove, ${contexts.count[name]} shortcuts using this context.` : 'Remove Context'"
					auto-title-from-aria
					class="p-0 disabled:cursor-not-allowed"
					:disabled="contexts.count[name] > 0"
					@click="emit( 'remove', name )"
				>
					<template #icon>
						<fa class="" :fixed-width="false" icon="fa times"/>
					</template>
				</lib-button>
			</div>
		</div>
		<div class="flex-1 flex flex-col items-stretch gap-2 ">
			<lib-input
				class="min-w-[0] w-[20ch]"
				placeholder="Add Context"
				wrapper-class="pr-0"
				:valid="contexts.isActive[tempValue] === undefined"
				v-model="tempValue"
				@submit="addContext"
				@enter.prevent
			>
				<template #right>
					<lib-button
						aria-label="Add Context"
						auto-title-from-aria
						:border="false"
						class="whitespace-nowrap p-0"
						:disabled="isBlank(tempValue)"
						@click="addContext"
					>
						<fa icon="fa plus" :fixed-width="false"/>
					</lib-button>
				</template>
			</lib-input>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { isBlank } from "@alanscodelog/utils/isBlank.js"
import { keys } from "@alanscodelog/utils/keys.js"
import { twMerge } from "tailwind-merge"
import { computed, inject, type PropType, ref } from "vue"

import { notificationHandlerSymbol } from "../injectionSymbols.js"
import type { ContextInfo } from "../types/index.js"


const props = defineProps<{
	contexts: ContextInfo
}>()
const emit = defineEmits<{
	add: [val: string]
	activate: [val:string]
	deactivate: [val:string]
	remove: [val:string]
}>()

const notificationHandler = inject(notificationHandlerSymbol)
const tempValue = ref("")
const addContext = (): void => {
	if (!isBlank(tempValue.value)) {
		emit("add", tempValue.value)
		tempValue.value = ""
	} else {
		void notificationHandler?.notify({
			message: "Context cannot be empty value.",
		})
	}
}

const activeContexts = computed(() => [...Object.entries(props.contexts.isActive)]
	.filter(([_, isActive]) => isActive)
	.map(([context]) => context),
)

const deactivateAll = (): void => {
	for (const context of activeContexts.value) {
		emit("deactivate", context)
	}
}

</script>
