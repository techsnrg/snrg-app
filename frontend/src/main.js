import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import "./index.css";

function mount() {
	const el = document.getElementById("snrg-sales-pwa-app");
	if (!el) return;
	if (el.__vue_app__) return;
	createApp(App).use(router).mount(el);
}

window.__mountSalesPWA = mount;

if (import.meta.env.DEV) {
	mount();
}
