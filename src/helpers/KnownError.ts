import type { ERROR, ErrorInfo, TYPE_ERROR } from "../types/index.js"


/**
 * Creates a known error that extends the base Error with some extra information.
 * All the variables used to create the error message are stored in it's info property so you can easily craft your own error messages to show to users.
 */
export class KnownError<
	T extends ERROR | TYPE_ERROR = ERROR | TYPE_ERROR,
	TInfo extends ErrorInfo<T> = ErrorInfo<T>,
> extends Error {
	code: T

	info: TInfo

	constructor(
		code: T,
		str: string,
		info: TInfo,
	) {
		super(str)
		this.code = code
		this.info = info
	}
}
