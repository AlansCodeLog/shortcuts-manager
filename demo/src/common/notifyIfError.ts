import type { Result } from "@alanscodelog/utils/Result.js"

import { notificationHandler } from "./notificationHandler.js"


export const notifyIfError = <T extends Result<any, Error>>(res: T): T => {
	if (res.isError) {
		void notificationHandler.notify({
			message: res.error.message,
			options: ["Ok"],
			timeout: true,
			cancellable: "Ok",
		})
	}
	return res
}
