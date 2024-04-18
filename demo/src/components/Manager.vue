<template>
<div id="shortcuts-manager"
	:class="twMerge(`
		dark:bg-neutral-900
		dark:text-white
		min-h-screen
		min-h-100dvh
		flex
		flex-col
		gap-2
	`)"
>
	<k-context
		class=""
		:contexts="contexts"
		@add="addContext($event)"
		@remove="removeContext($event)"
		@activate="activateContext($event)"
		@deactivate="deactivateContext($event)"
	/>
	<div class="active-area"
		tabindex="0"
		ref="el"
		@click="el?.focus()"
	>
		<k-keyboard
			:virtually-pressed-keys="virtuallyPressedKeys"
			:trigger-state="triggerState"
			:manager="manager"
			:listeners="listeners"
			v-model:isDragging="isDragging"
		/>
	</div>
	<div class="
		
		gap-2
		flex
		justify-start
		items-center
	"
	>
		<LibButton :disabled="activeListTab === type"
			v-for="type of ['Shortcuts', 'Commands'] as const"
			:key="type"
			@click="activeListTab = type"
		>
			{{ type }}
		</LibButton>
	</div>
	<list-shortcuts v-show="activeListTab === 'Shortcuts'"
		class=""
		:listeners="listeners"
		:manager="manager"
	/>
	<list-commands
		v-show="activeListTab === 'Commands'"
		class=""
		:manager="manager"
	/>
	<div class=" flex">
		<LibButton
			v-if="Object.values(manager.commands.entries).length ===0 && manager.shortcuts.entries.length === 0"
			class="flex-1"
		
			@click="emit('addExampleData')"
		>
			Add Example Data
		</LibButton>
	</div>
</div>
</template>

<script setup lang="ts">
import { castType } from "@alanscodelog/utils/castType.js"
import { last } from "@alanscodelog/utils/last.js"
import {
	attach,
	createManagerEventListeners,
	detach,
	type Manager,
} from "shortcuts-manager"
import { twMerge } from "tailwind-merge"
import { onMounted, onUnmounted, reactive, type Ref, ref, toRefs, watch, watchEffect } from "vue"

import KContext from "./Contexts.vue"
import KKeyboard from "./Keyboard.vue"
import ListCommands from "./ListCommands.vue"
import ListShortcuts from "./ListShortcuts.vue"

import { getKeyFromIdOrVariant } from "../../../dist/helpers/getKeyFromIdOrVariant.js"
import { safeSetManagerChain } from "../../../dist/helpers/safeSetManagerChain.js"
import { clearVirtuallyPressed } from "../common/clearVirtuallyPressed.js"
import { overlayHoldListeners } from "../common/overlayAccessibilityListeners.js"
import type { ContextInfo } from "../types/index.js"


const el = ref<HTMLElement | null>(null)
const activeListTab = ref<"Shortcuts" | "Commands">("Shortcuts")

const props = defineProps<{
	manager: Manager
	contexts: ContextInfo
	virtuallyPressedKeys: Record<string, boolean>
	triggerState: boolean
	addContext: (context: string) => void
	removeContext: (context: string) => void
	activateContext: (context: string) => void
	deactivateContext: (context: string) => void
}>()
const emit = defineEmits<{
	/** Documentation #todo */
	(e: "addExampleData"): void
}>()
const { manager, triggerState } = toRefs(props)
const isDragging = ref(false)
// note if we replace the manger, we should replace the listeners
const listeners = ref(createManagerEventListeners(props.manager))
function keydownListener(e: KeyboardEvent) {
	// note, cannot use overlayAccessibilityListeners for tab
	// without rewriting browser's focusing algorithm :/
	if (e.code === "Tab") {
		if (!isDragging.value) {
			// allow tab navigation
			e.stopImmediatePropagation()
		} else {
			// prevent navigation, let user press manager's tab
			e.preventDefault()
		}
	}
	// we could use overlayAccessibilityListeners for escape
	// but just went for the more direct override for now
	// there's ways to press it anyways
	if (e.code === "Escape") {
		e.preventDefault()
		e.stopImmediatePropagation()
		const stillPressed = last(manager.value.state.chain)?.filter(_ => getKeyFromIdOrVariant(_, manager.value.keys).unwrap()[0].pressed) ?? []
		safeSetManagerChain(manager.value, [
			stillPressed,
		])

		clearVirtuallyPressed(props.virtuallyPressedKeys, manager.value)
		e.stopImmediatePropagation()
	}
}

onMounted(() => {
	castType<Ref<HTMLElement>>(KKeyboard)
	el.value!.addEventListener("keydown", keydownListener)
	listeners.value = createManagerEventListeners(manager.value)
	attach(el.value!, listeners.value)
})
onUnmounted(() => {
	detach(el.value!, listeners.value)
	el.value!.removeEventListener("keydown", keydownListener)
})
watch(() => manager.value.name, () => {
	detach(el.value!, listeners.value)
	listeners.value = createManagerEventListeners(manager.value)
	attach(el.value!, listeners.value)
})

</script>
<style>
body {
	overscroll-behavior: none;
}
</style>

