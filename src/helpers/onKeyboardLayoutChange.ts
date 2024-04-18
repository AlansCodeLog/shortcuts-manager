/**
	* The spec describes a ["layoutchange" event](https://wicg.github.io/keyboard-map/#layoutchange-event) that can be added to the navigator.keyboard.
	*
	* I have not found a browser that implements it.
	*
	* But this should safely attach to the event if it exists and call the given callback if it does.
	*
	* It will return true if it managed to attach.
	*/
export function onKeyboardLayoutChange(cb: () => void | Promise<void>): boolean {
	// castType<Navigator>(navigator) // not working during build
	if (typeof navigator !== "undefined" && "keyboard" in navigator && "addEventListener" in (navigator.keyboard as any)) {
		(navigator.keyboard as any).addEventListener(cb)
		return true
	}
	return false
}
