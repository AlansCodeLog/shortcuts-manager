import { Context } from "@/classes"


function generateContexts(names: string[]): Context[] {
	const contexts: Context[] = []
	// eslint-disable-next-line no-bitwise
	for (let i = 0; i < (1 << names.length); i++) {
		const context: Record<string, boolean> = {}
		for (let j = names.length - 1; j >= 0; j--) {
			// eslint-disable-next-line no-bitwise
			context[names[j]] = Boolean(i & (1 << j))
		}
		contexts.push(new Context(context))
	}
	return contexts
}
