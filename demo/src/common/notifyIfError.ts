import type { Result } from "@alanscodelog/utils"

import { notificationHandler } from "./notificationHandler.js"


export const notifyIfError = (res: Result<true, Error>): void => {
	if (res.isError) {
		void notificationHandler.notify({
			message: res.error.message,
		})
	}
}
