// Hide the entire Frappe desk chrome so the PWA looks like a native app
function hideDeskChrome() {
	$("header.navbar").hide();
	$(".page-head").hide();
	$(".layout-side-section").hide();
	$(".layout-main").css({ "margin-top": 0, "padding-top": 0 });
	$("body").addClass("snrg-pwa-mode");

	// Show the full-screen app overlay
	var el = document.getElementById("snrg-sales-pwa-app");
	if (el) el.style.display = "flex";
}

function showDeskChrome() {
	$("header.navbar").show();
	$(".page-head").show();
	$(".layout-side-section").show();
	$(".layout-main").css({ "margin-top": "", "padding-top": "" });
	$("body").removeClass("snrg-pwa-mode");

	// Hide the full-screen overlay so it doesn't sit on top of other Frappe pages
	var el = document.getElementById("snrg-sales-pwa-app");
	if (el) el.style.display = "none";
}

frappe.pages["sales-pwa"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: "Sales",
		single_column: true,
	});

	// Inject PWA manifest link into <head>
	if (!document.querySelector('link[rel="manifest"]')) {
		var manifestLink = document.createElement("link");
		manifestLink.rel = "manifest";
		manifestLink.href = "/assets/snrg_sales_pwa/js/manifest.webmanifest";
		document.head.appendChild(manifestLink);
	}

	// Register service worker at /sw.js so scope covers the full origin
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.register("/sw.js")
			.then(function (reg) {
				console.log("[Sales PWA] SW registered:", reg.scope);
			})
			.catch(function (err) {
				console.warn("[Sales PWA] SW registration failed:", err);
			});
	}

	// Create the app container as a fixed full-screen overlay.
	// position:fixed + inset:0 fills the ENTIRE viewport regardless of
	// Frappe's internal layout heights — this is the correct approach for a PWA.
	var appEl = document.createElement("div");
	appEl.id = "snrg-sales-pwa-app";
	appEl.style.cssText = [
		"position:fixed",
		"inset:0",
		"z-index:1000",
		"display:flex",
		"flex-direction:column",
		"background:#f9fafb",
		"overflow:hidden",
	].join(";");
	appEl.innerHTML =
		'<div style="display:flex;align-items:center;justify-content:center;' +
		'flex:1;color:#6b7280;font-size:14px;">Loading…</div>';
	document.body.appendChild(appEl);

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
	showDeskChrome();
};
