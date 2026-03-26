import frappe


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
