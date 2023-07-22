declare module "*.vue" {

	const component: DefineComponent<{}, {}, any>
	// eslint-disable-next-line import/no-default-export
	export default component
}
export { }

import { GlobalComponentTypes } from "@alanscodelog/vue-components"
declare module "@vue/runtime-core" {
	export interface GlobalComponents extends GlobalComponentTypes { }
}

import { NavigatorWKeyboard } from "@lib/types"
import { DefineComponent } from "vue"


declare global {
	// interface Navigator extends NavigatorWKeyboard {}
	interface Navigator {
		keyboard: NavigatorWKeyboard["keyboard"]
		shared: boolean
	}
}

