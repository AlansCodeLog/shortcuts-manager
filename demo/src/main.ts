import "./assets/tailwind.css"

import { library } from "@fortawesome/fontawesome-svg-core"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
// import {  } from "@fortawesome/free-regular-svg-icons"
// todo add exports needed list to component lib
import { faChevronUp, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons"
import { type App as AppType, createApp } from "vue"

import App from "./App.vue"

import { registerComponents } from "@alanscodelog/vue-components"
import { fa, LibButton, LibCheckbox, LibInput, LibNotifications, LibRecorder } from "@alanscodelog/vue-components/components"


const components = { LibInput, LibRecorder, LibButton, fa, LibCheckbox, LibNotifications }
// @ts-expect-error ...wat
library.add(faPlus, faTrash, faGithub, faTimes, faChevronUp)
createApp(App)
	// .use(VueComponentsPlugin)
	.use({
		install(app: AppType) {
			registerComponents(app, components)
		},
	})
	.mount("#app")
