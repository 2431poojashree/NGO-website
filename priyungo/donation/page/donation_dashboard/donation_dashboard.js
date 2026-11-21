frappe.pages["donation-dashboard"].on_page_load = (wrapper) => {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Donation Dashboard"),
		single_column: true,
	});
	const summary = $("<div>").addClass("row").appendTo(page.main);
	const status = $("<p>").attr("role", "status").addClass("text-muted").appendTo(page.main);
	const labels = [
		["total", __("Total records")],
		["pending", __("Pending verification")],
		["verified", __("Received and verified")],
		["failed", __("Failed or bounced")],
	];
	const values = {};
	for (const [key, label] of labels) {
		const column = $("<div>").addClass("col-6 col-lg-3 mb-3").appendTo(summary);
		const card = $("<div>").addClass("border rounded p-3 h-100").appendTo(column);
		$("<div>").addClass("text-muted").text(label).appendTo(card);
		values[key] = $("<div>").addClass("h3 mt-2 mb-0").text("—").appendTo(card);
	}

	const refresh = async () => {
		status.text(__("Loading donations…"));
		try {
			const { message } = await frappe.call("priyungo.donation.api.get_donation_summary");
			for (const [key] of labels) {
				values[key].text(message[key]);
			}
			status.text("");
		} catch {
			status.text(__("Could not load donation records. Use Refresh to try again."));
		}
	};

	page.set_primary_action(__("Donation Records"), () => {
		frappe.set_route("List", "PF Donation Record");
	});
	page.set_secondary_action(__("Refresh"), refresh);
	page.add_menu_item(__("Open Website"), () => window.open("/", "_blank", "noopener"));
	page.add_menu_item(__("Donation Settings"), () => {
		frappe.set_route("Form", "PF Donation Settings", "PF Donation Settings");
	});
	page.add_menu_item(__("Homepage Settings"), () => {
		frappe.set_route("Form", "PF Homepage Settings", "PF Homepage Settings");
	});
	wrapper.refresh_donation_summary = refresh;
};

frappe.pages["donation-dashboard"].on_page_show = (wrapper) => {
	wrapper.refresh_donation_summary();
};
