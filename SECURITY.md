# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, please follow these steps:

1. **Email us directly** at: [your-email@example.com] (replace with your actual email)
2. **Include details** about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **We will respond** within 48 hours to acknowledge your report
4. **We will provide updates** on the progress of fixing the vulnerability
5. **Once fixed**, we will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **Never commit credentials** to your repository
2. **Use GitHub Secrets** for all sensitive information
3. **Rotate credentials regularly**
4. **Use App Passwords** for Gmail instead of regular passwords
5. **Limit AWS IAM permissions** to only what's needed (`ses:SendEmail`)
6. **Verify sender emails** in AWS SES before production use
7. **Monitor email delivery** for suspicious activity

### For Contributors

1. **Never log sensitive data** (passwords, tokens, etc.)
2. **Validate all inputs** before processing
3. **Use parameterized queries** (if applicable)
4. **Keep dependencies updated**
5. **Follow secure coding practices**

## Known Security Considerations

### SMTP Credentials
- Credentials are passed via GitHub Actions inputs (secrets)
- Credentials are never logged or exposed in output
- TLS/SSL is used by default for secure connections

### AWS SES
- AWS credentials are handled securely via GitHub Secrets
- No credentials are stored or cached
- IAM permissions should be limited to `ses:SendEmail` only

### Email Content
- Email content is not validated for malicious content
- Users are responsible for sanitizing template variables
- Attachments are sent as-is without scanning

## Disclosure Policy

- Security vulnerabilities will be disclosed after a fix is available
- We will credit the reporter (unless they prefer anonymity)
- A security advisory will be published on GitHub

## Security Updates

Security updates will be released as patch versions (e.g., 1.1.1, 1.1.2) and will be clearly marked in the CHANGELOG.

---

**Thank you for helping keep Action Mailer secure!** 🔒

