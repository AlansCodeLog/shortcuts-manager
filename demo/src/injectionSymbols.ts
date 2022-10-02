import { NotificationHandler } from "@alanscodelog/vue-components/src/helpers"
import { InjectionKey } from "vue"
export const notificationHandlerSymbol: InjectionKey<NotificationHandler> = Symbol("notificationHandler")
