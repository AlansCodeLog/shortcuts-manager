<template>
<div>
	<div :class="`
		rounded-tl
		rounded-tr
		border-x
		border-t
		border-neutral-600
		px-2
		py-1
		flex
		flex-wrap
		justify-end
		gap-2
		[&>.filter:nth-child(4)]:after:content-['']
		[&>.filter:nth-child(4)]:after:border-r-neutral-400
		[&>.filter:nth-child(4)]:after:border-r-2
	`"
	>
		<div>Filters:</div>
		<div class="flex-1"/>
		<!-- We draw a line after the second filter to delimit the exclusionary from the non-exclusionary filters. -->
		<div
			class="filter flex no-wrap gap-2"
			v-for="action in ObjectKeys(filters).filter(_ => _ !=='showExactMatches')"
			:key="action"
		>
			<LibCheckbox class="whitespace-nowrap"
				:label="filterNames[action]"
				:model-value="filters[action]"
				@update:model-value="filters[action]=$event"
			/>
		</div>
	</div>
	<div :class="`
			grid
			grid-cols-[min-content,repeat(3,minmax(0,1fr)),min-content]
			items-stretch

			[&>div:nth-last-of-type(1)]:rounded-br
			[&>div:nth-last-of-type(5)]:rounded-bl
			[&>div]:border-neutral-400
			[&>div:nth-of-type(-n+5)]:bg-neutral-200
			[&>div:nth-of-type(-n+5)]:border-t-neutral-600
			[&>div:nth-last-of-type(-n+4)]:border-b-neutral-600
			[&>div:nth-of-type(-n+5)]:border-t
			[&>div]:border-b
			[&>div:nth-of-type(5n+1)]:border-l
			[&>div:nth-of-type(5n+1)]:border-l-neutral-600
			[&>div:nth-of-type(5n+5)]:border-r-neutral-600
			[&>div]:border-r
			relative
		`"
		v-resizable-cols="{selector:'div',enable:true}"
	>
		<!-- headers -->
		<div class="" title="Enabled" aria-label="Enabled"/>
		<div class="px-2">Shortcut</div>
		<div class="px-2">Command</div>
		<div class="px-2">Condition</div>
		<div class="" title="Add/Remove" aria-label="Add/Remove"/>

		<!-- add new -->
		<div class="flex items-center px-2">
			<LibCheckbox
				:model-value="newShortcut.enabled"
				@update:model-value="updateShortcutEnabled(-1, $event)"
			/>
		</div>
		<div class="">
			<LibRecorder
				:border="false"
				:binders="binders"
				:recording-title="`(Hold escape to cancel, hold enter to accept.)`"
				:recording-value="isRecordingKey === -1 ? recordingValue : undefined"
				:recording="isRecording && isRecordingKey === -1"
				:model-value="s.stringify(newShortcut.chain, manager)"
				@update:recording="toggleRecording(-1, $event)"
				@recorder:click="toggleRecording(-1, !isRecording)"
				@recorder:blur="toggleRecording(-1 , false, {reset:true})"
			/>
		</div>
		<div class="">
			<LibInput
				:placeholder="'(None)'"
				:border="false"
				:suggestions="commandsSuggestions"
				:model-value="newShortcut.command ??''"
				@update:model-value="setReadOnly(newShortcut, 'command', isWhitespace($event) ?undefined : $event)"
				@submit="createCommandIfMissing"
			/>
		</div>
		<div class="">
			<LibInput
				:placeholder="activeContexts.length > 0 ? activeContexts.join(' && '): '(Global)'"
				:border="false"
				:valid="conditionValidity[0] === true"
				:title="conditionValidity[0] === true ? '' : conditionValidity[0]?.message"
				v-model="newShortcut.condition.text"
			/>
			<!-- todo :suggestions="conditionSuggestions" -->
		</div>

		<div class="items-center px-1">
			<LibButton :border="false"
				icon="solid plus"
				aria-label="Add Shortcut"
				auto-title-from-aria
				@click="addShortcut"
			/>
		</div>
		<!-- existing - todo move into a component -->
		<template v-for="item,i of filteredShortcuts" :key="shortcutToId(item,manager)">
			<div class="flex items-center px-2">
				<LibCheckbox
					:model-value="item.enabled"
					@update:model-value="updateShortcutEnabled(i, $event)"
				/>
			</div>
			<div class="">
				<LibRecorder
					:border="false"
					:binders="binders"
					:recording-title="`(Hold escape to cancel, hold enter to accept.)`"
					:recording-value="isRecordingKey === i ? recordingValue : undefined"
					:recording="isRecordingKey === i"
					:model-value="s.stringify(item.chain, manager)"
					@update:recording="toggleRecording(i, $event )"
					@recorder:click="toggleRecording(i, !isRecording)"
					@recorder:blur="toggleRecording(i, false, {reset:true})"
				/>
			</div>
			<div class="">
				<LibInput
					:placeholder="'(None)'"
					:border="false"
					:model-value="item.command ?? editedCommand"
					title="Press enter to add new cammand."
					:suggestions="commandsSuggestions"
					@update:model-value="editedCommand = $event"
					@blur="blurMaybeEditedCommand(i)"
					@submit="updateShortcutCommand(i,$event, true)"
				/>
			</div>
			<div class="">
				<!-- @vue-expect-error -->
				<LibInput
					:placeholder="'(Global)'"
					:border="false"
					:model-value="item.condition.text"
					:valid="conditionValidity[i+1] === true"
					:title="conditionValidity[i+1] instanceof Error ? conditionValidity[i+1]?.message: ''"
					@submit="updateShortcutCondition(i, $event)"
				/>
				<!-- todo :suggestions="conditionSuggestions" -->
			</div>
			<div class="items-center px-1">
				<LibButton :border="false"
					icon="solid trash"
					aria-label="Delete Shortcut"
					auto-title-from-aria
					@click="notifyIfError(managerRemoveShortcut(item, manager))"
				/>
			</div>
		</template>
	</div>
</div>
</template>
<script setup lang="ts">
import { setReadOnly } from "@alanscodelog/utils"
import { isWhitespace } from "@alanscodelog/utils/isWhitespace.js"
import { keys, keys as ObjectKeys } from "@alanscodelog/utils/keys.js"
import { Result } from "@alanscodelog/utils/Result.js"
import { unreachable } from "@alanscodelog/utils/unreachable.js"
import { resizableCols as vResizableCols } from "@alanscodelog/vue-components/directives/index.js"
import type { createManagerEventListeners } from "shortcuts-manager"
import { addCommand, addShortcut as managerAddShortcut, attach, createCommand, createShortcut, detach, removeShortcut as managerRemoveShortcut, setManagerProp, setShortcutProp } from "shortcuts-manager"
import { equalsShortcut } from "shortcuts-manager/helpers/equalsShortcut.js"
import type { Manager, Shortcut } from "shortcuts-manager/types"
import { cloneChain } from "shortcuts-manager/utils"
import { computed, ref, toRaw, toRef, watch, watchEffect } from "vue"

import { notifyIfError } from "../common/notifyIfError.js"
import { overlayHoldListeners } from "../common/overlayAccessibilityListeners.js"
import { parseShortcutCondition } from "../common/parseShortcutCondition.js"
import { shortcutToId } from "../common/shortcutToId.js"
import { type Filters, useFilterableShortcutsList } from "../composables/useFilterableShortcutsList.js"


const props = defineProps<{
	manager: Manager
	listeners: ReturnType<typeof createManagerEventListeners>
}>()
const manager = toRef(props, "manager")
const commands = computed(() => props.manager.commands)
const chain = computed(() => props.manager.state.chain)
const s = computed(() => props.manager.options.stringifier)

const isRecording = computed(() => props.manager.state.isRecording)
const recordingValue = computed(() => isRecording.value ? s.value.stringify(chain.value, props.manager) : undefined)
const isRecordingKey = ref<number | undefined>(undefined)

const listenersOverlay = computed(() => overlayHoldListeners(props.listeners,
	{
		Enter: {
			onThresholdKeydown: () => stopRecording(isRecordingKey.value!),
		},
		Escape: {
			onThresholdKeydown: () => stopRecording(isRecordingKey.value!, { reset: true }),
		},
	},
	(original, e) => {
		e.stopPropagation()
		e.preventDefault()
		original(e)
	},
	1000,
	() => isRecordingKey.value !== undefined,
))

const activeContexts = computed(() =>
	Object.keys(props.manager.context.value.isActive)
		.filter(_ => props.manager.context.value.isActive[_])
)


const filterNames: Partial<Filters<string>> = {
	onlyExecutable: "Only Executable",
	onlyEnabled: "Only Enabled",
	showPressable: "Pressable",
	showPressableModOrChords: "Pressable Mods/Chords",
	showUnpressable: "Unpressable",
}

const filters = ref<Filters<boolean>>({
	onlyExecutable: false,
	onlyEnabled: true,
	showPressable: true,
	showPressableModOrChords: true,
	showUnpressable: true,
	showExactMatches: true,
})

const filterChain = ref(cloneChain(chain.value))
const filteredShortcuts = useFilterableShortcutsList(manager, filterChain, filters)
const editedCommand = ref("")

// use capture to let the listeners stopPropagation to child listenrs
const attachOptions = Object.fromEntries(keys(listenersOverlay.value).map(_ => [
	_,
	{ capture: true, passive: _ === "wheel" },
]))

const binders = {
	bind: () => {
		attach(document, listenersOverlay.value, attachOptions)
	} ,
	unbind: () => {
		detach(document, listenersOverlay.value, attachOptions)
	}
}

function startRecording(i: number): void {
	if (isRecording.value) return
	filterChain.value = cloneChain(chain.value)
	isRecordingKey.value = i
	setManagerProp(props.manager, "state.chain", []).unwrap()
	setManagerProp(props.manager, "state.isRecording", true).unwrap()
}

function stopRecording(i: number, { reset = false }: { reset?: boolean } = {}): void {
	const c = cloneChain(chain.value)
	if (i === isRecordingKey.value) {
		isRecordingKey.value = undefined
		setManagerProp(props.manager, "state.isRecording", false).unwrap()
		setManagerProp(props.manager, "state.chain", []).unwrap()
		if (!reset) {
			updateShortcutChain(i, c)
		}
		filterChain.value = []
	}
}

function toggleRecording(i: number, val: boolean, { reset = false }: { reset?: boolean } = {}): void {
	if (val) {
		startRecording(i)
	} else {
		stopRecording(i, { reset })
	}
}

const newShortcut = ref(createShortcut({ chain: []}, props.manager).unwrap())
const conditionValidity = computed(() => {
	const res = []
	const r = isValidCondition(newShortcut.value)
	res.push(r.isOk ? true : r.error)

	for (const shortcut of filteredShortcuts.value) {
		// eslint-disable-next-line no-shadow
		const r = isValidCondition(shortcut)
		res.push(r.isOk ? true : r.error)
	}
	return res as (true | Error)[]
})

function isValidCondition(shortcut: Shortcut): Result<true, Error> {
	if (shortcut.condition.text === "") return Result.Ok(true)
	const res = parseShortcutCondition(shortcut)
	return res.isOk ? Result.Ok(true) : res
}
function createCommandIfMissing(name: string): void {
	let command = commands.value.entries[name]
	if (!command) {
		command = createCommand(name ?? "")
		// eslint-disable-next-line no-useless-return
		if (notifyIfError(addCommand(command, props.manager)).isError) return
	}
}
function resetAutoCondition(changedCondition = false) {
	if (changedCondition) {
		newShortcut.value.condition.text = ""
	}
}
function addShortcut(): void {
	let changedCondition = false
	if (newShortcut.value.condition.text === "" && activeContexts.value.length > 0) {
		changedCondition = true
		newShortcut.value.condition.text = activeContexts.value.join(" && ")
	}
	if (newShortcut.value.command) createCommandIfMissing(newShortcut.value.command)

	const res = managerAddShortcut(newShortcut.value, props.manager)
	notifyIfError(res)
	
	if (res.isError) { resetAutoCondition(changedCondition); return }

	const resCommandValid = isValidCondition(newShortcut.value)
	notifyIfError(resCommandValid)
	if (resCommandValid.isError) { resetAutoCondition(changedCondition); return }

	const res2 = createShortcut({ chain: []}, props.manager)
	notifyIfError(res2)
	if (res2.isOk) {
		newShortcut.value = res2.value
	}
}
function updateShortcutChain(i: number, value: string[][]): void {
	if (i === -1) {
		// don't check command or condition yet
		const can = setShortcutProp({
			...newShortcut.value,
			command: undefined,
			condition: {
				text: "",
				type: "condition",
			},
		}, "chain", value, props.manager)
		notifyIfError(can)
		if (can.isOk) {
			setReadOnly(newShortcut.value, "chain", value)
		}
	} else {
		const shortcut = filteredShortcuts.value[i]
		notifyIfError(setShortcutProp(shortcut, "chain", value, props.manager))
	}
}

function updateShortcutEnabled(i: number, val: boolean): void {
	notifyIfError(setShortcutProp(filteredShortcuts.value[i], "enabled", val, props.manager))
}

function blurMaybeEditedCommand(i: number): void {
	const itemCommand = filteredShortcuts.value[i].command
	if (editedCommand.value !== "" && editedCommand.value !== itemCommand) {
		updateShortcutCommand(i, editedCommand.value)
	}
	editedCommand.value = ""
}

function updateShortcutCommand(i: number, value: string, force = false): void {
	if (value !== "" && force) {
		createCommandIfMissing(value)
	}
	notifyIfError(setShortcutProp(filteredShortcuts.value[i], "command", value, props.manager))
	editedCommand.value = ""
}

function updateShortcutCondition(i: number, value: string): void {
	const shortcut = filteredShortcuts.value[i]
	// we could move into a hook
	const res = parseShortcutCondition({ ...shortcut, condition: { ...shortcut.condition, text: value } })
	notifyIfError(res)
	if (res.isError) return
	const found = props.manager.shortcuts.entries.find(existing => equalsShortcut(existing,shortcut, props.manager))

	notifyIfError(setShortcutProp(found!, "condition", {
		type: "condition",
		text: value,
		ast: toRaw(res.value),
	}, props.manager))
}


const commandsSuggestions = computed(() => Object.values(commands.value.entries).map(_ => _.name))

</script>
