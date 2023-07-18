// esm css exports not working #awaiting https://github.com/vitejs/vite/pull/7817
// import "@alanscodelog/vue-components/style.css"
import "../node_modules/@alanscodelog/vue-components/dist/style.css"
import { Command, Commands, Context, Key, Keys, Manager, Shortcut, Shortcuts } from "shortcuts-manager/classes"
import { MyLibPlugin } from "@alanscodelog/vue-components"
import App from "./App.vue"
import { library } from "@fortawesome/fontawesome-svg-core"
import { far } from "@fortawesome/free-regular-svg-icons"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { createApp } from "vue"


library.add(fas, far)
createApp(App)
	.use(MyLibPlugin)
	.mount("#app")
