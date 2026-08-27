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
    pass: gmailPass.replace(/\s+/g, '') // Remove spaces in password
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCSVLine(line) {
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  return matches.map(val => val.replace(/^"|"$/g, '').trim());
}

async function main() {
  const csvPath = 'E:/hr/prospects_database_v2.csv';

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📁 Reading V2 contacts from: ${csvPath}`);

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      console.log('⚠️ No contacts found in CSV file.');
      return;
    }

    const header = parseCSVLine(lines[0]);
    const emailIndex = header.findIndex(h => {
      const clean = h.replace(/"/g, '').toLowerCase().trim();
      return clean === 'email' || clean === 'work email' || clean === 'email address';
    });
    const nameIndex = header.findIndex(h => {
      const clean = h.replace(/"/g, '').toLowerCase().trim();
      return clean === 'name' || clean === 'full name' || clean === 'contact name';
    });
    const companyIndex = header.findIndex(h => {
      const clean = h.replace(/"/g, '').toLowerCase().trim();
      return clean === 'company';
    });
    const pitchIndex = header.findIndex(h => {
      const clean = h.replace(/"/g, '').toLowerCase().trim();
      return clean === 'why nextgengrowth helps' || clean === 'pitch';
    });

    if (emailIndex === -1 || nameIndex === -1) {
      console.error('❌ Could not find required columns in the CSV.');
      process.exit(1);
    }

    const hrLeaders = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      if (fields.length > Math.max(emailIndex, nameIndex)) {
        hrLeaders.push({
          email: fields[emailIndex],
          name: fields[nameIndex],
          company: companyIndex !== -1 ? fields[companyIndex] : 'your company',
          pitch: pitchIndex !== -1 ? fields[pitchIndex] : 'connecting companies with student talent'
        });
      }
    }

    console.log(`📋 Loaded ${hrLeaders.length} V2 HR leaders from CSV.`);
    console.log(`🚀 Starting V2 Customer Discovery campaign via: ${gmailUser}...`);
    console.log('------------------------------------------------------------');

    const report = {
      campaignRunAt: new Date().toISOString(),
      sender: gmailUser,
      totalCount: hrLeaders.length,
      successCount: 0,
      failCount: 0,
      details: []
    };

    console.log('🔌 Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ Connection verified! Starting sending process...');

    for (let i = 0; i < hrLeaders.length; i++) {
      const leader = hrLeaders[i];
      const email = leader.email;
      const name = leader.name;

      console.log(`[${i + 1}/${hrLeaders.length}] Sending to ${name} <${email}>...`);

      try {
        const html = generateHREmailTemplate(name, leader.company, leader.pitch);
        
        const mailOptions = {
          from: `"Swatantra Shukla" <${gmailUser}>`,
          to: email,
          subject: 'Request for a 15-Minute Customer Discovery Conversation with HR Leaders',
          html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
        
        report.successCount++;
        report.details.push({ name: name, email: email, status: 'sent', messageId: info.messageId });

      } catch (err) {
        console.error(`  ❌ Failed to send to ${email}:`, err.message);
        report.failCount++;
        report.details.push({ name: name, email: email, status: 'failed', error: err.message });
      }

      if (i < hrLeaders.length - 1) {
        await sleep(5000);
      }
    }

    console.log('------------------------------------------------------------');
    console.log(`📊 V2 Campaign Summary:`);
    console.log(`   - Total Processed: ${hrLeaders.length}`);
    console.log(`   - Successful: ${report.successCount}`);
    console.log(`   - Failed: ${report.failCount}`);

    const reportPath = 'E:/hr/hr_campaign_v2_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Detailed log written to: ${reportPath}`);

  } catch (err) {
    console.error('❌ Critical error during campaign:', err.message);
  }
}

main();
