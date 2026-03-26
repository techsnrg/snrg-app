import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			// SW output goes to snrg_sales_pwa/public/ (not public/js/)
			// so it can be served at /assets/snrg_sales_pwa/sw.js
			outDir: "../snrg_sales_pwa/public",
			filename: "sw.js",
			// We register the SW manually in sales_pwa.js (Frappe page controller)
			injectRegister: false,
			manifest: {
				name: "SNRG Sales",
				short_name: "Sales",
				description: "Create Sales Quotations for SNRG customers",
				display: "standalone",
				orientation: "portrait-primary",
				start_url: "/sales-pwa",
				scope: "/",
				theme_color: "#2563eb",
				background_color: "#ffffff",
				icons: [
					{
						src: "/assets/snrg_sales_pwa/icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/assets/snrg_sales_pwa/icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/assets/snrg_sales_pwa/icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				// Precache all built JS/CSS so the app shell works offline
				globPatterns: ["**/*.{js,css}"],
				globDirectory: "../snrg_sales_pwa/public/js",
				skipWaiting: true,
				clientsClaim: true,
			},
		}),
	],

	build: {
		// Single IIFE bundle → no ES module import statements
		// frappe.require() loads scripts as plain <script> tags (not type="module")
		// so the bundle must be self-contained with no import/export syntax
		outDir: "../snrg_sales_pwa/public/js",
		emptyOutDir: false,
		rollupOptions: {
			input: "src/main.js",
			output: {
				format: "iife",
				entryFileNames: "sales_pwa.js",
				assetFileNames: "[name][extname]",
				// No manualChunks — everything inlined into one file
			},
		},
	},

	server: {
		port: 8080,
		proxy: {
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
			"/assets": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
		},
	},
});
