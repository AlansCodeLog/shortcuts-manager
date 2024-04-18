import { browserSaveFile } from "@alanscodelog/utils/browserSaveFile.js"
import { debounce } from "@alanscodelog/utils/debounce.js"
import { isArray } from "@alanscodelog/utils/isArray.js"
import { keys as objectKeys } from "@alanscodelog/utils/keys.js"
import { Result } from "@alanscodelog/utils/Result.js"
import { setReadOnly } from "@alanscodelog/utils/setReadOnly.js"
import type { DeepPartial } from "@alanscodelog/utils/types"
import { walk } from "@alanscodelog/utils/walk.js"
import { type Command,type CommandExecute,type Context, createContext, type Manager, type ManagerListener } from "shortcuts-manager"
import { computed, ref, watch } from "vue"

import { useUpdateContextCount } from "./useUpdateContextCount.js"

import { conditionParser } from "../common/conditionParser.js"
import { createDefaultManager } from "../common/createDefaultManager.js"
import type { ContextInfo } from "../types/index.js"


const VERSION = "0.0.1"

export function useMultipleManagers(
	notifyIfError: <T extends Result<any, Error>>(res: T) => T,
	commandExec: CommandExecute
	
) {
	const managerNamesKey = "managerNames"
	const managerPrefixKey = "manager."
	
	const managerNames = ref<string[]>([])
	const managers = ref<Record<string, Manager>>({})
	const list = localStorage.getItem(managerNamesKey)
	managerNames.value = list ? JSON.parse(list) : []
	const activeManagerName = ref("default")
	/** We need to keep track of them to be able to clear them properly. */
	const virtuallyPressedKeys = ref<Record<string, boolean>>({})


	function updateVirtuallyPressed(arg: Parameters<ManagerListener>[0]) {
		const { event, keys, isKeydown } = arg
		if (!event) {
			for (const key of keys) {
				if (isKeydown) {
					virtuallyPressedKeys.value[key] = true
				} else {
					delete virtuallyPressedKeys.value[key]
				}
			}
		} else {
			for (const key of keys) {
				delete virtuallyPressedKeys.value[key]
			}
		}
	}


	const debouncedSave = debounce<typeof save, false, false>(save, 500, { queue: {} })

	if (managerNames.value.length > 0) {
		const res = managerNames.value
			.map(m => {
				const r = read(m, { force: true })
				notifyIfError(r)
				if (r.isOk) {
					load(r.value)
				}
				return r
			})
		const atLeastOneOk = res.some(r => r.isOk)
		if (!atLeastOneOk) {
			load(read("default", { force: true }).unwrap())
		}
		managerNames.value = Object.keys(managers.value)
		activeManagerName.value = managerNames.value[0]
	} else {
		load(read("default", { force: true }).unwrap())
	}

	const contexts = ref<ContextInfo>({
		count: {},
		isActive: {},
	})
	
	const activeManager = computed<Manager>(() => {
		const m = managers.value[activeManagerName.value]
		const managerOverlay: Manager = {
			...m,
			context: createContext<Context<ContextInfo>>(contexts.value),
			listener: arg => {
				updateVirtuallyPressed(arg)
				m.listener!(arg)
			},
			hooks: {
				...m.hooks,
				onSetShortcutsProp(...args) {
					m.hooks?.onSetShortcutsProp?.(...args)
					debouncedSave(activeManagerName.value)
				},
				onSetShortcutProp(...args) {
					m.hooks?.onSetShortcutProp?.(...args)
					debouncedSave(activeManagerName.value)
				},
				onSetCommandsProp(...args) {
					m.hooks?.onSetCommandsProp?.(...args)
					debouncedSave(activeManagerName.value)
				},
				onSetCommandProp(...args) {
					m.hooks?.onSetCommandProp?.(...args)
					debouncedSave(activeManagerName.value)
				},
			},
		}
		return managerOverlay
	})
	const {
		addContext,
		removeContext,
		activateContext,
		deactivateContext,
	} = useUpdateContextCount(activeManager, contexts)
	
	watch(() => activeManager.value.context.value, () => {
		conditionParser.setContext(activeManager.value.context.value)
	})

	function storageAddManager(name: string, clone: any) {
		localStorage.setItem(`${managerPrefixKey}${name}`, JSON.stringify(clone))
		if (!managerNames.value.includes(name)) {
			managerNames.value.push(name)
			localStorage.setItem(
				managerNamesKey,
				JSON.stringify(managerNames.value)
			)
		}
	}
	function storageRemoveManager(name: string) {
		localStorage.removeItem(`${managerPrefixKey}${name}`)
		const index = managerNames.value.indexOf(name)
		if (index > -1) {
			managerNames.value.splice(index, 1)
			localStorage.setItem(
				managerNamesKey,
				JSON.stringify(managerNames.value)
			)
		}
	}

	function managerToStorableClone(m: Manager): DeepPartial<Manager> {
		const clone = walk(m, undefined, { save: true })
		delete clone.hooks
		delete clone.listener
		delete clone.state
		delete clone.options.evaluateCondition
		delete clone.options.cb
		delete clone.options.sorter
		delete clone.options.stringifier
		delete clone.options.conditionEquals
		for (const shortcut of clone.shortcuts.entries) {
			delete shortcut.condition.ast
		}
		return clone
	}

	function save(name: string) {
		const clone = managerToStorableClone(managers.value[name])
		;(clone as any).__version = VERSION
		storageAddManager(name, clone)
	}
	function parseJsonManager(
		raw: string,
	): Result<any, Error> {
		if (!raw) {
			return Result.Err(new Error(`Nothing to parse.`))
		}
		try {
			const parsed = JSON.parse(raw)
			// todo add zod, this is insane
			if (!parsed.__version || !(parsed.__version as string).match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/)) {
				notifyIfError(Result.Err(`Parsed manager "${parsed.name}"'s __version property is not defined or does not match the version format. The manager will be imported anyways, but it might not function correctly.`))
				;(parsed as any).__version = VERSION
			}
			// set the execute function to the global/default command exec
			// this is the only connection that needs to be made manually
			// to avoid the danger of parsing a malicious function
			for (const commandName of objectKeys(parsed.commands.entries)) {
				const command: Command = parsed.commands.entries[commandName]
				setReadOnly(command, "execute", commandExec)
			}
			return Result.Ok(parsed)
		} catch (e) {
			return Result.Err(e as Error)
		}
	}


	function read(
		name: string,
		{ force = false }: { force?: boolean } = {}
	): Result<Manager, Error> {
		const raw = localStorage.getItem(`manager.${name}`)
		if (!raw && !force) {
			const res = Result.Err(new Error(`No manager found by the name of ${name}.`))
			return notifyIfError(res)
		}
		try {
			return createDefaultManager(
				!raw && force ? { name } : parseJsonManager(raw!).unwrap(),
				{ __version: VERSION }
			)
		} catch (e) {
			return Result.Err(e as Error)
		}
	}
	
	function load(
		manager: Manager,
		{
			doActivate = true,
		}: {
			doActivate?: boolean
		} = {}
	) {
		managers.value[manager.name] = manager
		if (doActivate) {
			activeManagerName.value = manager.name
		}
		save(manager.name)
	}

	function changeManager(
		name: string,
		opts: { force?: boolean } = {}
	) {
		if (managerNames.value.includes(name)) {
			activeManagerName.value = name
			return Result.Ok()
		} else {
			const m = read(name, opts)
			if (m.isOk) {
				load(m.value)
				activeManagerName.value = name
			}
			return m
		}
	}
	
	function deleteManager(
		name: string
	) {
		const index = managerNames.value.indexOf(name)
		let nextName = managerNames.value[index - 1] ?? managerNames.value[index + 1] ?? "default"
		storageRemoveManager(name)
		delete managers.value[name]

		if (nextName === name) nextName = "default"
		const res = changeManager(nextName, { force: true })
		notifyIfError(res)
		return res
	}

	function renameManager(
		name: string
	) {
		storageRemoveManager(activeManager.value.name)
		managers.value[name] = activeManager.value
		managers.value[activeManager.value.name] = undefined as any
		activeManager.value.name = name
		save(name)
	}
	function duplicateManager(
		oldName: string,
		newName: string
	) {
		const m = managers.value[oldName]
		if (!m) {
			const res = Result.Err(new Error(`No manager found by the name of ${oldName}.`))
			return notifyIfError(res)
		}
		const clone = managerToStorableClone(m)
		clone.name = newName
		const instance = createDefaultManager(clone as any, { __version: VERSION })
		notifyIfError(instance)
		if (instance.isOk) load(instance.value)
		return instance
	}
	
	function exportManagers(
		names: string[]
	) {
		const obj = { managers: [] as any[] }
		for (const name of names) {
			const m = managers.value[name]
			if (!m) {
				const res = Result.Err(new Error(`No manager found by the name of ${name}.`))
				return notifyIfError(res)
			}
			const clone = managerToStorableClone(m)
			;(clone as any).__version = VERSION
			obj.managers.push(clone)
		}
		browserSaveFile(`${names.join("--")}.shortcuts.json`, JSON.stringify(obj))
		return Result.Ok()
	}

	function importManagers(
		content: string
	) {
		const p = JSON.parse(content)
		if (!p.managers || !isArray(p.manager)) {
			return Result.Err(new Error(`Not a valid manager file.`))
		}
		const ok: Manager[] = []
		for (const parsedM of p.managers) {
			const m = parseJsonManager(JSON.stringify(parsedM))
			notifyIfError(m)

			if (m.isOk) {
				const instance = createDefaultManager(m.value as any, { __version: VERSION })
				notifyIfError(instance)
				// all must succeed
				if (instance.isError) return instance
				ok.push(instance.value)
			}
		}
		for (const instance of ok) {
			load(instance)
		}
		return Result.Ok()
	}

	
	return {
		duplicateManager,
		managers,
		activeManager,
		save,
		load,
		debouncedSave,
		changeManager,
		deleteManager,
		renameManager,
		managerNames,
		exportManagers,
		importManagers,
		virtuallyPressedKeys,
		contexts,
		addContext,
		removeContext,
		activateContext,
		deactivateContext,
	}
}

