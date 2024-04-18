import type { ConditionNode, ExpressionNode, GroupNode } from "@witchcraft/expressit/types"


declare module "*.vue" {

	const component: DefineComponent<{}, {}, any>
	
	export default component
}


import { type NavigatorWKeyboard } from "shortcuts-manager/types/index.js"
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

declare module "shortcuts-manager/types/index.js" {
	export interface Condition {
		ast?: ExpressionNode | ConditionNode | GroupNode
	}
}
export { }
