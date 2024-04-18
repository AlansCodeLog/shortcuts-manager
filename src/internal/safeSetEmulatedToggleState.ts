import { setKeyProp } from "../setKeyProp.js"
import type { Key, KeySetEntries, Manager } from "../types/index.js"


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function safeSetEmulatedToggleState<
	THooks extends Manager["hooks"],
>(
	key: Key,
	value: boolean,
	manager: KeySetEntries["toggleOnPressed" | "toggleOffPressed"]["manager"] & { hooks?: THooks }
) {
	const res = setKeyProp(key, "toggleOnPressed", value, manager, { check: "only" })
	if (res.isOk) {
		const res2 = setKeyProp(key, "toggleOffPressed", !value, manager, { check: "only" })
		if (res2.isOk) {
			setKeyProp(key, "toggleOnPressed", value, manager, { check: false })
			setKeyProp(key, "toggleOffPressed", !value, manager, { check: false })
		}
		return res2
	}
	return res
}

