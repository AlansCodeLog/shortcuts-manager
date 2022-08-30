<template>
	<div id="list-component">
		<lib-table>
			<thead>
				<th>
					<div>Command</div>
				</th>
				<th>
					<div>Shortcut</div>
				</th>
			</thead>
			<tr v-for="(shortcut, i) of shortcuts" :key="i">
				<td>
					<lib-input :border="false"
						:model-value="shortcut.command?.name"
						@update:model-value="change('name', shortcut, $event)"
					/>
				</td>
				<td>
					{{ shortcut.stringifier.stringify(shortcut.chain) }}
				</td>
			</tr>
		</lib-table>
	</div>
</template>

<script setup lang="ts">

import { Manager, Shortcut } from "@lib/classes"
import { shallowRef, triggerRef } from "vue"


const props = defineProps<{
	manager: Manager
}>()


const shortcuts = shallowRef([...props.manager.shortcuts.entries])

props.manager.shortcuts.addHook("add", (self, _, entry) => {
	shortcuts.value.push(entry)
})
props.manager.shortcuts.addHook("remove", (self, _, entry) => {
	shortcuts.value.splice(shortcuts.value.indexOf(entry), 1)
})

const change = (prop: string, shortcut: Partial<Shortcut>, name: string): void => {
	console.log(prop, shortcut, name)
	shortcut.command?.set("name", name)
	triggerRef(shortcuts)
}
</script>

<style lang="scss" scoped>
//#list-componen {
//	--varName: v-bind(value);
//}
</style>
