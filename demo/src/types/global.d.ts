declare module "*.vue" {

	const component: DefineComponent<{}, {}, any>
	
	export default component
}
export { }

import { type NavigatorWKeyboard } from "@lib/types"
import { type DefineComponent } from "vue"


declare global {
	// interface Navigator extends NavigatorWKeyboard {}
	interface Navigator {
		keyboard: NavigatorWKeyboard["keyboard"]
		shared: boolean
	}
}

import { type GlobalComponentTypes } from "@alanscodelog/vue-components"


declare module "@vue/runtime-core" {
	export interface GlobalComponents extends GlobalComponentTypes { }
}
