import frappe

@frappe.whitelist(allow_guest=True)
def get_site_settings():
    settings = frappe.get_single("PF Site Settings")
    return {
        "site_logo": settings.site_logo,
        "site_name_en": settings.site_name_en,
        "site_name_hi": settings.site_name_hi,
        "tagline_en": settings.tagline_en,
        "tagline_hi": settings.tagline_hi,
        "phone_1": settings.phone_1,
        "phone_2": settings.phone_2,
        "email": settings.email,
        "address": settings.address,
        "map_link": settings.map_link,
        "facebook_url": settings.facebook_url,
        "instagram_url": settings.instagram_url,
        "youtube_url": settings.youtube_url,
        "upi_id": settings.upi_id,
        "upi_qr": settings.upi_qr,
        "bank_name": settings.bank_name,
        "account_number": settings.account_number,
        "ifsc_code": settings.ifsc_code,
        "branch_name": settings.branch_name,
        "footer_text": settings.footer_text
    }

@frappe.whitelist(allow_guest=True)
def get_homepage_settings():
    settings = frappe.get_single("PF Homepage Settings")
    return {
        "hero_title_en": settings.hero_title_en,
        "hero_title_hi": settings.hero_title_hi,
        "hero_subtitle_en": settings.hero_subtitle_en,
        "hero_subtitle_hi": settings.hero_subtitle_hi,
        "hero_bg_image": settings.hero_bg_image,
        "cta1_label": settings.cta1_label,
        "cta1_link": settings.cta1_link,
        "cta2_label": settings.cta2_label,
        "cta2_link": settings.cta2_link,
        "show_impact": settings.show_impact,
        "show_services": settings.show_services,
        "show_gallery": settings.show_gallery,
        "show_team": settings.show_team,
        "about_title_en": settings.about_title_en,
        "about_title_hi": settings.about_title_hi,
        "about_desc": settings.about_desc,
        "about_image": settings.about_image,
        "meta_title": settings.meta_title,
        "meta_desc": settings.meta_desc,
        "meta_keywords": settings.meta_keywords
    }