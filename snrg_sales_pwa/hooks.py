app_name = "snrg_sales_pwa"
app_title = "SNRG Sales PWA"
app_publisher = "SNRG"
app_description = "Sales Quotation PWA for the SNRG sales team"
app_email = "admin@snrg.in"
app_license = "MIT"

# No app_include_js — bundle is loaded on-demand by the page JS only

# Fixtures — imported on every bench migrate, ensures the Page record always exists
fixtures = [
    {"dt": "Page", "filters": [["name", "=", "sales-pwa"]]}
]
