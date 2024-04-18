import type { Context, RawContext } from "./types/index.js"


export function createContext<TContext extends RawContext>(
	value: TContext["value"],
	rawContext: Omit<TContext, "value"> = {} as any
): Context<TContext["value"]> {
	const context: Context = {
		type: "context",
		...rawContext,
		value,
	}
	return context
}
