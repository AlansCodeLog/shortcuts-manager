import type { NotificationHandler } from "@alanscodelog/vue-components/helpers/NotificationHandler.js"
import type { InjectionKey } from "vue"


export const notificationHandlerSymbol: InjectionKey<NotificationHandler> = Symbol("notificationHandler")

