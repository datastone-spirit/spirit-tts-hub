// import "default-passive-events"; //去除touchstart谷歌警告
import { createApp } from "vue";
import { piniaStore } from "@/stores";
import App from "./App.vue";
import { setupRouter } from "./router";

// style
import "vuefinder/dist/style.css";
import "@/styles/index.scss";

// plugins
import { ElementPlusPlugin } from "@/plugins/element-plus";
import VueFinder from "vuefinder/dist/vuefinder";

async function setupApp() {
	const app = createApp(App);

	app.use(ElementPlusPlugin);
	app.use(VueFinder);
	app.use(piniaStore);
	await setupRouter(app);

	app.mount("#app");
}

setupApp();
