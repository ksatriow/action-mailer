const core = require("@actions/core");
const nodemailer = require("nodemailer");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const Handlebars = require("handlebars");
const fs = require("fs-extra");
const path = require("path");
const { glob } = require("glob");

// Debug mode flag
let DEBUG_MODE = false;

/**
 * Debug logging function
 */
function debugLog(message) {
  if (DEBUG_MODE) {
    core.info(`🔍 [DEBUG] ${message}`);
  }
}

/**
 * Sleep/delay function for retries
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate email size in bytes (approximate)
 */
function calculateEmailSize(options) {
  let size = 0;
  
  // Subject
  size += Buffer.byteLength(options.subject || "", "utf8");
  
  // Text body
  if (options.textBody) {
    size += Buffer.byteLength(options.textBody, "utf8");
  }
  
  // HTML body
  if (options.htmlBody) {
    size += Buffer.byteLength(options.htmlBody, "utf8");
  }
  
  // Attachments
  if (options.attachments && options.attachments.length > 0) {
    for (const attachment of options.attachments) {
      try {
        const stats = fs.statSync(attachment);
        size += stats.size;
      } catch (error) {
        debugLog(`Could not get size for attachment: ${attachment}`);
      }
    }
  }
  
  return size;
}

/**
 * Validate email size (max 25MB for most providers)
 */
function validateEmailSize(size, maxSizeMB = 25) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (size > maxSizeBytes) {
    throw new Error(
      `❌ Email size (${(size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size (${maxSizeMB} MB)\n` +
      `   Please reduce attachment sizes or email content.`
    );
  }
  return true;
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, retryCount, retryDelay, attempt = 1) {
  try {
    return await fn();
  } catch (error) {
    if (attempt > retryCount) {
      throw error;
    }
    
    const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
    core.warning(`⚠️  Attempt ${attempt} failed. Retrying in ${delay}ms... (${retryCount - attempt + 1} attempts remaining)`);
    debugLog(`Error: ${error.message}`);
    
    await sleep(delay);
    return retry(fn, retryCount, retryDelay, attempt + 1);
  }
}

/**
 * Parse comma-separated email addresses
 */
function parseEmailList(emailString) {
  if (!emailString || emailString.trim() === "") return [];
  return emailString
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

/**
 * Validate email address format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate all email addresses in a list
 */
function validateEmailList(emails, fieldName) {
  for (const email of emails) {
    if (!isValidEmail(email)) {
      throw new Error(
        `❌ Invalid email address in ${fieldName}: "${email}"\n` +
        `   Please check the email format. Example: user@example.com`
      );
    }
  }
}

/**
 * Resolve attachment files from glob patterns
 */
async function resolveAttachments(attachmentPatterns) {
  if (!attachmentPatterns || attachmentPatterns.trim() === "") {
    return [];
  }

  const patterns = attachmentPatterns
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const files = new Set();
  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, { absolute: true });
      matches.forEach((file) => files.add(file));
    } catch (error) {
      core.warning(`⚠️  Could not resolve pattern "${pattern}": ${error.message}`);
    }
  }

  return Array.from(files);
}

/**
 * Read and compile Handlebars template
 */
async function compileTemplate(templatePath, variables) {
  if (!templatePath || !(await fs.pathExists(templatePath))) {
    return null;
  }

  try {
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const template = Handlebars.compile(templateContent);
    return template(variables || {});
  } catch (error) {
    throw new Error(`❌ Failed to compile template: ${error.message}`);
  }
}

/**
 * Create SMTP transporter
 */
