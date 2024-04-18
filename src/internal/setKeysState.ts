import { Result } from "@alanscodelog/utils/Result.js"

import { safeSetEmulatedToggleState } from "./safeSetEmulatedToggleState.js"

import { KnownError } from "../helpers/KnownError.js"
import { setKeyProp } from "../setKeyProp.js"
import type { CanHookErrors, KeySetEntries, Manager, MultipleErrors } from "../types/index.js"
import { ERROR } from "../types/index.js"


export function setKeysState<
	THooks extends Manager["hooks"],
>(
	keysList: string[],
	manager: KeySetEntries["pressed" | "toggleOnPressed" | "toggleOffPressed"]["manager"] & { hooks?: THooks },
	state: boolean,
	{
		ignoreToggleType = false,
	}: {
		ignoreToggleType?: boolean
	} = {}
): Result<
		true,
		| MultipleErrors<
			| ERROR.CANNOT_SET_WHILE_DISABLED
			| ERROR.INCORRECT_TOGGLE_STATE
		>
		| CanHookErrors<THooks extends never ? never : THooks, "canSetKeyProp">
	>
{
	const s = manager.options.stringifier
	for (const id of keysList) {
		const key = manager.keys.entries[id]
		const isRoot = id === key.id
		// this is only for the emulator
		const isOn = id === key.toggleOnId
		const isOff = id === key.toggleOffId
		if ((isRoot && key.pressed === state)
			|| (isOn && key.toggleOnPressed === state)
			|| (isOff && key.toggleOffPressed === state)
		) {
			continue
		}
		const res = setKeyProp(key, "pressed", state, manager)
		if (res.isError) return res
		if (isRoot && state) {
			// toggles are considered active on keydown
			if ((ignoreToggleType && key.isToggle) || key.isToggle === "emulated") {
				// state was never set
				if (key.toggleOnPressed && key.toggleOffPressed) {
					return Result.Err(new KnownError(
						ERROR.INCORRECT_TOGGLE_STATE,
						`Key ${s.stringify(key, manager)} is a toggle key whose on and off versions are both pressed, which is not a valid state. This should not happen if letting the manager manage the state.`,
						{ key }
					))
				}
				// eslint-disable-next-line @typescript-eslint/no-shadow
				let res
				if (!key.toggleOnPressed && !key.toggleOffPressed) {
					res = safeSetEmulatedToggleState(key, true, manager)
				} else if (key.toggleOnPressed) {
					res = safeSetEmulatedToggleState(key, false, manager)
				} else if (key.toggleOffPressed) {
					res = safeSetEmulatedToggleState(key, true, manager)
				}
				if (res?.isError) return res
			}
		}
	}
	return Result.Ok(true)
}

