def use_homepage_template(context):
    """Keep the old website hook callable until running sites refresh their hook cache."""
    doc = context.get("doc")
    if getattr(doc, "doctype", None) == "Web Page" and getattr(doc, "route", None) == "priyu-home":
        return {"template": "www/priyu-website.html"}
