const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config();

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;
const googleFormLink = process.env.AMBASSADOR_FORM_URL;

if (!gmailUser || !gmailPass) {
  console.error('❌ GMAIL_USER or GMAIL_PASS is not configured in your .env file.');
  process.exit(1);
}

// Configure Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass.replace(/\s+/g, '') // Remove any spaces in the app password
  }
});

// Personal Plain-Text Style Email Template
function generateGmailTemplate(firstName, formLink) {
  const name = firstName || 'there';
  return `
    <p>Hi ${name},</p>
    
    <p>I hope you are doing well.</p>
    
    <p>I noticed you are registered on our NextGenGrowth platform, and I wanted to personally reach out to invite you to join our <strong>Campus Ambassador Program</strong>.</p>
    
    <p>This is a leadership role where you will represent local and national startups on your campus. It's a great opportunity to:</p>
    <ul>
      <li>Work directly with founders and build your professional portfolio.</li>
      <li>Earn payouts and bonuses based on campaign executions.</li>
      <li>Connect with ambitious peers from other campuses.</li>
      <li>Receive an official Ambassador Certificate and Letter of Recommendation (LOR) from us.</li>
    </ul>
    
    <p>If you're interested, please take 2 minutes to fill out the application form here:</p>
    
    <p><a href="${formLink}">${formLink}</a></p>
    
    <p>Let me know if you have any questions. Looking forward to working with you!</p>
    
    <p>Best regards,<br>
    <strong>Swatantra Shukla</strong><br>
    Team NextGenGrowth<br>
    <a href="https://nextgengrowth.in">nextgengrowth.in</a></p>
  `;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCSVLine(line) {
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  return matches.map(val => val.replace(/^"|"$/g, '').trim());
}

async function main() {
  const csvPath = path.resolve(__dirname, 'students_emails.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}\nRun "node extract_emails.js" first to fetch the student list.`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      console.log('⚠️ No students found in CSV file (only headers present).');
      return;
    }

    const header = parseCSVLine(lines[0]);
    const emailIndex = header.findIndex(h => h.toLowerCase() === 'email');
    const firstNameIndex = header.findIndex(h => h.toLowerCase().includes('first'));
    const lastNameIndex = header.findIndex(h => h.toLowerCase().includes('last'));

    if (emailIndex === -1) {
      console.error('❌ Could not find "Email" column in the CSV file.');
      process.exit(1);
    }

    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      if (fields.length > emailIndex) {
        students.push({
          email: fields[emailIndex],
          firstName: firstNameIndex !== -1 ? fields[firstNameIndex] : 'Student',
          lastName: lastNameIndex !== -1 ? fields[lastNameIndex] : ''
        });
      }
    }

    console.log(`📋 Loaded ${students.length} students from CSV.`);
    console.log(`🚀 Launching Gmail Campaign via: ${gmailUser}...`);
    console.log('------------------------------------------------------------');

    const report = {
      campaignRunAt: new Date().toISOString(),
      sender: gmailUser,
      totalCount: students.length,
      successCount: 0,
      failCount: 0,
      details: []
    };

    // Verify SMTP connection before starting
    console.log('🔌 Verifying Gmail SMTP Connection...');
    await transporter.verify();
    console.log('✅ Connection verified! Starting sending process...');

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const email = student.email;
      const firstName = student.firstName;
      const fullName = `${student.firstName} ${student.lastName}`.trim();

      console.log(`[${i + 1}/${students.length}] Sending to ${fullName} <${email}>...`);

      try {
        const html = generateGmailTemplate(firstName, googleFormLink);
        
        const mailOptions = {
          from: `"Swatantra Shukla" <${gmailUser}>`,
          to: email,
          subject: 'Become a Campus Ambassador at NextGenGrowth 🚀',
          html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
        
        report.successCount++;
        report.details.push({ name: fullName, email: email, status: 'sent', messageId: info.messageId });

      } catch (err) {
        console.error(`  ❌ Failed to send to ${email}:`, err.message);
        report.failCount++;
        report.details.push({ name: fullName, email: email, status: 'failed', error: err.message });
      }

      // 2-second rate-limiting delay between sends
      if (i < students.length - 1) {
        await sleep(2000);
      }
    }

    console.log('------------------------------------------------------------');
    console.log(`📊 Gmail Campaign Summary:`);
    console.log(`   - Total Processed: ${students.length}`);
    console.log(`   - Successful: ${report.successCount}`);
    console.log(`   - Failed: ${report.failCount}`);

    const reportPath = path.resolve(__dirname, 'gmail_campaign_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Detailed log written to: ${reportPath}`);

  } catch (err) {
    console.error('❌ Critical error during Gmail campaign execution:', err.message);
  }
}

main();
