# Contributing to Action Mailer

Thank you for your interest in contributing to Action Mailer! 🎉

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub with:
- A clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment details (OS, Node version, etc.)

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow existing code style
- Add comments for complex logic
- Keep functions focused and small
- Add error handling where appropriate

### Testing

Before submitting a PR, please:
- Test with both SMTP and AWS SES (if possible)
- Test with templates and without
- Test with attachments
- Verify error handling works correctly

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ksatriow/action-mailer.git
cd action-mailer

# Install dependencies
npm install

# Test the action locally (you'll need to set up test credentials)
node index.js
```

## Questions?

Feel free to open an issue for any questions or concerns!

