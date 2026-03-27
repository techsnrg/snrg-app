// ─── Route hijack ────────────────────────────────────────────────────────────
// Frappe's router listens to `hashchange` events. Vue Router (hash mode) uses
// hashes like  #/new-quote/customer  (leading slash).  Frappe routes use
// #page-name  (no leading slash).  While the PWA overlay is visible we patch
// frappe.route so it silently ignores any hash that starts with "#/" — those
// belong to Vue and must not trigger Frappe's page loader.
var _origFrappeRoute = null;

function installRouteHijack() {
	if (_origFrappeRoute) return; // already installed
	_origFrappeRoute = frappe.route.bind(frappe);
	frappe.route = function () {
		var hash = window.location.hash || "";
		if (hash.startsWith("#/")) {
			// Vue Router's route — do nothing and let Vue handle it.
			return Promise.resolve();
		}
		return _origFrappeRoute.apply(frappe, arguments);
	};
}

function uninstallRouteHijack() {
	if (_origFrappeRoute) {
		frappe.route = _origFrappeRoute;
		_origFrappeRoute = null;
	}
}

// ─── Desk chrome ─────────────────────────────────────────────────────────────
function hideDeskChrome() {
	$("header.navbar").hide();
	$(".page-head").hide();
	$(".layout-side-section").hide();
	$(".layout-main").css({ "margin-top": 0, "padding-top": 0 });
	$("body").addClass("snrg-pwa-mode");

	var el = document.getElementById("snrg-sales-pwa-app");
	if (el) el.style.display = "flex";
}

function showDeskChrome() {
	$("header.navbar").show();
	$(".page-head").show();
	$(".layout-side-section").show();
	$(".layout-main").css({ "margin-top": "", "padding-top": "" });
	$("body").removeClass("snrg-pwa-mode");

	var el = document.getElementById("snrg-sales-pwa-app");
	if (el) el.style.display = "none";
}

// ─── Page lifecycle ───────────────────────────────────────────────────────────
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

	// Create the full-screen overlay (position:fixed fills entire viewport)
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
	installRouteHijack(); // stop Frappe reacting to Vue hash changes

	var el = document.getElementById("snrg-sales-pwa-app");
	if (el && !el.__vue_app__ && typeof window.__mountSalesPWA === "function") {
		window.__mountSalesPWA();
	}
};

frappe.pages["sales-pwa"].on_page_hide = function (wrapper) {
	uninstallRouteHijack(); // restore normal Frappe routing for other pages
	showDeskChrome();
};
