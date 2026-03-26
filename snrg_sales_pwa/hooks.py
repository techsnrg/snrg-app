app_name = "snrg_sales_pwa"
app_title = "SNRG Sales PWA"
app_publisher = "SNRG"
app_description = "Sales Quotation PWA for the SNRG sales team"
app_email = "admin@snrg.in"
app_license = "MIT"

# No app_include_js — bundle is loaded on-demand by the page JS only

# Ensure the Page record is created/exists on install and on every migrate
after_install = "snrg_sales_pwa.install.after_install"
after_migrate = ["snrg_sales_pwa.install.after_migrate"]
