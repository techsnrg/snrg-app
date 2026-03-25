import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

function mount() {
	const el = document.getElementById("snrg-sales-pwa-app");
	if (!el) return;
	// Avoid double-mounting if Frappe navigates away and back
	if (el.__vue_app__) return;
	createApp(App).mount(el);
}

// Called by the Frappe page controller (sales_pwa.js) after frappe.require
window.__mountSalesPWA = mount;

// Also mount immediately when loaded via Vite dev server (index.html)
if (import.meta.env.DEV) {
	mount();
}
