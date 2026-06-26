import frappe

@frappe.whitelist(allow_guest=True)
def submit_contact(**kwargs):
    try:
        contact = frappe.get_doc({
            "doctype": "PF Contact Inquiry",
            "full_name": kwargs.get("full_name"),
            "phone": kwargs.get("phone"),
            "email": kwargs.get("email"),
            "city": kwargs.get("city"),
            "inquiry_type": kwargs.get("inquiry_type"),
            "message": kwargs.get("message"),
            "submission_date": frappe.utils.today(),
            "status": "New"
        })
        contact.insert(ignore_permissions=True)
        frappe.db.commit()
        return {
            "status": "success",
            "message": "Your message has been sent successfully"
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Contact Submit Error")
        return {
            "status": "error",
            "message": str(e)
        }

@frappe.whitelist(allow_guest=True)
def submit_volunteer(**kwargs):
    try:
        volunteer = frappe.get_doc({
            "doctype": "PF Volunteer Application",
            "full_name": kwargs.get("full_name"),
            "phone": kwargs.get("phone"),
            "email": kwargs.get("email"),
            "city": kwargs.get("city"),
            "age": kwargs.get("age"),
            "profession": kwargs.get("profession"),
            "interest_blood": kwargs.get("interest_blood", 0),
            "interest_elder": kwargs.get("interest_elder", 0),
            "interest_rescue": kwargs.get("interest_rescue", 0),
            "interest_lastrites": kwargs.get("interest_lastrites", 0),
            "interest_events": kwargs.get("interest_events", 0),
            "interest_social": kwargs.get("interest_social", 0),
            "interest_education": kwargs.get("interest_education", 0),
            "availability": kwargs.get("availability"),
            "message": kwargs.get("message"),
            "application_date": frappe.utils.today(),
            "status": "New"
        })
        volunteer.insert(ignore_permissions=True)
        frappe.db.commit()
        return {
            "status": "success",
            "message": "Volunteer application submitted successfully"
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Volunteer Submit Error")
        return {
            "status": "error",
            "message": str(e)
        }