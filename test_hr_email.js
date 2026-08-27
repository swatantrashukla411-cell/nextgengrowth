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

function generateHREmailTemplate(name, company, pitch) {
  const formattedPitch = pitch ? pitch.charAt(0).toLowerCase() + pitch.slice(1) : 'connecting companies with student talent';

  return `
    <p>Dear ${name},</p>

    <p>I hope you're doing well.</p>

    <p>My name is Swatantra Shukla, and I am the founder of NextGenGrowth. We are a student-founded initiative building a student-powered talent and workforce platform that connects organizations with vetted student talent for projects, internships, and campus ambassador campaigns.</p>

    <p>As we design our platform, we are conducting brief 15-minute customer discovery interviews with select HR and talent leaders. I noticed your background at ${company} and wanted to reach out because we are specifically studying how platforms like ours can support companies in your space (for example, by ${formattedPitch}).</p>

    <p>Since we are in the early validation stage, we are not selling anything. We are strictly looking to learn from experienced leaders like you about:</p>

    <ul>
      <li>Your current challenges with early-career talent sourcing and Gen-Z engagement.</li>
      <li>What you look for when hiring student interns or campus ambassadors.</li>
      <li>How we can build our training pipelines to best serve hiring managers' real needs.</li>
    </ul>

    <p>Would you be open to a quick 15-minute Zoom or phone call sometime this week? Your insights would be incredibly valuable to our student team and would directly influence the direction of our platform.</p>

    <p>Thank you so much for your time and guidance. I would be grateful for the opportunity to learn from your experience.</p>

    <p>Warm regards,</p>

    <p><strong>Swatantra Shukla</strong><br>
    Founder, NextGenGrowth<br>
    Phone: +91 9532792303<br>
    LinkedIn: <a href="https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/">https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/</a></p>
  `;
}

async function main() {
  const testLead = {
    name: "Akanksha Puri",
    company: "SourceFuse",
    pitch: "NextGenGrowth can supply vetted student developer talent for client integrations and cloud migrations.",
    email: gmailUser
  };

  console.log(`🔌 Verifying SMTP Connection...`);
  await transporter.verify();
  console.log(`✅ SMTP Connection verified!`);

  console.log(`🚀 Sending preview email to: ${testLead.email} (simulating send to ${testLead.name} from ${testLead.company})...`);
  
  const html = generateHREmailTemplate(testLead.name, testLead.company, testLead.pitch);
  
  const mailOptions = {
    from: `"Swatantra Shukla" <${gmailUser}>`,
    to: testLead.email,
    subject: 'Request for a 15-Minute Customer Discovery Conversation with HR Leaders',
    html: html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  console.log(`👉 Please check your Gmail Inbox (${testLead.email}) to review the layout.`);
}

main().catch(err => console.error('❌ Error sending test email:', err.message));
