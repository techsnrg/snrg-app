import os
import shutil

import frappe


def after_install():
	ensure_page_exists()
	ensure_custom_field_exists()
	deploy_service_worker()


def after_migrate():
	ensure_page_exists()
	deploy_service_worker()


def deploy_service_worker():
	"""
	Copy sw.js to the site's public root so Nginx serves it at /sw.js.
	This gives the service worker scope over the whole origin (including /app/sales-pwa).
	Without this, the SW at /assets/snrg_sales_pwa/sw.js can only control
	/assets/snrg_sales_pwa/* which does not cover the Frappe desk pages.
	"""
	sw_src = frappe.get_app_path("snrg_sales_pwa", "public", "sw.js")
	workbox_src = frappe.get_app_path("snrg_sales_pwa", "public", "workbox-8c29f6e4.js")
	site_public = os.path.join(frappe.get_site_path(), "public")

	os.makedirs(site_public, exist_ok=True)

	if os.path.exists(sw_src):
		shutil.copy2(sw_src, os.path.join(site_public, "sw.js"))

	if os.path.exists(workbox_src):
		shutil.copy2(workbox_src, os.path.join(site_public, "workbox-8c29f6e4.js"))


def ensure_page_exists():
	if frappe.db.exists("Page", "sales-pwa"):
		return

	page = frappe.get_doc(
		{
			"doctype": "Page",
			"name": "sales-pwa",
			"title": "Sales PWA",
			"standard": "Yes",
			"system_page": 0,
		}
	)

	for role in ["Sales User", "Sales Manager", "System Manager"]:
		page.append("roles", {"role": role})

	page.insert(ignore_permissions=True)
	frappe.db.commit()
	frappe.msgprint("Sales PWA page created successfully.")


def ensure_custom_field_exists():
	if frappe.db.exists("Custom Field", "Quotation-custom_offline_id"):
		return

	cf = frappe.get_doc(
		{
			"doctype": "Custom Field",
			"dt": "Quotation",
			"fieldname": "custom_offline_id",
			"label": "PWA Offline ID",
			"fieldtype": "Data",
			"length": 50,
			"read_only": 1,
			"hidden": 1,
			"no_copy": 1,
			"description": "UUID assigned by the Sales PWA for offline idempotency.",
		}
	)
	cf.insert(ignore_permissions=True)
	frappe.db.commit()
