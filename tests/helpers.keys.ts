import { Key } from "shortcuts-manager/classes/Key.js"


const a = new Key("a", { variants: ["aVariant"]})
const aVariant = new Key("aVariant", { variants: ["a"]})
const b = new Key("b")
const c = new Key("c")
const d = new Key("d")
const e = new Key("e")
const modA = new Key("modA", { is: { modifier: true } })
const modB = new Key("modB", { is: { modifier: true } })
const mouse1 = new Key("1", {
})
const mouse2 = new Key("2", {
})
const wheelUp = new Key("WheelUp", {
})
const wheelDown = new Key("WheelDown", {
})
const modMouse1 = new Key("1", {
	is: {
		modifier: true,
	},
})
const modToggleMouse3 = new Key("3", {
	is: {
		modifier: true,
		toggle: "emulated",
	},
})
const modToggle = new Key("ControlLeft", {
	is: {
		modifier: true,
		toggle: "emulated",
	},
})
const toggleMouse4 = new Key("4", {
	is: {
		toggle: "emulated",
	},
})
const toggleWheelUp = new Key("WheelUp", {
	is: {
		toggle: "emulated",
	},
})
const toggleWheelDown = new Key("WheelDown", {
	is: {
		toggle: "emulated",
	},
})
const modToggleWheelUp = new Key("WheelUp", {
	is: {
		toggle: "emulated",
		modifier: true,
	},
})
const modToggleWheelDown = new Key("WheelDown", {
	is: {
		modifier: true,
		toggle: "emulated",
	},
})
const modWheelUp = new Key("WheelUp", {
	is: {
		modifier: true,
	},
})
const modWheelDown = new Key("WheelDown", {
	is: {
		modifier: true,
	},
})
const toggle1 = new Key("Digit1", { is: { toggle: true } })
const toggle2 = new Key("Digit2", { is: { toggle: true } })
const explicitToggle = new Key("CapsLock", { is: { toggle: "native" } })

export const k = {
	modA,
	modB,
	modMouse1,
	modWheelDown,
	modWheelUp,
	modToggle,
	modToggleMouse3,
	modToggleWheelDown,
	modToggleWheelUp,
	a,
	aVariant,
	b,
	c,
	d,
	e,
	mouse1,
	mouse2,
	wheelDown,
	wheelUp,
	explicitToggle,
	toggle1,
	toggle2,
	toggleMouse4,
	toggleWheelDown,
	toggleWheelUp,
}


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

// inspect the key sort type
// console.log(properOrder.map(key => `${key} - ${KEY_SORT_POS[keyOrder(key, KEY_SORT_POS)]}`).join("\n"));
