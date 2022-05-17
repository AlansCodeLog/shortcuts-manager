
declare module "*.vue" {

	const component: DefineComponent<{}, {}, any>
	// eslint-disable-next-line import/no-default-export
	export default component
}
export { };
	import { NavigatorWKeyboard } from "shortcuts-visualizer/dist/types";
    import { DefineComponent } from "vue";

			declare global {
				// interface Navigator extends NavigatorWKeyboard {}
	interface Navigator {
		keyboard: NavigatorWKeyboard["keyboard"]
		shared:boolean
	}
}
