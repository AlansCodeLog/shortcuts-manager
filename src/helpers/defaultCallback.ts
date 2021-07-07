/**
 * The default callback which throws an error and warns the developer they should use a callback to catch it.
 *
 * @internal
 */
export function defaultCallback<T extends Error>(e: T): void {
	if (typeof process === "object") {
		const testing = process.env.JEST_WORKER_ID !== undefined
		if (!testing) {
			// eslint-disable-next-line no-console
			console.warn(`No callback was specified to catch this error. It is reccomended you always use callbacks whenever possible.`)
		}
		throw e instanceof Error ? e : new Error(e)
	}
}
