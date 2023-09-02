import type { Shortcut } from "shortcuts-manager/classes/Shortcut.js"


export const shortcutToId = (shortcut: Shortcut): string => [shortcut.enabled, shortcut.stringifier.stringify(shortcut.chain), shortcut.command?.name ?? "", shortcut.condition.text].join("--")
