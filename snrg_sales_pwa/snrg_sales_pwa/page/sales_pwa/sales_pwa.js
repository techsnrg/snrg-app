// Hide the entire Frappe desk chrome (navbar + page title bar + sidebar toggle)
// so the PWA looks like a native app with no browser/desk UI
function hideDeskChrome() {
	$("header.navbar").hide();
	$(".page-head").hide();
	$(".layout-side-section").hide();
	// Stretch the content area to fill the freed space
	$(".layout-main").css({ "margin-top": 0, "padding-top": 0 });
	$("body").addClass("snrg-pwa-mode");
}

function showDeskChrome() {
	$("header.navbar").show();
	$(".page-head").show();
	$(".layout-side-section").show();
	$(".layout-main").css({ "margin-top": "", "padding-top": "" });
	$("body").removeClass("snrg-pwa-mode");
}

frappe.pages["sales-pwa"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: "Sales",
		single_column: true,
	});

	// Inject PWA manifest link into <head> so the browser can discover it
	if (!document.querySelector('link[rel="manifest"]')) {
		var manifestLink = document.createElement("link");
		manifestLink.rel = "manifest";
		manifestLink.href = "/assets/snrg_sales_pwa/js/manifest.webmanifest";
		document.head.appendChild(manifestLink);
	}

	// Register service worker — served from site public root so scope covers /app/sales-pwa
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.register("/sw.js")
			.then(function (reg) {
				console.log("[Sales PWA] SW registered, scope:", reg.scope);
			})
			.catch(function (err) {
				console.warn("[Sales PWA] SW registration failed:", err);
			});
	}

	// Remove default Frappe padding — Vue owns the full layout
	var $section = $(wrapper).find(".layout-main-section");
	$section.css({ padding: 0, overflow: "hidden" });
	$section.html(
		'<div id="snrg-sales-pwa-app" style="height:100%;overflow-y:auto;">' +
			'<div style="display:flex;align-items:center;justify-content:center;' +
			'height:200px;color:#6b7280;font-size:14px;">Loading…</div>' +
		"</div>"
	);

	frappe.require("assets/snrg_sales_pwa/js/sales_pwa.js", function () {
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
	hideDeskChrome();

	var el = document.getElementById("snrg-sales-pwa-app");
	if (el && !el.__vue_app__ && typeof window.__mountSalesPWA === "function") {
		window.__mountSalesPWA();
	}
};

frappe.pages["sales-pwa"].on_page_hide = function (wrapper) {
	// Restore the desk chrome when user navigates to any other Frappe page
	showDeskChrome();
};
