const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;

if (!gmailUser || !gmailPass) {
  console.error('❌ GMAIL_USER or GMAIL_PASS is not configured in your .env file.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass.replace(/\s+/g, '')
  }
});

async function main() {
  const jsonPath = path.resolve(__dirname, '100_saas_startups_outreach.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON database not found at: ${jsonPath}\nRun "node generate_saas_startups_outreach.js" first.`);
    process.exit(1);
  }

  const prospects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const testLead = prospects[0]; // Clerk
  
  console.log(`🔌 Verifying SMTP Connection...`);
  await transporter.verify();
  console.log(`✅ SMTP Connection verified!`);

  console.log(`🚀 Sending preview email to: ${gmailUser} (simulating send to ${testLead.company})...`);
  
  const subject = `[PREVIEW] Question regarding execution support at ${testLead.company}`;
  const htmlBody = testLead.emailBody.replace(/\n/g, '<br>');
  
  const mailOptions = {
    from: `"Swatantra Shukla" <${gmailUser}>`,
    to: gmailUser,
    subject: subject,
    text: testLead.emailBody,
    html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">${htmlBody}</div>`
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  console.log(`👉 Please check your Gmail Inbox (${gmailUser}) to review the layout.`);
}

main().catch(err => console.error('❌ Error sending test email:', err.message));
