import type { Manager, PickManager, Shortcut } from "shortcuts-manager"


export const shortcutToId = (
	shortcut: Shortcut,
	manager: PickManager<"options", "stringifier"> & Pick<Manager, "keys" >
): string => [
	shortcut.enabled,
	manager.options.stringifier.stringify(shortcut.chain, manager),
	shortcut.command ?? "",
	shortcut.condition.text,
].join("--")
