import type { NotificationHandler } from "@alanscodelog/vue-components/helpers"
import type { InjectionKey } from "vue"
export const notificationHandlerSymbol: InjectionKey<NotificationHandler> = Symbol("notificationHandler")
