// ─── Route hijack ────────────────────────────────────────────────────────────
// Vue Router (hash mode) uses hashes like  #/new-quote/customer  (leading /).
// Frappe routes use  #page-name  (no leading slash after #).
//
// In Frappe v15 the hashchange event calls  frappe.router.route()  (not
// frappe.route directly).  We patch BOTH just to be safe, and also intercept
// the hashchange event at the capture phase before Frappe's bubble-phase
// listener can act on Vue routes.
var _origFrappeRoute       = null;
var _origFrappeRouterRoute = null;
var _hashCaptureListener   = null;

function isVueHash() {
	// Vue hash-history routes always start with #/
	// Frappe routes look like  #sales-pwa  (no slash)
	return (window.location.hash || "").startsWith("#/");
}

function installRouteHijack() {
	if (_hashCaptureListener) return; // already installed

	// 1. Capture-phase hashchange listener — fires before Frappe's handler
	_hashCaptureListener = function (e) {
		if (isVueHash()) e.stopImmediatePropagation();
	};
	window.addEventListener("hashchange", _hashCaptureListener, true);

	// 2. Patch frappe.router.route  (called by Frappe v15's hashchange handler)
	if (frappe.router && typeof frappe.router.route === "function") {
		_origFrappeRouterRoute = frappe.router.route.bind(frappe.router);
		frappe.router.route = function () {
			if (isVueHash()) return Promise.resolve();
			return _origFrappeRouterRoute.apply(frappe.router, arguments);
		};
	}

	// 3. Patch frappe.route  (belt-and-suspenders for older/different builds)
	if (typeof frappe.route === "function") {
		_origFrappeRoute = frappe.route.bind(frappe);
		frappe.route = function () {
			if (isVueHash()) return Promise.resolve();
			return _origFrappeRoute.apply(frappe, arguments);
		};
	}
}

function uninstallRouteHijack() {
	if (_hashCaptureListener) {
		window.removeEventListener("hashchange", _hashCaptureListener, true);
		_hashCaptureListener = null;
	}
	if (_origFrappeRouterRoute) {
		frappe.router.route = _origFrappeRouterRoute;
		_origFrappeRouterRoute = null;
	}
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
