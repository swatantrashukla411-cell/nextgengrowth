const { Resend } = require("resend");

function createEmailService({ apiKey = process.env.RESEND_API_KEY, client, logger = console } = {}) {
  const resend = client || (apiKey ? new Resend(apiKey) : null);

  async function sendEmail(to, subject, html) {
    if (!resend) {
      logger.warn("Email skipped because RESEND_API_KEY is not configured.");
      return { skipped: true };
    }

    try {
      const { error } = await resend.emails.send({
        from: "NextGenGrowth <team@nextgengrowth.in>",
        to: [to],
        subject,
        html,
      });
      if (error) throw new Error(error.message || "Resend rejected the message.");
      logger.info("Email sent via Resend.");
      return { sent: true };
    } catch (err) {
      logger.error("Email delivery failed:", err.message);
      throw err;
    }
  }

  return { sendEmail };
}

module.exports = { createEmailService };
