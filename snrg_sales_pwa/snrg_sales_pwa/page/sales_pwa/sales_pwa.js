frappe.pages["sales-pwa"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: "Sales",
		single_column: true,
	});

	// Remove default Frappe padding — Vue owns the full layout
	var $section = $(wrapper).find(".layout-main-section");
	$section.css({ padding: 0, overflow: "hidden" });
	$section.html(
		'<div id="snrg-sales-pwa-app" style="height:100%;">' +
			'<div style="display:flex;align-items:center;justify-content:center;' +
			'height:200px;color:#6b7280;font-size:14px;">Loading…</div>' +
		"</div>"
	);

	frappe.require("assets/snrg_sales_pwa/js/sales_pwa.js", function () {
		// Register service worker for PWA offline support
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/assets/snrg_sales_pwa/sw.js")
				.catch(function (err) {
					console.warn("[Sales PWA] SW registration failed:", err);
				});
		}

		if (typeof window.__mountSalesPWA === "function") {
			window.__mountSalesPWA();
		} else {
			document.getElementById("snrg-sales-pwa-app").innerHTML =
				'<div style="color:#ef4444;padding:24px;font-size:13px;">' +
				"Bundle not loaded. Run: <code>cd frontend && npm install && npm run build</code>" +
				"</div>";
		}
	});
};

frappe.pages["sales-pwa"].on_page_show = function (wrapper) {
	// Re-mount if the app was unmounted (e.g. page navigation away and back)
	var el = document.getElementById("snrg-sales-pwa-app");
	if (el && !el.__vue_app__ && typeof window.__mountSalesPWA === "function") {
		window.__mountSalesPWA();
	}
};
