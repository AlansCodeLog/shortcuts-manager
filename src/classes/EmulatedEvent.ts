export class EmulatedEvent<
	TType extends "keydown" | "keyup" | "mousedown" | "mouseup" | "wheel",
> {
	code!: TType extends "keydown" | "keyup" ? string : never
	button!: TType extends "mousedown" | "mouseup" ? number : never
	deltaY!: TType extends "wheel" ? number : never
	modifiers: string[]
	type: TType
	constructor(type: TType, info: Partial<EmulatedEvent<TType>> = {}, modifiers: string[] = []) {
		this.modifiers = modifiers
		this.type = type
		for (const property of Object.keys(info)) {
			(this as any)[property] = (info as any)[property]
		}
	}
	getModifierState(code: string): boolean {
		return this.modifiers.includes(code)
	}
}
