import re
from math import isfinite

import frappe
from frappe.utils import cint, cstr, flt

@frappe.whitelist(allow_guest=True)
def get_donation_purposes():
    return frappe.get_all(
        "PF Donation Purpose",
        filters={"is_active": 1},
        fields=[
            "name",
            "purpose_name_en",
            "purpose_name_hi",
            "purpose_code",
            "display_color",
            "display_icon",
            "target_amount",
            "display_order"
        ],
        order_by="display_order asc"
    )

@frappe.whitelist(allow_guest=True)
def get_donation_settings():
    settings = frappe.get_single("PF Donation Settings")
    from priyungo.donation.razorpay import checkout_mode

    show_language_switch = settings.get("show_donation_language_switch")
    return {
        "razorpay_mode": checkout_mode(settings),
        "default_language": "en" if settings.get("default_donation_language") == "English" else "hi",
        "show_language_switch": 1 if show_language_switch is None else cint(show_language_switch),
        "bank_acc_name": settings.bank_acc_name,
        "bank_acc_no": settings.bank_acc_no,
        "bank_ifsc": settings.bank_ifsc,
        "bank_branch": settings.bank_branch,
        "bank_mmid": settings.bank_mmid,
        "bank_acc_type": settings.bank_acc_type,
        "upi_id": settings.upi_id,
        "upi_qr_image": settings.upi_qr_image,
        "min_donation": settings.min_donation,
        "enable_online": settings.enable_online,
        "thankyou_hi": settings.thankyou_hi,
        "thankyou_en": settings.thankyou_en
    }

@frappe.whitelist(allow_guest=True, methods=["POST"])
def submit_donation(**kwargs):
    if kwargs.get("payment_mode") == "Online Portal":
        return {"status": "error", "code": "unavailable", "message": "Use Razorpay checkout for online payments."}
    details, error = validate_donation(kwargs)
    if error:
        return error
    donation = insert_pending_donation(details, kwargs)
    return {
        "status": "success",
        "message": "Donation recorded. Payment verification is pending.",
        "donation_id": donation.name,
    }


def validate_donation(values):
    donor_name = cstr(values.get("donor_name")).strip()
    donor_phone = cstr(values.get("donor_phone")).strip()
    purpose = cstr(values.get("donation_purpose")).strip()
    amount = flt(values.get("amount"))
    minimum = flt(frappe.db.get_single_value("PF Donation Settings", "min_donation"))

    invalid_field = None
    if not isfinite(amount) or amount <= 0 or amount < minimum:
        invalid_field = "amount"
    elif not donor_name or not donor_phone:
        invalid_field = "donor"
    elif not purpose or not frappe.db.exists("PF Donation Purpose", {"name": purpose, "is_active": 1}):
        invalid_field = "purpose"

    elif cint(values.get("receipt_80g")) and not re.fullmatch(
        r"[A-Za-z]{5}[0-9]{4}[A-Za-z]", cstr(values.get("pan_number")).strip()
    ):
        invalid_field = "pan"

    if invalid_field:
        messages = {
            "amount": "Enter a valid donation amount.",
            "donor": "Enter your name and phone number.",
            "purpose": "Choose an active donation purpose.",
            "pan": "Enter a valid PAN for the 80G receipt.",
        }
        return None, {"status": "error", "code": invalid_field, "message": messages[invalid_field]}
    return {
        "donor_name": donor_name,
        "donor_phone": donor_phone,
        "amount": amount,
        "donation_purpose": purpose,
    }, None


def insert_pending_donation(details, values):
    donor = get_or_create_donor(details["donor_name"], details["donor_phone"], values.get("donor_email"))
    # Older sites use "done" for the donor link.
    donor_field = "donor" if frappe.get_meta("PF Donation Record").has_field("donor") else "done"
    donation = frappe.get_doc({
        "doctype": "PF Donation Record",
        donor_field: donor,
        **details,
        "donor_type": values.get("donor_type", "Individual"),
        "donation_date": frappe.utils.today(),
        "payment_mode": values.get("payment_mode"),
        "transaction_id": values.get("transaction_id"),
        "cheque_number": values.get("cheque_number"),
        "bank_names": values.get("bank_names"),
        "donation_status": "Pending Verification",
        "receipt_80g": values.get("receipt_80g", 0),
        "pan_number": cstr(values.get("pan_number")).strip().upper() if cint(values.get("receipt_80g")) else "",
    })
    return donation.insert(ignore_permissions=True)


def get_or_create_donor(name, phone, email=None):
    existing = frappe.db.get_value(
        "PF Donor",
        {"phone": phone},
        "name"
    )
    if existing:
        return existing
    donor = frappe.get_doc({
        "doctype": "PF Donor",
        "donor_name": name,
        "phone": phone,
        "email": email or "",
        "is_active": 1
    })
    donor.insert(ignore_permissions=True)
    return donor.name

@frappe.whitelist()
def get_donation_summary():
    frappe.only_for("System Manager")
    rows = frappe.get_list(
        "PF Donation Record",
        filters={"razorpay_mode": ["!=", "Test"]},
        fields=["donation_status", "count(name) as record_count"],
        group_by="donation_status",
        order_by="donation_status",
        limit_page_length=0,
    )
    counts = {row.donation_status: row.record_count for row in rows}
    return {
        "total": sum(counts.values()),
        "pending": counts.get("Pending Verification", 0),
        "verified": counts.get("Received & Verified", 0),
        "failed": counts.get("Failed", 0) + counts.get("Bounced", 0),
    }
