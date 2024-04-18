import { castType } from "@alanscodelog/utils/castType.js"
import { Result } from "@alanscodelog/utils/Result.js"
import { type Context,
	createContext,
	createKey,
	createKeys,
	createManager,
	ERROR,
	type Manager,
	type PickManager,
	setKeyProp } from "shortcuts-manager"
import { labelWithEvent } from "shortcuts-manager/helpers/index.js"
import { createLayout } from "shortcuts-manager/layouts/createLayout.js"

import { conditionParser } from "./conditionParser.js"
import { parseShortcutCondition } from "./parseShortcutCondition.js"

import type { Hooks } from "../../../dist/index.js"
import { useLabeledByKeyboardLayoutMap } from "../composables/useLabeledByKeyboardLayoutMap.js"
import type { ContextInfo } from "../types/index.js"


export function createDefaultManager(
	raw: Partial<Omit<Manager, "options" | "hooks" | "listener" | "state">> & {
		options: PickManager<"options", "enableShortcuts" | "enableListeners" | "updateStateOnAllEvents" >
	} = {} as any,
	extraProps: any = {}
) {
	const layout = createLayout("ansi")
	// type LayoutKeys = Key<(typeof layout)[number]["id"]>
	const keys = createKeys(layout.map(key => {
		if (key.label === "Meta") {
		// temporary
			key.enabled = false
		}
		return createKey(key.id, key).unwrap()
	}), undefined, { autoManageLayout: true }).unwrap()
	// const contexts = reactive<Map<string, boolean>>(new Map())
	if (raw.shortcuts?.entries) {
		for (const shortcut of raw.shortcuts.entries) {
			const res = parseShortcutCondition(shortcut)
			if (res.isError) return res
			shortcut.condition.ast = res.value
		}
	}

	const manager = createManager({
		name: "default",
		...raw,
		// for now keys are not configurable
		keys,
		// context will get overlayed later by useMultipleManagers
		context: createContext<Context<ContextInfo>>({
			count: {},
			isActive: {},
		}),
		options: {
			...raw.options,
			evaluateCondition(condition, context) {
				const res = (condition.ast?.valid ? conditionParser.evaluate(conditionParser.normalize(condition.ast), context.value.isActive) : true)
				return res
			},
			cb(_manager, error, e) {
				if (error.code === ERROR.UNKNOWN_KEY_EVENT && e && "deltaY" in e) {
				// ignore unknown wheel key
				} else {
					// eslint-disable-next-line no-console
					console.log(error, e)
				}
			},
		},
		// eslint-disable-next-line @typescript-eslint/no-shadow
		listener: ({ event, manager, keys }) => {
			if (!event) return
			labelWithEvent(event, keys, manager, {
				labelFilter: (_e, keyId) => {
				// it's fine, the listener will not be triggerd
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
					if (labeledByKeyboardLayoutMap.value.includes(keyId)) return false
					if (event && "key" in event) {
						if (event.key.length === 1) {
							setKeyProp(manager.keys.entries[keyId], "label", event.key.toUpperCase(), manager)
							return false
						}
						if (["ScrollLock", "NumLock", "Pause", "PageDown", "PageUp", "PrintScreen", "ContextMenu"].includes(event.key)) {
							return false
						}
					}

					return true
				},
			})
			if (
				manager.state.isRecording
			&& !(event instanceof MouseEvent)
			&& "preventDefault" in event
			) {
				event.preventDefault()
			}
		},
		hooks: {
			canSetShortcutProp(_shortcut, prop, val) {
				if (prop === "chain") {
					castType<string[][]>(val)
					if (val.length === 0 || (val.length === 1 && val[0].length === 0)) {
						return new Error(`Cannot set shortcut chain to empty chain.`)
					}
				}
				return true
			},
			canSetShortcutsProp(_shortcuts, prop, shortcut) {
				if (prop === "entries@add") {
					if (shortcut.chain.length === 0 || (shortcut.chain.length === 1 && shortcut.chain[0].length === 0)) {
						return new Error(`Cannot add shortcut with empty chain.`)
					}
				}
				return true
			},
		} satisfies Partial<Hooks>,
	})
	if (manager.isError) {
		return manager
	}

	if (extraProps) {
		manager.value = { ...extraProps, ...manager.value }
	}
	
	const labeledByKeyboardLayoutMap = useLabeledByKeyboardLayoutMap(manager.value)
	return Result.Ok(manager.value)
}
