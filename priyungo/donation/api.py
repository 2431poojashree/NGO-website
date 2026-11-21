from math import isfinite

import frappe
from frappe.utils import flt

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
    return {
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
    donor_name = (kwargs.get("donor_name") or "").strip()
    donor_phone = (kwargs.get("donor_phone") or "").strip()
    purpose = kwargs.get("donation_purpose")
    amount = flt(kwargs.get("amount"))
    minimum = flt(frappe.db.get_single_value("PF Donation Settings", "min_donation"))
    if not isfinite(amount) or amount <= 0 or amount < minimum:
        return {"status": "error", "message": "Enter a valid donation amount."}
    if not donor_name or not donor_phone:
        return {"status": "error", "message": "Enter your name and phone number."}
    if not purpose or not frappe.db.exists("PF Donation Purpose", {"name": purpose, "is_active": 1}):
        return {"status": "error", "message": "Choose an active donation purpose."}

    donor = get_or_create_donor(donor_name, donor_phone, kwargs.get("donor_email"))
    # Older sites use "done" for the donor link.
    donor_field = "donor" if frappe.get_meta("PF Donation Record").has_field("donor") else "done"
    donation = frappe.get_doc({
        "doctype": "PF Donation Record",
        donor_field: donor,
        "donor_name": donor_name,
        "donor_phone": donor_phone,
        "donor_type": kwargs.get("donor_type", "Individual"),
        "amount": amount,
        "donation_date": frappe.utils.today(),
        "donation_purpose": purpose,
        "payment_mode": kwargs.get("payment_mode"),
        "transaction_id": kwargs.get("transaction_id"),
        "cheque_number": kwargs.get("cheque_number"),
        "bank_names": kwargs.get("bank_names"),
        "donation_status": "Pending Verification",
        "receipt_80g": kwargs.get("receipt_80g", 0),
        "pan_number": kwargs.get("pan_number"),
    })
    donation.insert(ignore_permissions=True)
    return {
        "status": "success",
        "message": "Donation recorded. Payment verification is pending.",
        "donation_id": donation.name,
    }


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
