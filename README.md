<div align="center">

# 📧 Action Mailer

**Send beautiful, professional emails directly from GitHub Actions**

[![Version](https://img.shields.io/github/v/tag/ksatriow/action-mailer?label=version&style=for-the-badge)](https://github.com/ksatriow/action-mailer/releases)
[![License](https://img.shields.io/github/license/ksatriow/action-mailer?style=for-the-badge)](LICENSE)
[![Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-Action%20Mailer-blue?style=for-the-badge&logo=github)](https://github.com/marketplace)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-usage-examples) • [💡 Examples](#-usage-examples) • [❓ FAQ](#-frequently-asked-questions)

</div>

---

> **✨ The most powerful and flexible email action for GitHub Actions**  
> Send beautiful HTML emails via **SMTP** (Gmail, Outlook, SendGrid, etc.) or **AWS SES** with support for templates, attachments, CC/BCC, and more!

---

## 📘 Overview

**Action Mailer** is a production-ready GitHub Action that enables you to send beautiful, professional emails directly from your CI/CD pipelines. Whether you need deployment notifications, weekly reports, or custom alerts, Action Mailer has you covered.

### Why Action Mailer?

- 🎨 **Beautiful Templates** - Pre-built HTML templates with Handlebars support
- 🔌 **Multiple Providers** - SMTP (Gmail, Outlook, SendGrid, etc.) or AWS SES
- 📎 **Rich Attachments** - Support for files with glob patterns
- 🚀 **Zero Configuration** - Auto-detects provider based on your inputs
- 🔒 **Secure by Default** - Built with security best practices
- 📊 **Production Ready** - Used by teams worldwide

### Perfect For:

- ✅ Build/deploy success/failure notifications  
- 📊 Daily or weekly reports  
- 🚨 Monitoring alerts and incident notifications
- 📧 Custom workflow notifications
- 📈 CI/CD pipeline status updates
- 🎯 Team collaboration updates

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 📧 **Multiple Providers** | SMTP (Gmail, Outlook, SendGrid, Mailgun, etc.) or AWS SES |
| 🎨 **HTML Templates** | Beautiful templates with [Handlebars](https://handlebarsjs.com) support |
| 👥 **CC / BCC** | Support for multiple recipients with CC and BCC |
| 📎 **Attachments** | File attachments with glob pattern support (`*.pdf`, `logs/**/*.txt`) |
| 🔄 **Dynamic Variables** | Inject GitHub context and custom variables into templates |
| 🧠 **Auto-Detection** | Automatically detects SMTP or SES based on your configuration |
| 📊 **Rich Logging** | Emoji-enhanced logs for better readability and debugging |
| ✅ **Input Validation** | Comprehensive validation with helpful error messages |
| 🔒 **Security First** | Secure credential handling and TLS support |
| 🎯 **Production Ready** | Battle-tested and used in production environments |  

---

## 🧩 Inputs

| Name | Description | Required | Default |
|------|--------------|-----------|----------|
| `smtp-server` | SMTP hostname (e.g. `smtp.gmail.com`) | ❌ | |
| `smtp-port` | SMTP port number (e.g. 465 or 587) | ❌ | `465` |
| `smtp-secure` | Use secure TLS connection (true/false) | ❌ | `true` |
| `aws-region` | AWS region for SES | ❌ | |
| `username` | SMTP username or AWS access key ID | ❌ | |
| `password` | SMTP password or AWS secret key | ❌ | |
| `from-email` | Sender email address | ✅ | |
| `to-email` | Recipient email(s), comma-separated | ✅ | |
| `cc-email` | CC recipients, comma-separated | ❌ | |
| `bcc-email` | BCC recipients, comma-separated | ❌ | |
| `subject` | Email subject line | ✅ | |
| `body` | Plain text email body | ❌ | |
| `html-template` | Path to HTML template (Handlebars supported) | ❌ | |
| `template-variables` | JSON string containing key-value pairs for template replacement | ❌ | |
| `attachments` | File paths or glob patterns for attachments | ❌ | |
| `reply-to` | Reply-To email address | ❌ | |
| `custom-headers` | JSON string with custom email headers (e.g., `{"X-Custom-Header": "value"}`) | ❌ | |
| `dry-run` | Test mode - validates configuration without sending email (true/false) | ❌ | `false` |
| `debug` | Enable debug mode with verbose logging (true/false) | ❌ | `false` |
| `retry-count` | Number of retry attempts if email sending fails | ❌ | `0` |
| `retry-delay` | Delay in milliseconds between retries | ❌ | `1000` |

---

## 🧠 Auto Provider Detection

You don’t need to specify both SMTP and SES.

- If `smtp-server` is defined → uses SMTP.
- If `aws-region` is defined (and no SMTP server) → uses AWS SES.

---

## 🔐 Secrets Setup

Add the following secrets in your repository under:  
**Settings → Secrets → Actions → New Repository Secret**

| Secret | Description |
|--------|--------------|
| `SMTP_USERNAME` | Email username or full email address |
| `SMTP_PASSWORD` | SMTP password or App Password (for Gmail) |
| `AWS_ACCESS_KEY_ID` | AWS Access Key (if using SES) |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key (if using SES) |

---

## 🚀 Quick Start

Get started in 30 seconds! Here's the simplest example:

```yaml
- name: Send Email
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    smtp-port: 465
    from-email: ${{ secrets.FROM_EMAIL }}
    to-email: team@example.com
    username: ${{ secrets.SMTP_USERNAME }}
    password: ${{ secrets.SMTP_PASSWORD }}
    subject: "🚀 Deployment Successful!"
    body: "Your deployment completed successfully!"
```

**That's it!** 🎉 Your email will be sent automatically.

> 💡 **Tip**: Check out the [Examples](#-usage-examples) section for more advanced use cases.

---

## 📖 Usage Examples

### ✉️ SMTP Example (Gmail)

```yaml
name: Deploy and Notify

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and Deploy
        run: |
          echo "Building application..."
          # Your build commands here

      - name: Send Success Email
        uses: ksatriow/action-mailer@v1
        with:
          smtp-server: smtp.gmail.com
          smtp-port: 465
          smtp-secure: true
          from-email: ${{ secrets.FROM_EMAIL }}
          to-email: team@example.com
          cc-email: manager@example.com
          bcc-email: audit@example.com
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: "✅ Deployment Success - ${{ github.ref_name }}"
          html-template: "./templates/success.html"
          template-variables: |
            {
              "name": "${{ github.actor }}",
              "job_name": "${{ github.job }}",
              "status": "SUCCESS",
              "branch": "${{ github.ref_name }}",
              "commit": "${{ github.sha }}",
              "workflow": "${{ github.workflow }}"
            }
          attachments: "./logs/*.txt,./reports/deploy-summary.pdf"
```

### ☁️ AWS SES Example

```yaml
name: Weekly Report

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
  workflow_dispatch:

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Generate Report
        run: |
          echo "Generating weekly report..."
          # Your report generation logic

      - name: Send Weekly Report
        uses: ksatriow/action-mailer@v1
        with:
          aws-region: us-east-1
          from-email: reports@yourdomain.com
          to-email: team@example.com,stakeholders@example.com
          username: ${{ secrets.AWS_ACCESS_KEY_ID }}
          password: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          subject: "📊 Weekly Report - Week of ${{ github.run_number }}"
          html-template: "./templates/report.html"
          template-variables: |
            {
              "recipient": "Team",
              "week": "${{ github.run_number }}",
              "uptime": "99.9%",
              "deployments": "12",
              "failed_jobs": "0",
              "summary": "All systems operational"
            }
```

### 📝 Simple Text Email

```yaml
- name: Send Simple Notification
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    smtp-port: 587
    smtp-secure: false
    from-email: notifications@example.com
    to-email: admin@example.com
    username: ${{ secrets.SMTP_USERNAME }}
    password: ${{ secrets.SMTP_PASSWORD }}
    subject: "Build Completed"
    body: |
      Your build has completed successfully!
      
      Branch: ${{ github.ref_name }}
      Commit: ${{ github.sha }}
      Actor: ${{ github.actor }}
```

### 🚨 Failure Notification with Retry

```yaml
name: CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Tests
        id: test
        run: |
          npm test || exit 1

      - name: Notify on Failure
        if: failure()
        uses: ksatriow/action-mailer@v1
        with:
          smtp-server: smtp.gmail.com
          from-email: ${{ secrets.FROM_EMAIL }}
          to-email: devops@example.com
          reply-to: support@example.com
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: "❌ Build Failed - ${{ github.repository }}"
          body: |
            Build failed for repository: ${{ github.repository }}
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
            Workflow: ${{ github.workflow }}
            Actor: ${{ github.actor }}
          retry-count: 3
          retry-delay: 2000
          debug: true
```

### 🧪 Testing with Dry-Run

```yaml
- name: Test Email Configuration
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    from-email: ${{ secrets.FROM_EMAIL }}
    to-email: test@example.com
    username: ${{ secrets.SMTP_USERNAME }}
    password: ${{ secrets.SMTP_PASSWORD }}
    subject: "Test Email"
    body: "This is a test"
    dry-run: true  # Validates without sending
    debug: true    # See detailed logs
```

### 🏷️ Email with Custom Headers

```yaml
- name: Send Email with Custom Headers
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    from-email: ${{ secrets.FROM_EMAIL }}
    to-email: team@example.com
    reply-to: support@example.com
    username: ${{ secrets.SMTP_USERNAME }}
    password: ${{ secrets.SMTP_PASSWORD }}
    subject: "Priority: High - Deployment Alert"
    body: "Deployment completed"
    custom-headers: |
      {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "X-Custom-ID": "${{ github.run_id }}",
        "X-Workflow": "${{ github.workflow }}"
      }
```

---

## 🆕 New Features (v1.2.0)

### ✨ Reply-To Header
Set a custom reply-to address:
```yaml
reply-to: support@example.com
```

### 🏷️ Custom Headers
Add custom email headers:
```yaml
custom-headers: '{"X-Priority": "1", "X-Custom-ID": "12345"}'
```

### 🧪 Dry-Run Mode
Test your configuration without actually sending emails:
```yaml
dry-run: true
```

### 🔍 Debug Mode
Enable verbose logging for troubleshooting:
```yaml
debug: true
```

### 🔄 Retry Mechanism
Automatically retry failed email sends with exponential backoff:
```yaml
retry-count: 3
retry-delay: 2000  # milliseconds
```

### 📏 Email Size Validation
Automatic validation to prevent oversized emails (25MB for SMTP, 10MB for SES).

---

## 📤 Outputs

| Name | Description |
|------|-------------|
| `message-id` | The message ID returned by the email provider |
| `success` | Always set to `"true"` on successful send |

Example:
```yaml
- name: Send Email
  id: send-email
  uses: ksatriow/action-mailer@v1
  with:
    # ... your config

- name: Log Message ID
  run: echo "Email sent with ID: ${{ steps.send-email.outputs.message-id }}"
```

---

## 🔧 Common SMTP Providers

| Provider | SMTP Server | Port | Secure |
|----------|-------------|------|--------|
| Gmail | `smtp.gmail.com` | 465 or 587 | `true` |
| Outlook | `smtp-mail.outlook.com` | 587 | `false` |
| Yahoo | `smtp.mail.yahoo.com` | 465 or 587 | `true` |
| Zoho | `smtp.zoho.com` | 465 | `true` |
| SendGrid | `smtp.sendgrid.net` | 587 | `false` |
| Mailgun | `smtp.mailgun.org` | 587 | `false` |

**Note for Gmail:** You need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

---

## 🎨 Template Variables

You can use any variables in your Handlebars templates. The action automatically provides:

- `date` - Current ISO date string
- `timestamp` - Current Unix timestamp

Plus any custom variables you pass via `template-variables`.

**Example template usage:**
```html
<h1>Hello {{name}}!</h1>
<p>Status: <strong>{{status}}</strong></p>
<p>Date: {{date}}</p>
```

### 📧 Available Templates

We provide several pre-built templates in the `templates/` directory:

- **`success.html`** - Classic success notification template
- **`modern-success.html`** - Modern, gradient-based success template with animations
- **`failure.html`** - Professional failure notification with error details
- **`report.html`** - Weekly/monthly report template with tables

You can use these templates directly or customize them for your needs:

```yaml
html-template: "./templates/modern-success.html"
```

---

## ⚠️ Troubleshooting

### SMTP Connection Issues

- **"Connection timeout"**: Check your SMTP server and port
- **"Authentication failed"**: Verify username/password are correct
- **Gmail "Less secure app"**: Use an App Password instead of your regular password
- **Port 587 vs 465**: Use `smtp-secure: false` for port 587, `true` for 465

### AWS SES Issues

- **"Access Denied"**: Ensure your AWS credentials have `ses:SendEmail` permission
- **"Email not verified"**: Verify your sender email in AWS SES console (for sandbox mode)
- **Region mismatch**: Ensure `aws-region` matches your SES configuration

### Template Issues

- **"Template not found"**: Use absolute paths or paths relative to repository root
- **"Variable not defined"**: Check your JSON syntax in `template-variables`

### Attachment Issues

- **"File not found"**: Use glob patterns or absolute paths
- **Large files**: Consider file size limits of your email provider

---

## 🔒 Security Best Practices

### Credential Management

1. **Always use Secrets**: Never hardcode credentials in workflow files
   ```yaml
   # ❌ BAD
   username: myemail@gmail.com
   password: mypassword123
   
   # ✅ GOOD
   username: ${{ secrets.SMTP_USERNAME }}
   password: ${{ secrets.SMTP_PASSWORD }}
   ```

2. **Use App Passwords**: For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password

3. **Rotate Credentials**: Regularly rotate your SMTP passwords and AWS keys

4. **Limit Permissions**: For AWS SES, use IAM roles with minimal required permissions (`ses:SendEmail` only)

5. **Environment-Specific Secrets**: Use different secrets for different environments (dev, staging, prod)

### Email Security

- **Verify Sender**: Always verify sender email addresses in AWS SES
- **SPF/DKIM**: Ensure your domain has proper SPF and DKIM records
- **Rate Limiting**: Be mindful of email provider rate limits to avoid being flagged as spam

---

## 📚 Best Practices

1. **Use Secrets**: Never hardcode credentials in workflow files
2. **Verify Emails**: For AWS SES, verify sender email addresses first
3. **Template Organization**: Keep templates in a dedicated folder
4. **Error Handling**: Use `if: failure()` or `if: success()` conditions appropriately
5. **Rate Limiting**: Be mindful of email provider rate limits
6. **Test First**: Test with a small group before sending to large lists
7. **Use Semantic Versioning**: Pin to specific versions (`@v1`) instead of `@main`
8. **Monitor Email Delivery**: Set up monitoring for email delivery failures

---

## 🔗 Integration Examples

### With Slack (via Email)

```yaml
- name: Send to Slack Email Integration
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    from-email: ${{ secrets.FROM_EMAIL }}
    to-email: your-team.slack@slack.com  # Slack email integration
    subject: "🚀 Deployment Status"
    body: "Deployment completed successfully!"
```

### With PagerDuty

```yaml
- name: Alert PagerDuty
  if: failure()
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    from-email: ${{ secrets.FROM_EMAIL }}
    to-email: your-team@pagerduty.com
    subject: "🚨 Critical: Build Failed"
    body: "Build failed in ${{ github.repository }}"
```

### With Jira (via Email)

```yaml
- name: Create Jira Ticket via Email
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    from-email: ${{ secrets.FROM_EMAIL }}
    to-email: project+create@jira.atlassian.com
    subject: "[BUG] Build Failure in ${{ github.ref_name }}"
    body: |
      Build failed in repository: ${{ github.repository }}
      Branch: ${{ github.ref_name }}
      Commit: ${{ github.sha }}
```

---

## ❓ Frequently Asked Questions

### General Questions

**Q: Can I use this action with any email provider?**  
A: Yes! As long as your provider supports SMTP, you can use Action Mailer. We support Gmail, Outlook, SendGrid, Mailgun, AWS SES, and any custom SMTP server.

**Q: Do I need to set up both SMTP and AWS SES?**  
A: No! The action automatically detects which provider to use based on your inputs. If you provide `smtp-server`, it uses SMTP. If you provide `aws-region` (and no SMTP), it uses AWS SES.

**Q: Can I send emails to multiple recipients?**  
A: Yes! Use comma-separated values for `to-email`, `cc-email`, and `bcc-email`:
```yaml
to-email: user1@example.com,user2@example.com,user3@example.com
```

**Q: How do I use GitHub context variables in templates?**  
A: Pass them via `template-variables`:
```yaml
template-variables: |
  {
    "branch": "${{ github.ref_name }}",
    "actor": "${{ github.actor }}",
    "sha": "${{ github.sha }}"
  }
```

### Template Questions

**Q: Can I use Handlebars helpers in templates?**  
A: Yes! Handlebars supports helpers. You can use built-in helpers like `{{#if}}`, `{{#each}}`, etc.

**Q: How do I format dates in templates?**  
A: The action provides `date` (ISO string) and `timestamp` (Unix timestamp). For custom formatting, pass a formatted date in `template-variables`:
```yaml
template-variables: |
  {
    "formatted_date": "${{ github.event.head_commit.timestamp }}"
  }
```

**Q: Can I use nested objects in template variables?**  
A: Yes! Handlebars supports nested objects:
```yaml
template-variables: |
  {
    "user": {
      "name": "John",
      "email": "john@example.com"
    }
  }
```
Then use `{{user.name}}` in your template.

### Technical Questions

**Q: What's the maximum attachment size?**  
A: It depends on your email provider:
- Gmail: 25 MB
- AWS SES: 10 MB
- Most SMTP servers: 10-25 MB

**Q: Can I use this in a matrix strategy?**  
A: Yes! The action works perfectly with matrix strategies:
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
steps:
  - uses: ksatriow/action-mailer@v1
    with:
      subject: "Build on ${{ matrix.os }}"
```

**Q: How do I handle errors gracefully?**  
A: Use `continue-on-error: true`:
```yaml
- name: Send Email
  uses: ksatriow/action-mailer@v1
  continue-on-error: true
  with:
    # ... your config
```

**Q: Can I send emails conditionally?**  
A: Yes! Use `if` conditions:
```yaml
- name: Send on Success
  if: success()
  uses: ksatriow/action-mailer@v1
  # ...

- name: Send on Failure
  if: failure()
  uses: ksatriow/action-mailer@v1
  # ...
```

### AWS SES Questions

**Q: Do I need to verify my email in AWS SES?**  
A: Yes, if you're in SES sandbox mode. In production mode, you only need to verify the domain.

**Q: What AWS permissions do I need?**  
A: Your IAM user/role needs the `ses:SendEmail` permission. For production, you might also need `ses:SendRawEmail` if you want to send attachments.

**Q: Can I use IAM roles instead of access keys?**  
A: Currently, the action uses access keys. For IAM roles, you'd need to use AWS credentials from the environment (e.g., via `aws-actions/configure-aws-credentials`).

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation improvements
- 🎨 Template designs

Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please see our [Security Policy](SECURITY.md).

---

## 🙏 Acknowledgments

- Built with [Nodemailer](https://nodemailer.com/)
- Template engine powered by [Handlebars](https://handlebarsjs.com/)
- AWS integration via [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)
