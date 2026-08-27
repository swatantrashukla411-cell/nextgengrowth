const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Load environment variables
require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;

// Campus Ambassador application page / form link
const GOOGLE_FORM_LINK = process.env.AMBASSADOR_FORM_URL || 'https://forms.gle/sampleAmbassadorFormLink';

if (!resendApiKey || resendApiKey.includes('your_resend_api_key')) {
  console.error('❌ RESEND_API_KEY is not configured in your .env file.');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

// Plain-text style Email Template (HTML format but without styles, looking like a personal mail)
function generatePersonalTextEmail(firstName, googleFormLink) {
  const name = firstName || 'there';
  return `
    <p>Hi ${name},</p>
    
    <p>I hope you are doing well.</p>
    
    <p>I noticed you are registered on our NextGenGrowth platform, and I wanted to personally reach out to invite you to join our <strong>Campus Ambassador Program</strong>.</p>
    
    <p>This is a leadership role where you will act as a startup representative on your campus. It's a great opportunity to build your resume, work directly with founders, earn payouts based on campaigns, and receive an official Certificate and Letter of Recommendation (LOR) from us.</p>
    
    <p>If you're interested, please take 2 minutes to fill out the application form here:</p>
    
    <p><a href="${googleFormLink}">${googleFormLink}</a></p>
    
    <p>Let me know if you have any questions. Looking forward to working with you!</p>
    
    <p>Best regards,<br>
    <strong>Swatantra Shukla</strong><br>
    Team NextGenGrowth<br>
    <a href="https://nextgengrowth.in">nextgengrowth.in</a></p>
  `;
}

// Delay helper to throttle email sending
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple CSV line parser
function parseCSVLine(line) {
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  return matches.map(val => val.replace(/^"|"$/g, '').trim());
}

async function main() {
  const csvPath = path.resolve(__dirname, 'students_emails.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}\nRun "node extract_emails.js" first!`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      console.log('⚠️ No students found in CSV file. Exiting.');
      return;
    }

    const header = parseCSVLine(lines[0]);
    const emailIndex = header.findIndex(h => h.toLowerCase() === 'email');
    const firstNameIndex = header.findIndex(h => h.toLowerCase().includes('first'));
    const lastNameIndex = header.findIndex(h => h.toLowerCase().includes('last'));

    if (emailIndex === -1) {
      console.error('❌ Could not find "Email" column in the CSV.');
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

    console.log(`📋 Found ${students.length} students in CSV file.`);
    console.log(`🚀 Starting plain-text (Primary tab optimized) campaign...`);
    console.log('------------------------------------------------------------');

    const report = {
      campaignRunAt: new Date().toISOString(),
      type: 'plain-text-optimization',
      totalCount: students.length,
      successCount: 0,
      failCount: 0,
      details: []
    };

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const email = student.email;
      const firstName = student.firstName;
      const fullName = `${student.firstName} ${student.lastName}`.trim();

      console.log(`[${i + 1}/${students.length}] Sending to ${fullName} <${email}>...`);

      try {
        const html = generatePersonalTextEmail(firstName, GOOGLE_FORM_LINK);
        
        const { data, error } = await resend.emails.send({
          from: 'Swatantra Shukla <team@nextgengrowth.in>',
          to: [email],
          subject: 'Campus Ambassador Program - NextGenGrowth 🚀',
          html: html,
        });

        if (error) {
          console.error(`  ❌ Failed:`, error.message);
          report.failCount++;
          report.details.push({ name: fullName, email: email, status: 'failed', error: error.message });
        } else {
          console.log(`  ✅ Sent successfully. ID: ${data.id}`);
          report.successCount++;
          report.details.push({ name: fullName, email: email, status: 'sent', emailId: data.id });
        }

      } catch (err) {
        console.error(`  ❌ Error:`, err.message);
        report.failCount++;
        report.details.push({ name: fullName, email: email, status: 'failed', error: err.message });
      }

      // 2-second delay to comply with limits
      if (i < students.length - 1) {
        await sleep(2000);
      }
    }

    console.log('------------------------------------------------------------');
    console.log(`📊 Campaign Summary:`);
    console.log(`   - Total Processed: ${students.length}`);
    console.log(`   - Successful: ${report.successCount}`);
    console.log(`   - Failed: ${report.failCount}`);

    const reportPath = path.resolve(__dirname, 'ambassador_text_email_campaign_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Detailed log written to: ${reportPath}`);

  } catch (err) {
    console.error('❌ Critical error executing email campaign:', err);
  }
}

main();
