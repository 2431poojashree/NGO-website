import frappe

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

@frappe.whitelist(allow_guest=True)
def submit_donation(**kwargs):
    try:
        donor = get_or_create_donor(
            kwargs.get("donor_name"),
            kwargs.get("donor_phone"),
            kwargs.get("donor_email")
        )
        donation = frappe.get_doc({
            "doctype": "PF Donation Record",
            "donor": donor,
            "donor_name": kwargs.get("donor_name"),
            "donor_phone": kwargs.get("donor_phone"),
            "donor_type": kwargs.get("donor_type", "Individual"),
            "amount": kwargs.get("amount"),
            "donation_date": frappe.utils.today(),
            "donation_purpose": kwargs.get("donation_purpose"),
            "payment_mode": kwargs.get("payment_mode"),
            "transaction_id": kwargs.get("transaction_id"),
            "donation_status": "Pending Verification",
            "receipt_80g": kwargs.get("receipt_80g", 0),
            "pan_number": kwargs.get("pan_number")
        })
        donation.insert(ignore_permissions=True)
        frappe.db.commit()
        return {
            "status": "success",
            "message": "Donation recorded successfully",
            "donation_id": donation.name
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Donation Submit Error")
        return {
            "status": "error",
            "message": str(e)
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