function createSMTPTransporter(smtpServer, smtpPort, smtpSecure, username, password) {
  const port = smtpPort || 465;
  const secure = smtpSecure === "true" || smtpSecure === true;

  return nodemailer.createTransport({
    host: smtpServer,
    port: parseInt(port),
    secure: secure,
    auth: {
      user: username,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
}

/**
 * Create AWS SES client
 */
function createSESClient(awsRegion) {
  return new SESClient({
    region: awsRegion,
    credentials: {
      accessKeyId: core.getInput("username"),
      secretAccessKey: core.getInput("password"),
    },
  });
}

/**
 * Send email via SMTP
 */
async function sendViaSMTP(options) {
  const {
    smtpServer,
    smtpPort,
    smtpSecure,
    username,
    password,
    fromEmail,
    toEmails,
    ccEmails,
    bccEmails,
    subject,
    textBody,
    htmlBody,
    attachments,
    replyTo,
    customHeaders,
  } = options;

  core.info(`📧 Using SMTP: ${smtpServer}:${smtpPort || 465}`);

  const transporter = createSMTPTransporter(
    smtpServer,
    smtpPort,
    smtpSecure,
    username,
    password
  );

  // Verify connection
  try {
    core.info("🔍 Verifying SMTP connection...");
    await transporter.verify();
    core.info("✅ SMTP connection verified successfully");
  } catch (error) {
    const errorMsg = error.message || "Unknown error";
    throw new Error(
      `❌ SMTP connection failed: ${errorMsg}\n` +
      `   Please check:\n` +
      `   - SMTP server and port are correct\n` +
      `   - Username and password are valid\n` +
      `   - Network connectivity\n` +
      `   - Firewall settings`
    );
  }

  const mailOptions = {
    from: fromEmail,
    to: toEmails.join(", "),
    subject: subject,
  };

  // Reply-To header
  if (replyTo) {
    mailOptions.replyTo = replyTo;
    debugLog(`Reply-To set to: ${replyTo}`);
  }

  // Custom headers
  if (customHeaders && Object.keys(customHeaders).length > 0) {
    mailOptions.headers = customHeaders;
    debugLog(`Custom headers: ${JSON.stringify(customHeaders)}`);
  }

  if (ccEmails.length > 0) {
    mailOptions.cc = ccEmails.join(", ");
  }

  if (bccEmails.length > 0) {
    mailOptions.bcc = bccEmails.join(", ");
  }

  if (htmlBody) {
    mailOptions.html = htmlBody;
    if (textBody) {
      mailOptions.text = textBody;
    }
  } else if (textBody) {
    mailOptions.text = textBody;
  }

  if (attachments.length > 0) {
    mailOptions.attachments = attachments.map((filePath) => ({
      path: filePath,
      filename: path.basename(filePath),
    }));
    core.info(`📎 Attaching ${attachments.length} file(s)`);
  }

  // Validate email size
  const emailSize = calculateEmailSize({
    subject,
    textBody,
    htmlBody,
    attachments,
  });
  validateEmailSize(emailSize);
  debugLog(`Email size: ${(emailSize / 1024).toFixed(2)} KB`);

  const info = await transporter.sendMail(mailOptions);
  return info;
}

/**
 * Send email via AWS SES
 */
async function sendViaSES(options) {
  const {
    awsRegion,
    fromEmail,
    toEmails,
    ccEmails,
    bccEmails,
    subject,
    textBody,
    htmlBody,
    attachments,
    replyTo,
    customHeaders,
  } = options;

  core.info(`☁️  Using AWS SES: ${awsRegion}`);

  const sesClient = createSESClient(awsRegion);

  // Note: AWS SES doesn't support attachments in the same way as SMTP
  // For attachments with SES, you'd need to use SendRawEmailCommand
  // For simplicity, we'll show a warning if attachments are provided
  if (attachments.length > 0) {
    core.warning(
      "⚠️  AWS SES doesn't support attachments via SendEmailCommand. Consider using SMTP for attachments."
    );
  }

  const destination = {
    ToAddresses: toEmails,
  };

  if (ccEmails.length > 0) {
    destination.CcAddresses = ccEmails;
  }

  if (bccEmails.length > 0) {
    destination.BccAddresses = bccEmails;
  }

  const message = {
    Subject: {
      Data: subject,
      Charset: "UTF-8",
    },
    Body: {},
  };

  if (htmlBody) {
    message.Body.Html = {
      Data: htmlBody,
      Charset: "UTF-8",
    };
  }

  if (textBody || !htmlBody) {
    message.Body.Text = {
      Data: textBody || htmlBody?.replace(/<[^>]*>/g, "") || "",
      Charset: "UTF-8",
    };
  }

  // Validate email size for SES (10MB limit)
  const emailSize = calculateEmailSize({
    subject,
    textBody,
    htmlBody,
    attachments: [], // SES doesn't support attachments via SendEmailCommand
  });
  validateEmailSize(emailSize, 10); // SES has 10MB limit
  debugLog(`Email size: ${(emailSize / 1024).toFixed(2)} KB`);

  const commandOptions = {
    Source: fromEmail,
    Destination: destination,
    Message: message,
  };

  // Reply-To for SES
  if (replyTo) {
    commandOptions.ReplyToAddresses = [replyTo];
    debugLog(`Reply-To set to: ${replyTo}`);
  }

  // Custom headers for SES (via Message Tags or Configuration Set)
  // Note: SES doesn't support arbitrary headers directly, but we can log them
  if (customHeaders && Object.keys(customHeaders).length > 0) {
    debugLog(`Custom headers (SES): ${JSON.stringify(customHeaders)}`);
    core.warning("⚠️  Custom headers are logged but not sent via SES SendEmailCommand. Consider using SES Configuration Sets.");
  }

  const command = new SendEmailCommand(commandOptions);
  const response = await sesClient.send(command);
  return response;
}

/**
 * Main execution function
 */
async function run() {
  try {
    // Get required inputs
    const fromEmail = core.getInput("from-email", { required: true });
    const toEmail = core.getInput("to-email", { required: true });
    const subject = core.getInput("subject", { required: true });

    // Get optional inputs
    const body = core.getInput("body");
    const htmlTemplate = core.getInput("html-template");
    const templateVariablesStr = core.getInput("template-variables");
    const attachmentsPattern = core.getInput("attachments");

    // Get SMTP inputs
    const smtpServer = core.getInput("smtp-server");
    const smtpPort = core.getInput("smtp-port") || "465";
    const smtpSecure = core.getInput("smtp-secure") || "true";

    // Get AWS SES inputs
    const awsRegion = core.getInput("aws-region");

    // Get credentials
    const username = core.getInput("username");
    const password = core.getInput("password");

    // Get CC/BCC
    const ccEmail = core.getInput("cc-email");
    const bccEmail = core.getInput("bcc-email");

    // Get new features
    const replyTo = core.getInput("reply-to");
    const customHeadersStr = core.getInput("custom-headers");
    const dryRun = core.getInput("dry-run") === "true";
    const debug = core.getInput("debug") === "true";
    const retryCount = parseInt(core.getInput("retry-count") || "0", 10);
    const retryDelay = parseInt(core.getInput("retry-delay") || "1000", 10);

    // Set debug mode
    DEBUG_MODE = debug;
    if (DEBUG_MODE) {
      core.info("🔍 Debug mode enabled");
    }

    // Parse email lists
    const toEmails = parseEmailList(toEmail);
    const ccEmails = parseEmailList(ccEmail);
    const bccEmails = parseEmailList(bccEmail);

    // Validate emails
    if (toEmails.length === 0) {
      throw new Error("❌ At least one recipient email is required");
    }

    validateEmailList([fromEmail], "from-email");
    validateEmailList(toEmails, "to-email");
    if (ccEmails.length > 0) validateEmailList(ccEmails, "cc-email");
    if (bccEmails.length > 0) validateEmailList(bccEmails, "bcc-email");
    if (replyTo) validateEmailList([replyTo], "reply-to");

    // Determine provider (auto-detection)
    let useSMTP = false;
    let useSES = false;

    if (smtpServer) {
      useSMTP = true;
      if (!username || !password) {
        throw new Error("❌ SMTP username and password are required when using SMTP");
      }
    } else if (awsRegion) {
      useSES = true;
      if (!username || !password) {
        throw new Error("❌ AWS access key and secret key are required when using SES");
      }
    } else {
      throw new Error(
        "❌ No email provider configured!\n" +
        "   Please provide either:\n" +
        "   - 'smtp-server' for SMTP (e.g., smtp.gmail.com)\n" +
        "   - 'aws-region' for AWS SES (e.g., us-east-1)"
      );
    }

    // Parse template variables
    let templateVariables = {};
    if (templateVariablesStr) {
      try {
        templateVariables = JSON.parse(templateVariablesStr);
        core.info("✅ Template variables parsed successfully");
      } catch (error) {
        throw new Error(
          `❌ Invalid JSON in template-variables: ${error.message}\n` +
          `   Please ensure your JSON is valid. Example:\n` +
          `   '{"name":"John","status":"SUCCESS"}'`
        );
      }
    }

    // Add default template variables
    templateVariables = {
      ...templateVariables,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    // Compile HTML template if provided
    let htmlBody = null;
    if (htmlTemplate) {
      htmlBody = await compileTemplate(htmlTemplate, templateVariables);
      if (htmlBody) {
        core.info(`✅ HTML template compiled: ${htmlTemplate}`);
      }
    }

    // Resolve attachments
    const attachments = await resolveAttachments(attachmentsPattern);
    if (attachments.length > 0) {
      core.info(`📎 Found ${attachments.length} attachment(s)`);
    }

    // Parse custom headers
    let customHeaders = {};
    if (customHeadersStr) {
      try {
        customHeaders = JSON.parse(customHeadersStr);
        debugLog(`Custom headers parsed: ${JSON.stringify(customHeaders)}`);
      } catch (error) {
        throw new Error(
          `❌ Invalid JSON in custom-headers: ${error.message}\n` +
          `   Please ensure your JSON is valid. Example:\n` +
          `   '{"X-Custom-Header": "value", "X-Priority": "1"}'`
        );
      }
    }

    // Prepare email options
    const emailOptions = {
      fromEmail,
      toEmails,
      ccEmails,
      bccEmails,
      subject,
      textBody: body,
      htmlBody,
      attachments,
      replyTo,
      customHeaders,
    };

    // Dry-run mode: validate without sending
    if (dryRun) {
      core.info("");
      core.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      core.info("🧪 DRY-RUN MODE - Email will NOT be sent");
      core.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      core.info(`📧 Provider: ${useSMTP ? "SMTP" : "AWS SES"}`);
      core.info(`📬 From: ${fromEmail}`);
      core.info(`📬 To: ${toEmails.join(", ")}`);
      if (ccEmails.length > 0) core.info(`📋 CC: ${ccEmails.join(", ")}`);
      if (bccEmails.length > 0) core.info(`🔒 BCC: ${bccEmails.length} recipient(s)`);
      if (replyTo) core.info(`↩️  Reply-To: ${replyTo}`);
      core.info(`📝 Subject: ${subject}`);
      if (attachments.length > 0) core.info(`📎 Attachments: ${attachments.length} file(s)`);
      
      // Validate email size
      const emailSize = calculateEmailSize({
        subject,
        textBody: body,
        htmlBody,
        attachments,
      });
      const maxSize = useSMTP ? 25 : 10;
      validateEmailSize(emailSize, maxSize);
      core.info(`✅ Email size: ${(emailSize / 1024).toFixed(2)} KB (within ${maxSize}MB limit)`);
      core.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      core.info("✅ Dry-run completed successfully - All validations passed!");
      core.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      core.info("");
      
      core.setOutput("dry-run", "true");
      core.setOutput("success", "true");
      return;
    }

    // Send email with retry mechanism
    let result;
    const sendEmail = async () => {
      if (useSMTP) {
        emailOptions.smtpServer = smtpServer;
        emailOptions.smtpPort = smtpPort;
        emailOptions.smtpSecure = smtpSecure;
        emailOptions.username = username;
        emailOptions.password = password;
        return await sendViaSMTP(emailOptions);
      } else {
        emailOptions.awsRegion = awsRegion;
        emailOptions.username = username;
        emailOptions.password = password;
        return await sendViaSES(emailOptions);
      }
    };

    if (retryCount > 0) {
      core.info(`🔄 Retry enabled: ${retryCount} attempts with ${retryDelay}ms base delay`);
      result = await retry(sendEmail, retryCount, retryDelay);
    } else {
      result = await sendEmail();
    }

    // Success message
    const recipientCount = toEmails.length + ccEmails.length + bccEmails.length;
    core.info("");
    core.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    core.info(`✅ Email sent successfully!`);
    core.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    core.info(`📬 To: ${toEmails.join(", ")}`);
    if (ccEmails.length > 0) {
      core.info(`📋 CC: ${ccEmails.join(", ")}`);
    }
    if (bccEmails.length > 0) {
      core.info(`🔒 BCC: ${bccEmails.length} recipient(s)`);
    }
    core.info(`📧 Total recipients: ${recipientCount}`);
    if (attachments.length > 0) {
      core.info(`📎 Attachments: ${attachments.length} file(s)`);
    }
    core.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    core.info("");

    // Set output
    core.setOutput("message-id", result.messageId || result.MessageId || "unknown");
    core.setOutput("success", "true");
  } catch (error) {
    core.setFailed(`\n❌ Action Mailer Error\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${error.message}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    process.exit(1);
  }
}

// Execute
run();
