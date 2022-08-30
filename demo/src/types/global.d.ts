declare module "*.vue" {

	const component: DefineComponent<{}, {}, any>
	// eslint-disable-next-line import/no-default-export
	export default component
}
export { }
import { fa, LibButton, LibDebug, LibGroup, LibInput, LibNotifications, LibPalette, LibTable } from "@alanscodelog/vue-components/dist/components"
import { NavigatorWKeyboard } from "@lib/types"
import { DefineComponent } from "vue"


declare global {
	// interface Navigator extends NavigatorWKeyboard {}
	interface Navigator {
		keyboard: NavigatorWKeyboard["keyboard"]
		shared: boolean
	}
}



declare module '@vue/runtime-core' {
	export interface GlobalComponents {
		LibInput: typeof LibInput
		LibTable: typeof LibTable
		LibButton: typeof LibButton
		LibNotifications: typeof LibNotifications
		LibDebug: typeof LibDebug
		LibPalette: typeof LibPalette
		LibGroup: typeof LibGroup
		fa: typeof fa
	}
}
