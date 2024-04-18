import { isWhitespace } from "@alanscodelog/utils/isWhitespace.js"
import { readable } from "@alanscodelog/utils/readable.js"
import { Result } from "@alanscodelog/utils/Result.js"
import { ErrorToken } from "@witchcraft/expressit/ast/classes/ErrorToken.js"
import { extractTokens } from "@witchcraft/expressit/utils/extractTokens.js"
import type { Shortcut } from "shortcuts-manager/types/shortcuts.js"

import { conditionParser } from "./conditionParser.js"


export function parseShortcutCondition(shortcut: Shortcut) {
	if (shortcut.condition.text && !isWhitespace(shortcut.condition.text)) {
		const res = conditionParser.parse(shortcut.condition.text)
		if ("valid" in res && !res.valid) {
			// todo syntax highlighting
			const errorTokens = extractTokens(res).filter(t => t instanceof ErrorToken)
			return Result.Err(new Error(`Syntax error in shortcut condition: ${shortcut.condition.text}. Expected a ${readable(errorTokens[0].expected, { conjunction: "or" })} token at ${errorTokens[0].start}`))
		}
		if (res instanceof ErrorToken) {
			return Result.Err(new Error(`Syntax error in shortcut condition: ${shortcut.condition.text}. Expected a ${readable(res.expected, { conjunction: "or" })} token at ${res.start}`))
		}
		return Result.Ok(res)
	}
	return Result.Ok(undefined)
}
