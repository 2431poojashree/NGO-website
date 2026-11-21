(() => {
  const page = document.getElementById("donation-page");
  if (!page) return;

  const form = document.getElementById("donation-form");
  const amount = form.elements.amount;
  const purpose = form.elements.donation_purpose;
  const method = form.elements.payment_mode;
  const receipt = form.elements.receipt_80g;
  const pan = form.elements.pan_number;
  const button = document.getElementById("donate-submit-btn");
  const feedback = document.getElementById("donation-result");
  const languages = document.getElementById("donation-languages");
  const dialog = document.getElementById("donation-dialog");
  const dialogTitle = document.getElementById("donation-dialog-title");
  const dialogMessage = document.getElementById("donation-dialog-message");
  const translations = [...page.querySelectorAll("[data-en]")].map(node => [node, node.textContent.trim()]);
  const copy = {
    pay: ["भुगतान करें", "Pay securely"],
    submit: ["दान दर्ज करें", "Record donation"],
    processing: ["कृपया प्रतीक्षा करें…", "Please wait…"],
    amount: ["मान्य दान राशि दर्ज करें।", "Enter a valid donation amount."],
    online_amount: ["ऑनलाइन दान के लिए ₹1 या उससे ज़्यादा की मान्य राशि दर्ज करें।", "Enter a valid online donation amount of ₹1 or more."],
    donor: ["अपना नाम और मोबाइल नंबर दर्ज करें।", "Enter your name and mobile number."],
    name: ["अपना नाम दर्ज करें।", "Enter your full name."],
    mobile: ["अपना मोबाइल नंबर दर्ज करें।", "Enter your mobile number."],
    email: ["मान्य ईमेल दर्ज करें।", "Enter a valid email address."],
    pan: ["80G रसीद के लिए मान्य PAN नंबर दर्ज करें।", "Enter a valid PAN for the 80G receipt."],
    error_title: ["फ़ॉर्म की जानकारी जाँचें", "Check your donation details"],
    success_title: ["धन्यवाद", "Thank you"],
    pending_title: ["भुगतान की स्थिति", "Payment status"],
    purpose: ["दान का सक्रिय उद्देश्य चुनें।", "Choose an active donation purpose."],
    unavailable: ["ऑनलाइन भुगतान अभी उपलब्ध नहीं है।", "Online payment is currently unavailable."],
    load_failed: ["दान फ़ॉर्म लोड नहीं हुआ। पेज रीफ़्रेश करें।", "The donation form could not load. Refresh this page."],
    submit_failed: ["दान शुरू नहीं हो सका। कृपया फिर से कोशिश करें।", "The donation could not be started. Please try again."],
    closed: ["भुगतान विंडो बंद हो गई। अगर राशि कट गई है, दोबारा भुगतान से पहले संपर्क करें।",
      "Checkout closed. If money was debited, contact us before paying again."],
    recorded: ["दान की जानकारी दर्ज हो गई है। भुगतान का सत्यापन बाकी है।", "Your donation was recorded. Payment verification is pending."],
    pending: ["भुगतान का सत्यापन बाकी है। कृपया दोबारा भुगतान न करें।",
      "Payment confirmation is pending. Please do not pay again."],
    verified: ["भुगतान सत्यापित हो गया है। धन्यवाद!", "Your payment is verified. Thank you!"],
    test_verified: ["टेस्ट भुगतान सत्यापित हो गया। असली पैसे नहीं कटे।", "Test payment verified. No real money was charged."],
    reference: ["दान संदर्भ", "Donation reference"],
    upi: ["UPI ID", "UPI ID"],
    qr: ["UPI QR कोड", "UPI QR code"],
    holder: ["खाताधारक", "Account holder"],
    account: ["खाता संख्या", "Account number"],
    ifsc: ["IFSC कोड", "IFSC code"],
    branch: ["शाखा", "Branch"],
  };
  const online = "Online Portal";
  const upi = "UPI / GPay / PhonePe";
  const bank = "Bank Transfer / NEFT / RTGS";
  let language = "hi";
  let settings = {};
  let busy = false;
  let result;
  let returnFocus;

  const message = key => copy[key][language === "en" ? 1 : 0];

  function updateFeedback() {
    feedback.hidden = !result;
    if (!result) return;
    feedback.dataset.state = result.state;
    feedback.textContent = message(result.code);
    if (result.reference) feedback.append(` ${message("reference")}: ${result.reference}`);
  }

  function showFeedback(code, state, reference) {
    result = { code, state, reference };
    updateFeedback();
    feedback.focus();
  }

  function showDialog(code, state, reference, field) {
    showFeedback(code, state, reference);
    dialogTitle.textContent = message(`${state}_title`);
    dialogMessage.textContent = feedback.textContent;
    returnFocus = field;
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  dialog.addEventListener("close", () => {
    if (returnFocus) returnFocus.focus();
  });

  function validateForm() {
    const fields = [
      [amount, "amount"],
      [purpose, "purpose"],
      [form.elements.donor_name, "name"],
      [form.elements.donor_phone, "mobile"],
      [form.elements.donor_email, "email"],
      [pan, "pan"],
    ];
    for (const [field, code] of fields) {
      if (!field.checkValidity() || (field.required && !field.value.trim())) {
        field.setAttribute("aria-invalid", "true");
        showDialog(code, "error", null, field);
        return false;
      }
    }
    return true;
  }

  function setVisible(id, visible) {
    const group = document.getElementById(id);
    group.hidden = !visible;
    group.querySelectorAll("input").forEach(input => { input.disabled = !visible; });
  }

  function updatePayment() {
    const selected = method.value;
    setVisible("txn-group", selected === upi || selected === bank);
    setVisible("cheque-group", selected === "Cheque");
    setVisible("test-mode-notice", selected === online && settings.razorpay_mode === "Test");

    const details = document.getElementById("direct-payment-details");
    const content = document.getElementById("direct-payment-content");
    content.replaceChildren();
    const rows = selected === upi ? [["upi", settings.upi_id]] : selected === bank
      ? [["holder", settings.bank_acc_name], ["account", settings.bank_acc_no],
        ["ifsc", settings.bank_ifsc], ["branch", settings.bank_branch]]
      : [];
    for (const [label, value] of rows) {
      if (!value) continue;
      const line = document.createElement("p");
      line.textContent = `${message(label)}: ${value}`;
      content.append(line);
    }
    if (selected === upi && settings.upi_qr_image) {
      const url = new URL(settings.upi_qr_image, window.location.origin);
      if (["https:", "http:"].includes(url.protocol)) {
        const image = document.createElement("img");
        image.src = url;
        image.alt = message("qr");
        content.append(image);
      }
    }
    details.hidden = !content.childElementCount;
    amount.min = String(Math.max(selected === online ? 1 : 0.01, Number(settings.min_donation) || 0));
    button.textContent = message(busy ? "processing" : selected === online ? "pay" : "submit");
  }

  function applyLanguage(next) {
    language = next === "en" ? "en" : "hi";
    page.lang = language;
    for (const [node, hindi] of translations) {
      node.textContent = language === "en" ? node.dataset.en : hindi;
    }
    languages.querySelectorAll("button").forEach(control => {
      control.setAttribute("aria-pressed", String(control.dataset.language === language));
    });
    updatePayment();
    updateFeedback();
  }

  function updateReceipt() {
    setVisible("pan-group", receipt.checked);
    pan.required = receipt.checked;
  }

  async function api(endpoint, values) {
    const options = values ? {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Frappe-CSRF-Token": window.frappe?.csrf_token || "",
      },
      body: JSON.stringify(values),
    } : {};
    const response = await fetch(`/api/method/priyungo.donation.${endpoint}`, options);
    if (!response.ok) throw new Error("Donation API request failed");
    return (await response.json()).message;
  }

  function loadCheckout() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  async function checkout(values) {
    await loadCheckout();
    const order = await api("razorpay.create_checkout", values);
    if (order.status !== "ready") return order;

    return new Promise((resolve, reject) => {
      let confirming = false;
      const payment = new window.Razorpay({
        key: order.key,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: "Priyu Foundation",
        description: language === "en" ? "Donation" : "दान",
        prefill: {
          name: values.donor_name,
          contact: values.donor_phone,
          email: values.donor_email,
        },
        modal: {
          ondismiss: () => {
            if (!confirming) resolve({ status: "closed", donation_id: order.donation_id });
          },
        },
        handler: async response => {
          confirming = true;
          try {
            const confirmation = await api("razorpay.confirm_checkout", {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            resolve({ donation_id: order.donation_id, ...confirmation });
          } catch {
            resolve({ status: "pending", donation_id: order.donation_id });
          }
        },
      });
      try {
        payment.open();
      } catch (error) {
        reject(error);
      }
    });
  }

  languages.addEventListener("click", event => {
    const control = event.target.closest("[data-language]");
    if (control) applyLanguage(control.dataset.language);
  });
  method.addEventListener("change", updatePayment);
  receipt.addEventListener("change", updateReceipt);
  form.addEventListener("input", event => event.target.removeAttribute("aria-invalid"));
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || button.disabled || !validateForm()) return;
    busy = true;
    button.disabled = true;
    result = null;
    updateFeedback();
    updatePayment();
    const values = Object.fromEntries(new FormData(form));

    try {
      const reply = values.payment_mode === online ? await checkout(values) : await api("api.submit_donation", values);
      if (reply.status === "verified") {
        showDialog(reply.mode === "Test" ? "test_verified" : "verified", "success", reply.donation_id);
      } else if (reply.status === "success") {
        showDialog("recorded", "success", reply.donation_id);
      } else if (reply.status === "pending" || reply.status === "ignored") {
        showDialog("pending", "pending", reply.donation_id);
      } else if (reply.status === "closed") {
        showFeedback("closed", "pending", reply.donation_id);
      } else {
        showFeedback(Object.hasOwn(copy, reply.code) ? reply.code : "submit_failed", "error");
      }
      if (["success", "verified", "pending", "ignored"].includes(reply.status)) {
        const chosenMethod = method.value;
        form.reset();
        method.value = chosenMethod;
        updateReceipt();
      }
    } catch {
      showFeedback("submit_failed", "error");
    } finally {
      busy = false;
      button.disabled = false;
      updatePayment();
    }
  });

  async function init() {
    updateReceipt();
    const requestedAmount = new URLSearchParams(window.location.search).get("amount");
    if (/^\d+(?:\.\d{1,2})?$/.test(requestedAmount) && Number(requestedAmount) > 0) {
      amount.value = requestedAmount;
    }
    try {
      const [configuration, purposes] = await Promise.all([
        api("api.get_donation_settings"),
        api("api.get_donation_purposes"),
      ]);
      settings = configuration;
      for (const entry of purposes) {
        const hindi = entry.purpose_name_hi || entry.purpose_name_en;
        const option = new Option(hindi, entry.name);
        option.dataset.en = entry.purpose_name_en || hindi;
        translations.push([option, hindi]);
        purpose.append(option);
      }
      if (settings.razorpay_mode) {
        const option = method.options[0];
        option.hidden = false;
        option.disabled = false;
        method.value = online;
      }
      languages.hidden = !settings.show_language_switch;
      applyLanguage(settings.default_language);
      button.disabled = !purposes.length;
      if (!purposes.length) showFeedback("purpose", "error");
    } catch {
      showFeedback("load_failed", "error");
    }
  }

  init();
})();
