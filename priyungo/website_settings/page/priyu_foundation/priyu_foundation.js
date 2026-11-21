frappe.pages["priyu-foundation"].on_page_load = (wrapper) => {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Priyu Foundation"),
		single_column: true,
	});

	page.main.append(frappe.render_template("priyu_foundation", {}));
	page.set_primary_action(__("Open Website"), () => {
		window.open("/priyu-home", "_blank", "noopener");
	});
	if (frappe.model.can_write("Web Page")) {
		page.set_secondary_action(__("Edit Web Page"), () => {
			frappe.route_options = { route: "priyu-home" };
			frappe.set_route("List", "Web Page");
		});
	}
};
