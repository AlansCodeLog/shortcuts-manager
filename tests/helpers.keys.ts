import { Key, Keys } from "@/classes"


const keyA = new Key("a")
const keyB = new Key("b")
const keyC = new Key("c")
const modA = new Key("modA", { is: { modifier: true } })
const modB = new Key("modB", { is: { modifier: true } })
const mouse1 = new Key("mouse1", {
	is: {
		// mouse: 1
	},
})
const mouse2 = new Key("mouse2", {
	is: {
		// mouse: 2
	},
})
const wheelUp = new Key("wheelUp", {
	is: {
		// wheel: "up"
	},
})
const wheelDown = new Key("wheelDown", {
	is: {
		// wheel: "down"
	},
})
const modMouse1 = new Key("modMouse1", {
	is: {
		// mouse: 1,
		modifier: true,
	},
})
const modToggleMouse3 = new Key("modToggleMouse3", {
	is: {
		// mouse: 3,
		modifier: true,
		toggle: "emulated",
	},
})
const modToggle = new Key("modToggle", {
	is: {
		modifier: true,
		toggle: "emulated",
	},
})
const toggleMouse4 = new Key("toggleMouse4", {

	is: {
		// mouse: 4,
		toggle: "emulated",
	},
})
const toggleWheelUp = new Key("toggleWheelUp", {
	is: {
		// wheel: "up",
		toggle: "emulated",
	},
})
const toggleWheelDown = new Key("toggleWheelDown", {
	is: {
		// wheel: "down",
		toggle: "emulated",
	},
})
const modToggleWheelUp = new Key("modToggleWheelUp", {
	is: {
		// wheel: "up",
		toggle: "emulated",
		modifier: true,
	},
})
const modToggleWheelDown = new Key("modToggleWheelDown", {
	is: {
		// wheel: "down",
		modifier: true,
		toggle: "emulated",
	},
})
const modWheelUp = new Key("modWheelUp", {
	is: {
		// wheel: "up",
		modifier: true,
	},
})
const modWheelDown = new Key("modWheelDown", {
	is: {
		// wheel: "down",
		modifier: true,
	},
})
const toggle1 = new Key("toggle1", { is: { toggle: true } })
const toggle2 = new Key("toggle2", { is: { toggle: true } })
const explicitToggle = new Key("explicitToggle", { is: { toggle: "native" } })

export const keys = new Keys([
	toggleWheelUp,
	toggleWheelDown,
	toggleMouse4,
	toggle2,
	toggle1,
	explicitToggle,
	wheelUp,
	wheelDown,
	mouse2,
	mouse1,
	keyC,
	keyB,
	keyA,
	modToggleWheelUp,
	modToggleWheelDown,
	modToggleMouse3,
	modToggle,
	modWheelUp,
	modWheelDown,
	modMouse1,
	modB,
	modA,
])

export const k = keys.entries

export const reverseOrder = [
	k.toggleWheelUp,
	k.toggleWheelUp.on!,
	k.toggleWheelUp.off!,
	k.toggleWheelDown,
	k.toggleWheelDown.on!,
	k.toggleWheelDown.off!,
	k.toggleMouse4,
	k.toggleMouse4.on!,
	k.toggleMouse4.off!,
	k.toggle2,
	k.toggle2.on!,
	k.toggle2.off!,
	k.toggle1,
	k.toggle1.on!,
	k.toggle1.off!,
	k.explicitToggle,
	k.explicitToggle.on!,
	k.explicitToggle.off!,
	k.wheelUp,
	k.wheelDown,
	k.mouse2,
	k.mouse1,
	k.c,
	k.b,
	k.a,
	k.modToggleWheelUp,
	k.modToggleWheelUp.on!,
	k.modToggleWheelUp.off!,
	k.modToggleWheelDown,
	k.modToggleWheelDown.on!,
	k.modToggleWheelDown.off!,
	k.modToggleMouse3,
	k.modToggleMouse3.on!,
	k.modToggleMouse3.off!,
	k.modToggle,
	k.modToggle.on!,
	k.modToggle.off!,
	k.modWheelUp,
	k.modWheelDown,
	k.modMouse1,
	k.modB,
	k.modA,
]

export const properOrder = [
	k.modA,
	k.modB,
	k.modMouse1,
	k.modWheelDown,
	k.modWheelUp,
	k.modToggle,
	k.modToggle.off!,
	k.modToggle.on!,
	k.modToggleMouse3,
	k.modToggleMouse3.off!,
	k.modToggleMouse3.on!,
	k.modToggleWheelDown,
	k.modToggleWheelDown.off!,
	k.modToggleWheelDown.on!,
	k.modToggleWheelUp,
	k.modToggleWheelUp.off!,
	k.modToggleWheelUp.on!,
	k.a,
	k.b,
	k.c,
	k.mouse1,
	k.mouse2,
	k.wheelDown,
	k.wheelUp,
	k.explicitToggle,
	k.explicitToggle.off!,
	k.explicitToggle.on!,
	k.toggle1,
	k.toggle1.off!,
	k.toggle1.on!,
	k.toggle2,
	k.toggle2.off!,
	k.toggle2.on!,
	k.toggleMouse4,
	k.toggleMouse4.off!,
	k.toggleMouse4.on!,
	k.toggleWheelDown,
	k.toggleWheelDown.off!,
	k.toggleWheelDown.on!,
	k.toggleWheelUp,
	k.toggleWheelUp.off!,
	k.toggleWheelUp.on!,
]

/**
 * Generate the lists to paste here if we see the output is correct
 */
export function logOrder(sorted: Key[], reverse: boolean = false): void {
	let asVars = sorted.map(key => `k.${key.id.replace(/_(on|off)/, ".$1!")}`)
	asVars = reverse
		? asVars.reverse()
		: asVars
	console.log(asVars.join(",\n"))
}
