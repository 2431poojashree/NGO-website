import hashlib
import hmac
import json
import re
from decimal import Decimal, InvalidOperation

import frappe
import requests
from frappe.rate_limiter import rate_limit
from frappe.utils import cint, cstr, today

from priyungo.donation.api import insert_pending_donation, validate_donation

API_URL = "https://api.razorpay.com/v1"
DONATION = "PF Donation Record"
CAPTURED_STATUS = "Received & Verified"


def checkout_mode(settings, *, require_enabled=True):
    if require_enabled and not cint(settings.enable_online):
        return None
    key = cstr(settings.razorpay_key).strip()
    if key.startswith("rzp_test_"):
        mode = "Test"
    elif key.startswith("rzp_live_"):
        mode = "Live"
    else:
        return None
    if require_enabled and (
        not _secret(settings, "razorpay_secret")
        or (mode == "Live" and not _secret(settings, "razorpay_webhook_secret"))
    ):
        return None
    return mode


def _secret(settings, field):
    return settings.get_password(field, raise_exception=False)


def _gateway_request(settings, method, path, payload=None):
    try:
        response = requests.request(
            method,
            API_URL + path,
            auth=(settings.razorpay_key.strip(), _secret(settings, "razorpay_secret")),
            json=payload,
            timeout=(3, 10),
        )
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        # Request and response bodies can contain payment details. Log neither.
        frappe.log_error(title="Razorpay API request failed", message=f"Operation: {method}")
        frappe.throw("Razorpay is temporarily unavailable. Please try again later.")


def _amount_in_paise(value):
    try:
        amount = Decimal(cstr(value))
        # Keep the amount within the precision of Frappe's Currency field.
        if amount.is_finite() and Decimal("1") <= amount < Decimal("1000000000000"):
            paise = amount * 100
            if paise == paise.to_integral_value():
                return int(paise)
    except InvalidOperation:
        pass
    return None


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=10, seconds=60)
def create_checkout(**values):
    """Create an INR order for the amount and donor details validated by Frappe."""
    settings = frappe.get_single("PF Donation Settings")
    mode = checkout_mode(settings)
    if not mode:
        return {"status": "error", "code": "unavailable"}

    amount = _amount_in_paise(values.get("amount"))
    if amount is None:
        return {"status": "error", "code": "online_amount"}
    details, error = validate_donation(values)
    if error:
        return error

    donation = insert_pending_donation(details, {
        "donor_email": values.get("donor_email"),
        "donor_type": values.get("donor_type", "Individual"),
        "receipt_80g": values.get("receipt_80g", 0),
        "pan_number": values.get("pan_number"),
        "payment_mode": "Online Portal",
    })
    order = _gateway_request(settings, "POST", "/orders", {
        "amount": amount,
        "currency": "INR",
        "receipt": hashlib.sha256(donation.name.encode()).hexdigest()[:40],
    })
    if not _valid_id(order.get("id"), "order") or order.get("amount") != amount or order.get("currency") != "INR":
        frappe.throw("Razorpay returned an invalid order.")
    donation.db_set({"razorpay_order_id": order["id"], "razorpay_mode": mode})
    return {
        "status": "ready",
        "key": settings.razorpay_key.strip(),
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "mode": mode,
        "donation_id": donation.name,
    }


def _valid_id(value, prefix):
    return bool(re.fullmatch(rf"{prefix}_[A-Za-z0-9]{{1,40}}", cstr(value)))


def _valid_signature(secret, payload, signature):
    if not secret or not re.fullmatch(r"[a-f0-9]{64}", cstr(signature)):
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _record_captured_payment(payment, mode):
    """Apply a trusted payment exactly once, including when a webhook races with checkout."""
    donation = frappe.db.get_value(
        DONATION,
        {"razorpay_order_id": payment.get("order_id")},
        ["name", "amount", "donation_status", "transaction_id", "razorpay_mode"],
        as_dict=True,
        for_update=True,
    )
    if not donation or donation.razorpay_mode != mode:
        return {"status": "ignored"}
    if (
        payment.get("status") != "captured"
        or payment.get("currency") != "INR"
        or payment.get("amount") != _amount_in_paise(donation.amount)
        or not _valid_id(payment.get("id"), "pay")
    ):
        return {"status": "pending"}

    if donation.donation_status == "Pending Verification":
        frappe.db.set_value(DONATION, donation.name, {
            "donation_status": CAPTURED_STATUS,
            "transaction_id": payment["id"],
            "payment_date": today(),
            "verification_date": today(),
        })
    elif donation.donation_status != CAPTURED_STATUS or donation.transaction_id != payment["id"]:
        return {"status": "pending"}
    return {"status": "verified", "donation_id": donation.name, "mode": mode}


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=30, seconds=60)
def confirm_checkout(order_id, payment_id, signature):
    if not _valid_id(order_id, "order") or not _valid_id(payment_id, "pay"):
        frappe.throw("Invalid payment reference.", frappe.PermissionError)
    donation = frappe.db.get_value(
        DONATION, {"razorpay_order_id": order_id}, ["razorpay_order_id", "razorpay_mode"], as_dict=True
    )
    settings = frappe.get_single("PF Donation Settings")
    mode = checkout_mode(settings, require_enabled=False)
    if not donation or not mode or donation.razorpay_mode != mode or not _valid_signature(
        _secret(settings, "razorpay_secret"), f"{donation.razorpay_order_id}|{payment_id}".encode(), signature
    ):
        frappe.throw("Invalid payment signature.", frappe.PermissionError)
    payment = _gateway_request(settings, "GET", f"/payments/{payment_id}")
    if payment.get("order_id") != order_id or payment.get("id") != payment_id:
        frappe.throw("Invalid payment reference.", frappe.PermissionError)
    return _record_captured_payment(payment, mode)


@frappe.whitelist(allow_guest=True, methods=["POST"])
def webhook():
    settings = frappe.get_single("PF Donation Settings")
    raw = frappe.request.get_data()
    signature = frappe.request.headers.get("X-Razorpay-Signature")
    if not _valid_signature(_secret(settings, "razorpay_webhook_secret"), raw, signature):
        frappe.throw("Invalid webhook signature.", frappe.PermissionError)
    event = json.loads(raw)
    if event.get("event") != "payment.captured":
        return {"status": "ignored"}

    payment = event.get("payload", {}).get("payment", {}).get("entity", {})
    mode = checkout_mode(settings, require_enabled=False)
    if not mode or not _valid_id(payment.get("order_id"), "order") or not _valid_id(payment.get("id"), "pay"):
        return {"status": "ignored"}
    return _record_captured_payment(payment, mode)
