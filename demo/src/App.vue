<template>
<div
	id="shortcuts-manager-app"
	:class="twMerge(`
		p-4
		dark:bg-neutral-900
		dark:text-white
		min-h-screen
		min-h-100dvh
		flex
		flex-col
		gap-2
	`,
		outline ? 'group outlined outlined-visible' : '[&_*]:outline-none',
		darkMode && `dark`
	)"
	ref="el"
>
	<div class="
		grid grid-cols-3 grid-rows-1 gap-4
	"
	>
		<div class="col-start-2">
			<a :href="githubLink"
				class="
			hover:text-accent-600
			focus:text-accent-600
		"
			>
				<div class="text-xl text-center">Shortcut Manager Demo</div>
			</a>
			<KHelp/>
		</div>
			
		<KManagerImportExport
			:managers="managerNames"
			class="pr-8"
			@export-all="exportManagers($event)"
			@import="importManagers($event)"
		/>
	</div>
	<GithubCorner :href="githubLink"/>
	<KManagerPicker
		:can-save="true"
		:managers="managerNames"
		:active-manager="activeManager.name"
		@add="changeManager($event, {force:true})"
		@activate="changeManager($event)"
		@remove="deleteManager($event)"
		@rename="renameManager($event)"
		@duplicate="duplicateManager($event.oldName, $event.newName)"
		@export="exportManagers([$event])"
	/>
	<KManager
		:contexts="contexts"
		:add-context="addContext"
		:remove-context="removeContext"
		:activate-context="activateContext"
		:deactivate-context="deactivateContext"
		:virtually-pressed-keys="virtuallyPressedKeys"
		:manager="activeManager"
		:trigger-state="triggerState"
		@add-example-data="addExampleData(activeManager)"
	/>
	<lib-notifications :handler="notificationHandler"/>
</div>
</template>

<script setup lang="ts">
import { useDarkMode } from "@alanscodelog/vue-components/composables"
import { useAccesibilityOutline } from "@alanscodelog/vue-components/composables/useAccesibilityOutline.js"
import {
	addCommand,
	addShortcut,
	type CommandExecute,
	createCommand,
	createShortcut,
	type Manager,
	setManagerProp,
} from "shortcuts-manager"
import { safeSetManagerChain }from "shortcuts-manager/helpers/safeSetManagerChain.js"
// import { theme } from "@alanscodelog/vue-components/theme.js"
import { twMerge } from "tailwind-merge"
import { provide, ref } from "vue"

import { clearVirtuallyPressed } from "./common/clearVirtuallyPressed.js"
import { notificationHandler } from "./common/notificationHandler.js"
import { notifyIfError } from "./common/notifyIfError.js"
import GithubCorner from "./components/GithubCorner.vue"
import KHelp from "./components/Help.vue"
import KManager from "./components/Manager.vue"
import KManagerImportExport from "./components/ManagerImportExport.vue"
import KManagerPicker from "./components/ManagerPicker.vue"
import { useMultipleManagers } from "./composables/useMultipleManagers.js"
import { notificationHandlerSymbol } from "./injectionSymbols.js"
provide(notificationHandlerSymbol, notificationHandler)
const el = ref<HTMLElement | null>(null)
const { outline } = useAccesibilityOutline(el as any)
const { darkMode } = useDarkMode()
import { repository as githubLink } from "../../package.json"

const triggerState = ref(false)


const {
	deleteManager,
	changeManager,
	renameManager,
	activeManager,
	duplicateManager,
	exportManagers,
	importManagers,
	managerNames,
	virtuallyPressedKeys,
	contexts,
	addContext,
	removeContext,
	activateContext,
	deactivateContext,
 
} = useMultipleManagers(notifyIfError, defaultCommandExec)

 
function defaultCommandExec({ isKeydown }: Parameters<CommandExecute>[0]): ReturnType<CommandExecute> {
	if (isKeydown) return
	// setManagerProp(activeManager.value, "state.chain", [])
	safeSetManagerChain(activeManager.value, [])
	clearVirtuallyPressed(virtuallyPressedKeys.value, activeManager.value)
	triggerState.value = true
	setTimeout(() => {
		triggerState.value = false
	}, 500)
}


function addExampleData(manager: Manager) {
	const k = manager.keys.entries
	const m = {
		ctrl: k.VirtualControlLeft,
		alt: k.VirtualAltLeft,
		shift: k.VirtualShiftLeft,
	}
	const c1 = createCommand("Command", { execute: defaultCommandExec })
	const c2 = createCommand("Command w Mod", { execute: defaultCommandExec })
	const c3 = createCommand("Command in Chain", { execute: defaultCommandExec })
	for (const c of [c1, c2, c3]) {
		addCommand(c, manager)
	}
	const s1 = createShortcut({ chain: [[k.KeyB.id]], command: c1 }, manager).unwrap()
	const s2 = createShortcut({ chain: [[m.ctrl.id, k.KeyB.id]], command: c2 }, manager).unwrap()
	const s3 = createShortcut({ chain: [[k.KeyV.id], [k.KeyB.id]], command: c3 }, manager).unwrap()
	for (const s of [s1, s2, s3]) {
		addShortcut(s, manager)
	}
}


</script>
<style>
body {
	overscroll-behavior: none;
}
</style>
