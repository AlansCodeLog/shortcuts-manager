/// <reference types="vite/client" />

declare module "*.vue" {
	import { DefineComponent } from "vue";


	const component: DefineComponent<{}, {}, any>
	// eslint-disable-next-line import/no-default-export
	export default component
}
