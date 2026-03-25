import frappe


@frappe.whitelist()
def get_customers(search="", page=0, page_size=20):
	"""
	Return a paginated list of active ERPNext customers for the sales rep picker.

	Args:
	    search (str): Substring to match against customer name or ID.
	    page (int): Zero-based page index.
	    page_size (int): Number of records per page.

	Returns:
	    list[dict]: Each record has: name, customer_name, territory, customer_group
	"""
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
