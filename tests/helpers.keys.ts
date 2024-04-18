import { walk } from "@alanscodelog/utils/walk.js"

import { createCommands } from "../src/createCommands.js"
import { createKey } from "../src/createKey.js"
import { createKeys } from "../src/createKeys.js"
import { createManager } from "../src/createManager.js"
import { keyOrder } from "../src/internal/keyOrder.js"
import type { Key } from "../src/types/index.js"


const a = createKey("a", { variants: ["aVariant"]}).unwrap()
const aVariant = createKey("aVariant", { variants: ["a"]}).unwrap()
const b = createKey("b").unwrap()
const c = createKey("c").unwrap()
const d = createKey("d").unwrap()
const e = createKey("e").unwrap()
const modA = createKey("modA", { isModifier: "native" }).unwrap()
const modB = createKey("modB", { isModifier: "native" }).unwrap()
const mouse1 = createKey("1", {
}).unwrap()
const mouse2 = createKey("2", {
}).unwrap()
const wheelUp = createKey("WheelUp", {
}).unwrap()
const wheelDown = createKey("WheelDown", {
}).unwrap()

const toggle1 = createKey("Digit1", { isToggle: "native" }).unwrap()
const toggle2 = createKey("Digit2", { isToggle: "native" }).unwrap()

export const k = {
	modA,
	modB,
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
	toggle1,
	toggle2,
}

export const keys = createKeys([
	modA,
	modB,
	
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
	toggle1,
	toggle2,

	
]).unwrap()
export const commands = createCommands([]).unwrap()

export const manager = createManager({
	keys,
	commands,
	options: {
		evaluateCondition(condition, context) {
			if (condition.text === "") return true
			return context.value.includes(condition)
		},
	},
}).unwrap()

export function deepClone<T>(obj: T): T {
	return walk(obj, undefined, { save: true })
}


const modMouse1 = createKey("mod1", {
	variants: ["1"],
	isModifier: "native",
}).unwrap()
const modToggleMouse3 = createKey("3", {
	
	isModifier: "native",
	isToggle: "emulated",
}).unwrap()
const modToggle = createKey("ControlLeft", {
	
	isModifier: "native",
	isToggle: "emulated",
}).unwrap()
const toggleMouse4 = createKey("4", {
	
	isToggle: "emulated",
}).unwrap()
const toggleWheelUp = createKey("toggleWheelUp", {
	variants: ["WheelUp"],
	isToggle: "emulated",
}).unwrap()
const toggleWheelDown = createKey("toggleWheelDown", {
	variants: ["WheelDown"],
	isToggle: "emulated",
}).unwrap()
const modToggleWheelUp = createKey("modToggleWheelUp", {
	variants: ["WheelUp"],
	isToggle: "emulated",
	isModifier: "native",
}).unwrap()
const modToggleWheelDown = createKey("modToggleWheelDown", {
	variants: ["WheelDown"],
	isModifier: "native",
	isToggle: "emulated",
}).unwrap()
const modWheelUp = createKey("modWheelUp", {
	variants: ["WheelUp"],
	isModifier: "native",
}).unwrap()
const modWheelDown = createKey("modWheelDown", {
	variants: ["WheelDown"],
	isModifier: "native",
}).unwrap()

/** NOTE these contain invalid variant pairs on purporse, just for testing */
export const properOrderExtraKeys = [
	modMouse1,
	modWheelDown,
	modWheelUp,
	modToggle,
	modToggleMouse3,
	modToggleWheelDown,
	modToggleWheelUp,
	toggleMouse4,
	toggleWheelDown,
	toggleWheelUp,
]

export const properOrder: string[] = [
	k.modA.id,
	k.modB.id,
	modMouse1.id,
	modWheelDown.id,
	modWheelUp.id,
	modToggle.id,
	modToggle.toggleOffId!,
	modToggle.toggleOnId!,
	modToggleMouse3.id,
	modToggleMouse3.toggleOffId!,
	modToggleMouse3.toggleOnId!,
	modToggleWheelDown.id,
	modToggleWheelDown.toggleOffId!,
	modToggleWheelDown.toggleOnId!,
	modToggleWheelUp.id,
	modToggleWheelUp.toggleOffId!,
	modToggleWheelUp.toggleOnId!,
	k.a.id,
	k.b.id,
	k.c.id,
	k.mouse1.id,
	k.mouse2.id,
	k.wheelDown.id,
	k.wheelUp.id,
	k.toggle1.id,
	k.toggle1.toggleOffId!,
	k.toggle1.toggleOnId!,
	k.toggle2.id,
	k.toggle2.toggleOffId!,
	k.toggle2.toggleOnId!,
	toggleMouse4.id,
	toggleMouse4.toggleOffId!,
	toggleMouse4.toggleOnId!,
	toggleWheelDown.id,
	toggleWheelDown.toggleOffId!,
	toggleWheelDown.toggleOnId!,
	toggleWheelUp.id,
	toggleWheelUp.toggleOffId!,
	toggleWheelUp.toggleOnId!,
]
// inspect the key sort type
// console.log(properOrder.map(key => `${key} - ${KEY_SORT_POS[keyOrder(k[key as keyof typeof k], KEY_SORT_POS)]}`).join("\n"));
