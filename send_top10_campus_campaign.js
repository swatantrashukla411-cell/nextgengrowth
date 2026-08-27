const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const gmailUser = process.env.GMAIL_USER || 'nextgengrowthwork@gmail.com';
const gmailPass = process.env.GMAIL_PASS;

const jsonPath = path.resolve(__dirname, 'top_10_campus_outreach.json');
const reportPath = path.resolve(__dirname, 'top_10_campus_campaign_report.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Target dataset not found at: ${jsonPath}`);
    process.exit(1);
  }

  const prospects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`============================================================`);
  console.log(`🎯 NEXTGENGROWTH - TOP 10 CAMPUS MARKETING OUTREACH CAMPAIGN`);
  console.log(`============================================================`);
  console.log(`📋 Total High-Conversion Target Brands: ${prospects.length}`);
  console.log(`📧 Configured Sender Account: ${gmailUser}`);

  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    console.log(`\n🔍 DRY RUN MODE ACTIVATED (No emails will be sent)\n`);
    prospects.forEach((p, idx) => {
      console.log(`------------------------------------------------------------`);
      console.log(`[${idx + 1}/${prospects.length}] Brand: ${p.company} (${p.category})`);
      console.log(`👤 Decision Maker: ${p.decisionMaker} (${p.title}) <${p.email}>`);
      console.log(`💡 Campaign Concept: ${p.campaignBlueprint}`);
      console.log(`📌 Subject: ${p.subject}`);
      console.log(`✉️ Email Preview:\n${p.emailBody.substring(0, 200)}...\n`);
    });
    console.log(`============================================================`);
    console.log(`💡 To execute real sending via SMTP, run:`);
    console.log(`   node send_top10_campus_campaign.js --send`);
    return;
  }

  const isSend = process.argv.includes('--send');
  if (!isSend) {
    console.log(`\n⚠️ Safety Check: Pass '--send' to dispatch emails, or '--dry-run' to preview output.`);
    console.log(`Example: node send_top10_campus_campaign.js --dry-run`);
    return;
  }

  if (!gmailPass || gmailPass === 'your_app_password_here') {
    console.error(`\n❌ GMAIL_PASS is missing or unconfigured in .env!`);
    console.error(`Please update GMAIL_USER=nextgengrowthwork@gmail.com and set GMAIL_PASS to your 16-character App Password in .env.`);
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass.replace(/\s+/g, '')
    }
  });

  // Load previous report if exists to prevent duplicates
  let sentEmails = new Set();
  let previousDetails = [];
  if (fs.existsSync(reportPath)) {
    try {
      const prevReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      if (prevReport && Array.isArray(prevReport.details)) {
        previousDetails = prevReport.details;
        previousDetails.forEach(d => {
          if (d.status === 'sent') sentEmails.add(d.email.toLowerCase().trim());
        });
      }
    } catch (e) {
      console.warn('⚠️ Could not parse existing report file, proceeding without skipping.');
    }
  }

  const unsentQueue = prospects.filter(p => !sentEmails.has(p.email.toLowerCase().trim()));
  console.log(`📋 Total Unsent Queue: ${unsentQueue.length} / ${prospects.length}`);

  if (unsentQueue.length === 0) {
    console.log(`✅ All top 10 target brands have already been emailed!`);
    return;
  }

  console.log(`🔌 Verifying SMTP Connection for ${gmailUser}...`);
  await transporter.verify();
  console.log(`✅ SMTP Connection verified! Dispatching outreach sequence...\n`);

  const newDetails = [];

  for (let i = 0; i < unsentQueue.length; i++) {
    const lead = unsentQueue[i];
    console.log(`[${i + 1}/${unsentQueue.length}] Sending to ${lead.decisionMaker} <${lead.email}> (${lead.company})...`);

    const htmlBody = lead.emailBody.replace(/\n/g, '<br>');
    const mailOptions = {
      from: `"Swatantra Shukla | NextGenGrowth" <${gmailUser}>`,
      to: lead.email,
      subject: lead.subject,
      html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #222;">${htmlBody}</div>`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
      newDetails.push({
        company: lead.company,
        decisionMaker: lead.decisionMaker,
        email: lead.email,
        blueprint: lead.campaignBlueprint,
        status: 'sent',
        messageId: info.messageId,
        sentAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(`  ❌ Failed to send to ${lead.email}:`, err.message);
      newDetails.push({
        company: lead.company,
        decisionMaker: lead.decisionMaker,
        email: lead.email,
        blueprint: lead.campaignBlueprint,
        status: 'failed',
        error: err.message,
        attemptedAt: new Date().toISOString()
      });
    }

    if (i < unsentQueue.length - 1) {
      console.log(`⏳ Waiting 5 seconds before next dispatch...`);
      await sleep(5000);
    }
  }

  const allDetails = [...previousDetails, ...newDetails];
  const report = {
    campaignRunAt: new Date().toISOString(),
    sender: gmailUser,
    totalTargets: prospects.length,
    sentCount: allDetails.filter(d => d.status === 'sent').length,
    failCount: allDetails.filter(d => d.status === 'failed').length,
    details: allDetails
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n============================================================`);
  console.log(`📊 OUTREACH CAMPAIGN SUMMARY:`);
  console.log(`   - Total Sent: ${report.sentCount}`);
  console.log(`   - Failed: ${report.failCount}`);
  console.log(`📁 Updated report at: ${reportPath}`);
  console.log(`============================================================`);
}

main();
