import frappe


def after_install():
	ensure_page_exists()
	ensure_custom_field_exists()


def after_migrate():
	ensure_page_exists()


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
