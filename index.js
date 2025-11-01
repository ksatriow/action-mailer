const core = require("@actions/core");
const nodemailer = require("nodemailer");

async function run() {
  try {
    const fromEmail = core.getInput("from-email");
    const toEmail = core.getInput("to-email");
    const subject = core.getInput("subject");
    const body = core.getInput("body");

    const smtpServer = core.getInput("smtp-server");
    const smtpPort = parseInt(core.getInput("smtp-port"));
    const username = core.getInput("username");
    const password = core.getInput("password");

    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: true,
      auth: { user: username, pass: password },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: body,
    });

    core.info(`✅ Email sent to ${toEmail}`);
  } catch (error) {
    core.setFailed(`❌ Failed to send email: ${error.message}`);
  }
}

run();
