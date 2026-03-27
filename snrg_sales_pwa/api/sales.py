import frappe
from frappe.utils import flt


@frappe.whitelist()
def get_customers(search="", page=0, page_size=20):
	"""Return a paginated list of active ERPNext customers."""
	page = int(page)
	page_size = int(page_size)

	filters = [["Customer", "disabled", "=", 0]]
	or_filters = []

	if search:
		or_filters = [
			["Customer", "name", "like", f"%{search}%"],
			["Customer", "customer_name", "like", f"%{search}%"],
		]

	return frappe.get_list(
		"Customer",
		filters=filters,
		or_filters=or_filters if or_filters else None,
		fields=["name", "customer_name", "territory", "customer_group"],
		order_by="customer_name asc",
		limit_start=page * page_size,
		limit_page_length=page_size,
		ignore_permissions=False,
	)


@frappe.whitelist()
def get_items(search="", page=0, page_size=20):
	"""Return a paginated list of active sellable items."""
	page = int(page)
	page_size = int(page_size)

	filters = [["Item", "disabled", "=", 0], ["Item", "is_sales_item", "=", 1]]
	or_filters = []

	if search:
		or_filters = [
			["Item", "item_code", "like", f"%{search}%"],
			["Item", "item_name", "like", f"%{search}%"],
		]

	return frappe.get_list(
		"Item",
		filters=filters,
		or_filters=or_filters if or_filters else None,
		fields=["name", "item_code", "item_name", "item_group", "stock_uom"],
		order_by="item_name asc",
		limit_start=page * page_size,
		limit_page_length=page_size,
		ignore_permissions=False,
	)


@frappe.whitelist()
def get_quotations(search="", page=0, page_size=20):
	"""Return a paginated list of quotations, newest first."""
	page = int(page)
	page_size = int(page_size)

	filters = [["Quotation", "quotation_to", "=", "Customer"]]
	or_filters = []

	if search:
		or_filters = [
			["Quotation", "name", "like", f"%{search}%"],
			["Quotation", "customer_name", "like", f"%{search}%"],
			["Quotation", "party_name", "like", f"%{search}%"],
		]

	return frappe.get_list(
		"Quotation",
		filters=filters,
		or_filters=or_filters if or_filters else None,
		fields=["name", "customer_name", "party_name as customer",
				"transaction_date", "grand_total", "status"],
		order_by="transaction_date desc",
		limit_start=page * page_size,
		limit_page_length=page_size,
		ignore_permissions=False,
	)


@frappe.whitelist()
def get_notification_count():
	"""Return unread notification count for the current user."""
	count = frappe.db.count(
		"Notification Log",
		{"for_user": frappe.session.user, "read": 0}
	)
	return {"count": count}


@frappe.whitelist()
def get_notifications(limit=15):
	"""Return recent notifications for the current user."""
	limit = int(limit)
	user = frappe.session.user

	notifications = frappe.get_list(
		"Notification Log",
		filters={"for_user": user},
		fields=["name", "subject", "type", "document_type",
				"document_name", "read", "creation"],
		order_by="creation desc",
		limit_page_length=limit,
		ignore_permissions=True,
	)

	unread_count = frappe.db.count(
		"Notification Log",
		{"for_user": user, "read": 0}
	)

	return {"notifications": notifications, "unread_count": unread_count}


@frappe.whitelist(methods=["POST"])
def mark_notification_read(name):
	"""Mark a single notification as read."""
	frappe.db.set_value("Notification Log", name, "read", 1)
	frappe.db.commit()
	return True


@frappe.whitelist(methods=["POST"])
def mark_all_notifications_read():
	"""Mark all notifications as read for the current user."""
	frappe.db.sql(
		"UPDATE `tabNotification Log` SET `read`=1 WHERE `for_user`=%s AND `read`=0",
		frappe.session.user,
	)
	frappe.db.commit()
	return True


@frappe.whitelist()
def get_item_prices_batch(item_codes, customer=None):
	"""Return price-list rates for a batch of item codes.

	Uses the customer's default price list (if set), falling back to
	the system-wide Selling Settings price list.
	"""
	import json

	if isinstance(item_codes, str):
		item_codes = json.loads(item_codes)

	# Determine price list
	price_list = (
		frappe.db.get_single_value("Selling Settings", "selling_price_list")
		or "Standard Selling"
	)
	if customer:
		cust_pl = frappe.db.get_value("Customer", customer, "default_price_list")
		if cust_pl:
			price_list = cust_pl

	result = {}
	for item_code in item_codes:
		row = frappe.db.get_value(
			"Item Price",
			{
				"item_code": item_code,
				"price_list": price_list,
				"selling": 1,
			},
			["price_list_rate", "uom"],
			as_dict=True,
		) or {}
		uom = row.get("uom") or frappe.db.get_value("Item", item_code, "stock_uom") or "Nos"
		result[item_code] = {
			"rate": flt(row.get("price_list_rate", 0)),
			"uom": uom,
		}

	return result


@frappe.whitelist(methods=["POST"])
def create_quotation(customer, items, custom_offline_id=None):
	"""Create a Sales Quotation in Draft status.

	Returns the quotation name, or the existing name if the same
	offline_id was already submitted (idempotency).
	"""
	import json

	if isinstance(items, str):
		items = json.loads(items)

	# Idempotency: prevent duplicate offline submissions
	if custom_offline_id:
		existing = frappe.db.get_value(
			"Quotation", {"custom_offline_id": custom_offline_id}, "name"
		)
		if existing:
			return {"quotation": existing, "duplicate": True}

	company = (
		frappe.defaults.get_user_default("Company")
		or frappe.db.get_single_value("Global Defaults", "default_company")
	)
	price_list = (
		frappe.db.get_single_value("Selling Settings", "selling_price_list")
		or "Standard Selling"
	)
	cust_pl = frappe.db.get_value("Customer", customer, "default_price_list")
	if cust_pl:
		price_list = cust_pl

	doc = frappe.new_doc("Quotation")
	doc.quotation_to       = "Customer"
	doc.party_name         = customer
	doc.company            = company
	doc.transaction_date   = frappe.utils.nowdate()
	doc.selling_price_list = price_list

	# Store offline ID for idempotency (field may not exist on older installs)
	if custom_offline_id:
		try:
			doc.custom_offline_id = custom_offline_id
		except Exception:
			pass

	for item in items:
		doc.append("items", {
			"item_code": item.get("item_code"),
			"qty":       flt(item.get("qty", 1)),
			"rate":      flt(item.get("rate", 0)),
		})

	doc.flags.ignore_permissions = True
	doc.insert()

	return {"quotation": doc.name, "duplicate": False}
