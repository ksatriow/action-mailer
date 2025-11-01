# 📧 Action Mailer

![version](https://img.shields.io/github/v/tag/yourusername/action-mailer?label=version)
![build](https://github.com/yourusername/action-mailer/actions/workflows/release.yml/badge.svg)
![license](https://img.shields.io/github/license/yourusername/action-mailer)
![marketplace](https://img.shields.io/badge/GitHub%20Marketplace-Action%20Mailer-blue?logo=github)

> Send beautiful and configurable emails directly from **GitHub Actions**, via **SMTP** or **AWS SES**, with support for **HTML templates**, **CC**, **BCC**, and **attachments**.

---

## 📘 Overview

**Action Mailer** is a GitHub Action that allows you to send rich HTML emails, alerts, or reports as part of your CI/CD pipeline.  
You can use either:
- **SMTP** (e.g., Gmail, Outlook, Zoho, custom mail servers), or
- **AWS SES** (Amazon Simple Email Service)

Perfect for:
- Build/deploy success/failure notifications  
- Daily or weekly reports  
- Monitoring alerts  
- Custom workflow notifications

---

## 🚀 Features

✅ Supports **SMTP** and **AWS SES**  
✅ **HTML Templates** with [Handlebars](https://handlebarsjs.com)  
✅ **CC / BCC** recipients  
✅ **Attachments** with wildcard support (`*.pdf`)  
✅ **Dynamic variables** in templates  
✅ Automatic provider detection (SMTP or SES)  
✅ Emoji-enhanced log output for better readability  

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

## ✉️ SMTP Example (Gmail)

```yaml
- name: Send Email via SMTP
  uses: ksatriow/action-mailer@v1
  with:
    smtp-server: smtp.gmail.com
    smtp-port: 465
    smtp-secure: true
    from-email: youremail@gmail.com
    to-email: recipient@example.com
    cc-email: team@example.com
    bcc-email: audit@example.com
    username: ${{ secrets.SMTP_USERNAME }}
    password: ${{ secrets.SMTP_PASSWORD }}
    subject: "✅ Deployment Success!"
    html-template: "./templates/success.html"
    template-variables: '{"name":"Satrio","job_name":"Build Pipeline","status":"SUCCESS","date":"'"$(date -u)"'"}'
    attachments: "./logs/*.txt,./reports/deploy-summary.pdf"
