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

// SMTP Transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass.replace(/\s+/g, '') // Remove any spaces in the app password
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const jsonPath = path.resolve(__dirname, 'startups_campaign_outreach.json');
  const reportPath = path.resolve(__dirname, 'startups_campaign_report.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON database not found at: ${jsonPath}\nRun "node generate_startups_campaign.js" first.`);
    process.exit(1);
  }

  try {
    const prospects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📋 Total prospects loaded: ${prospects.length}`);

    // Load previous run logs to avoid sending duplicates
    let sentEmails = new Set();
    let previousDetails = [];
    
    if (fs.existsSync(reportPath)) {
      try {
        const prevReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        if (prevReport && Array.isArray(prevReport.details)) {
          previousDetails = prevReport.details;
          previousDetails.forEach(detail => {
            if (detail.status === 'sent') {
              sentEmails.add(detail.email.toLowerCase().trim());
            }
          });
        }
        console.log(`ℹ️ Loaded startups_campaign_report.json. Found ${sentEmails.size} previously sent emails to skip.`);
      } catch (err) {
        console.warn('⚠️ Could not parse existing startups_campaign_report.json. Continuing without skipping.', err.message);
      }
    }

    // Filter leads to only unsent ones
    const unsentLeads = prospects.filter(lead => !sentEmails.has(lead.email.toLowerCase().trim()));

    console.log(`📋 Unsent Queue: ${unsentLeads.length}`);
    
    if (unsentLeads.length === 0) {
      console.log('✅ All leads have already been emailed! No new emails to send.');
      return;
    }

    // To prevent sending 100 emails at once from a personal Gmail account and risking getting flagged,
    // we can send in batches or process a batch of 5 for safety/verification first, or process all.
    // Let's implement a batch limit (e.g. process up to 10 in this run) so the user can verify.
    // We can check if a command line arg is passed, e.g. "node send_startups_campaign.js --all"
    const sendAll = process.argv.includes('--all');
    const limit = sendAll ? unsentLeads.length : 5; // Default to 5 for safety check if --all is not passed

    console.log(`🚀 Starting Cold Email Campaign. Batch size: ${limit} (Pass --all to send all ${unsentLeads.length} at once)`);
    console.log(`📧 Sender: ${gmailUser}`);
    console.log('------------------------------------------------------------');

    const newDetails = [];

    console.log('🔌 Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified! Sending process started...');

    for (let i = 0; i < limit; i++) {
      const lead = unsentLeads[i];
      const email = lead.email;
      const name = lead.founderName;
      const company = lead.company;
      const subject = lead.subject1; // Use Variant 1 as primary
      
      // Convert text newlines to HTML line breaks for the HTML version, but keep a clean body
      // We will wrap the text inside standard font styles to keep it clean and plain-text-like.
      const htmlBody = lead.emailBody.replace(/\n/g, '<br>');
      
      console.log(`[${i + 1}/${limit}] Sending to ${name} <${email}> (${company})...`);

      try {
        const mailOptions = {
          from: `"Swatantra Shukla" <${gmailUser}>`,
          to: email,
          subject: subject,
          html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">${htmlBody}</div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
        
        newDetails.push({
          id: lead.id,
          name: name,
          email: email,
          company: company,
          status: 'sent',
          messageId: info.messageId,
          sentAt: new Date().toISOString()
        });

      } catch (err) {
        console.error(`  ❌ Failed to send to ${email}:`, err.message);
        newDetails.push({
          id: lead.id,
          name: name,
          email: email,
          company: company,
          status: 'failed',
          error: err.message,
          attemptedAt: new Date().toISOString()
        });
      }

      // Delay to avoid spam detection (5 seconds)
      if (i < limit - 1) {
        await sleep(5000);
      }
    }

    console.log('------------------------------------------------------------');

    // Combine previous run logs with the new run logs
    const allDetails = [...previousDetails, ...newDetails];
    
    const report = {
      campaignRunAt: new Date().toISOString(),
      sender: gmailUser,
      totalCount: prospects.length,
      sentCount: allDetails.filter(d => d.status === 'sent').length,
      failCount: allDetails.filter(d => d.status === 'failed').length,
      details: allDetails
    };

    console.log(`📊 Campaign Summary (Overall):`);
    console.log(`   - Total Database: ${report.totalCount}`);
    console.log(`   - Successfully Sent: ${report.sentCount}`);
    console.log(`   - Failed: ${report.failCount}`);
    console.log(`   - Sent in this batch: ${newDetails.filter(d => d.status === 'sent').length}`);
    console.log(`   - Failed in this batch: ${newDetails.filter(d => d.status === 'failed').length}`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Campaign report log updated at: ${reportPath}`);

    if (limit < unsentLeads.length) {
      console.log(`\n💡 To send the remaining ${unsentLeads.length - limit} emails, run:`);
      console.log(`   node send_startups_campaign.js --all`);
    }

  } catch (err) {
    console.error('❌ Critical error during campaign execution:', err.message);
  }
}

main();
