import "./assets/tailwind.css"

import { registerComponents, registerDirectives } from "@alanscodelog/vue-components"
import { fa,
	LibButton,
	LibCheckbox,
	LibFileInput,
	LibInput,
	LibLabel,
	LibNotifications,
	LibPopup,
	LibRecorder } from "@alanscodelog/vue-components/components"
import {
	vExtractRootEl,
} from "@alanscodelog/vue-components/directives/vExtractRootEl.js"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import {
	faCopy as farCopy,
} from "@fortawesome/free-regular-svg-icons"
// import {  } from "@fortawesome/free-regular-svg-icons"
// todo add exports needed list to component lib
import {
	faArrowRotateLeft,
	faArrowUpFromBracket,
	faChevronUp,
	faClone,
	faFileExport,
	faFileImport,
	faFloppyDisk,
	faLink,
	faPlus,
	faTimes,
	faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { type App, createApp } from "vue"

import AppComp from "./App.vue"


const components = {
	LibLabel,
	LibInput,
	LibRecorder,
	LibButton,
	fa,
	LibCheckbox,
	LibNotifications,
	LibFileInput,
	LibPopup,
}
library.add(
	faPlus,
	faTrash,
	faGithub,
	faTimes,
	faChevronUp,
	faFloppyDisk,
	faFileImport,
	faFileExport,
	faClone,
	faArrowRotateLeft,
	faArrowUpFromBracket,
	faLink,
	farCopy,
)
createApp(AppComp)
	// .use(VueComponentsPlugin)
	.use({
		install(app: App) {
			registerComponents(app, components)
			registerDirectives(app, { vExtractRootEl })
		},
	})
	.mount("#app")
