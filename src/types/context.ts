import type { Context } from "@/classes"


// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface RecursiveRecord {
	[key: string]: any | RecursiveRecord
}

/**
 *	{@link Context}'s options.
 *
 * Can be used to type the options to pass to a Context.
 *
 * ```ts
 *  const contextEquals: ConditionOptions<(typeof somePlugin | typeof otherPlugin)[]>["equals"] =
 * 	(self, context) => self.info. //autocompletes correctly
 *
 * const context = new Context("a", { eval: contextEval }, { }, plugins)
 * ```
 *
 * Note: Do NOT pass the type parameter like `[typeof somePlugin, typeof otherPlugin]`, it needs to be an array of a union of plugin types.
 */
export type ContextOptions<
	TValue = RecursiveRecord,
> = {
	/**
	 * If you have contexts that are more complicated than simple flat or nested objects (simple as in values should not be arrays), you will need to implement a custom `equals` method to use.
	 */
	equals?: (self: Context<TValue>, context: Context) => boolean
}
