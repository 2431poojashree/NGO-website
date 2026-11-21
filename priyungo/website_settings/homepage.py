from pathlib import Path

import frappe

HOMEPAGE_ROUTE = "priyu-home"
HOMEPAGE_TEMPLATE = "templates/pages/index.html"


def create_homepage():
    """Seed the editable homepage once while preserving any page the site already has."""
    if frappe.db.exists("Web Page", HOMEPAGE_ROUTE) or frappe.db.exists(
        "Web Page", {"route": HOMEPAGE_ROUTE}
    ):
        return

    content_path = Path(
        frappe.get_app_path("priyungo", "templates", "includes", "priyu_homepage.html")
    )
    frappe.get_doc({
        "doctype": "Web Page",
        "title": "Priyu Foundation - Seva Sanstha Indore",
        "route": HOMEPAGE_ROUTE,
        "published": 1,
        "content_type": "HTML",
        "main_section_html": content_path.read_text(encoding="utf-8"),
        "full_width": 0,
        "show_title": 0,
        "meta_description": "Priyu Foundation NGO serving humanity since 2021",
    }).insert(ignore_permissions=True, set_name=HOMEPAGE_ROUTE)


def use_homepage_template(context):
    doc = context.get("doc")
    if (
        getattr(doc, "doctype", None) == "Web Page"
        and doc.name == HOMEPAGE_ROUTE
        and doc.route == HOMEPAGE_ROUTE
    ):
        return {"template": HOMEPAGE_TEMPLATE, "priyu_homepage_document": True}
