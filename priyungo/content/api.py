import frappe

@frappe.whitelist(allow_guest=True)
def get_services():
    return frappe.get_all(
        "PF Service",
        filters={"is_active": 1},
        fields=[
            "service_title_en",
            "service_title_hi",
            "icon",
            "short_desc",
            "long_desc",
            "cover_image",
            "stats_label",
            "display_order",
            "is_featured"
        ],
        order_by="display_order asc"
    )

@frappe.whitelist(allow_guest=True)
def get_impact_stats():
    return frappe.get_all(
        "PF Impact Stat",
        filters={"is_visible": 1},
        fields=[
            "stat_label_en",
            "stat_label_hi",
            "stat_number",
            "stat_suffix",
            "color",
            "icon",
            "display_order"
        ],
        order_by="display_order asc"
    )

@frappe.whitelist(allow_guest=True)
def get_gallery(category=None, media_type=None):
    filters = {"is_active": 1}
    if category:
        filters["category"] = category
    if media_type:
        filters["media_type"] = media_type
    return frappe.get_all(
        "PF Gallery Item",
        filters=filters,
        fields=[
            "name",
            "title",
            "media_type",
            "image",
            "video_url",
            "thumbnail",
            "category",
            "caption_hi",
            "caption_en",
            "event_date",
            "is_featured"
        ],
        order_by="display_order asc"
    )

@frappe.whitelist(allow_guest=True)
def get_featured_gallery():
    return frappe.get_all(
        "PF Gallery Item",
        filters={"is_active": 1, "is_featured": 1},
        fields=[
            "name",
            "title",
            "media_type",
            "image",
            "video_url",
            "thumbnail",
            "category",
            "caption_hi",
            "caption_en"
        ],
        order_by="display_order asc",
        limit=6
    )

@frappe.whitelist(allow_guest=True)
def get_team():
    return frappe.get_all(
        "PF Team Member",
        filters={"is_active": 1},
        fields=[
            "member_name",
            "role_hi",
            "role_en",
            "profile_photo",
            "short_bio",
            "display_order",
            "is_featured"
        ],
        order_by="display_order asc"
    )