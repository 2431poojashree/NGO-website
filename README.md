### PriyuNgo

NGO website and donation management for Priyu Foundation

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app priyungo
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/priyungo
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

mit

### Donation page and Razorpay

After updating the app, run `bench --site YOUR_SITE migrate`. In Frappe Desk, open
**PF Donation Settings** to set **Default Donation Page Language** and
**Allow Visitors to Switch Language**. Publish at least one active **PF Donation Purpose**
for the donation form.

1. Start in Razorpay Test Mode. Enter the test Key ID and Key Secret in
   **PF Donation Settings**, then turn on **Enable Online Donation**.
2. Set Razorpay to automatically capture payments. To verify payments even if
   a donor closes their browser, register a webhook for `payment.captured` at
   `https://YOUR_DOMAIN/api/method/priyungo.donation.razorpay.webhook`. Store the
   webhook secret in **Razorpay Webhook Secret**. Use a different webhook secret
   for each mode. The endpoint needs a publicly reachable HTTPS site.
3. Test `/donate` and check that the captured payment creates a verified donation
   with **Razorpay Mode** set to **Test**. The donation dashboard excludes test records.
4. After Razorpay activates the merchant account and approves the website,
   switch to Live Mode and replace the test keys and webhook secret with the
   live values in **PF Donation Settings**. Set up auto-capture and the webhook
   in Live Mode as well. Live checkout requires a webhook secret.

Direct UPI, bank transfer, cash, and cheque submissions remain pending until
an administrator checks the payment.
