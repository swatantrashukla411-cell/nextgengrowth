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

// Email Template Generator
function generateAmbassadorEmail(firstName, googleFormLink) {
  return `
    <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 30px; border-radius: 16px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #064e3b, #022c22); border-radius: 12px; padding: 35px 20px; text-align: center; color: white; box-shadow: 0 4px 10px rgba(6, 78, 59, 0.15);">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.03em;">NextGenGrowth</h1>
        <p style="margin: 8px 0 0 0; color: #34d399; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">Campus Ambassador Program 🚀</p>
      </div>

      <!-- Body -->
      <div style="background: white; border-radius: 12px; padding: 35px; margin-top: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em;">Hi ${firstName || 'Student'}, 👋</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          We have an exciting opportunity for you! We are officially launching the <strong>NextGenGrowth Campus Ambassador Program</strong>, and since you are one of our registered students, we want you to be a key part of it.
        </p>

        <!-- Program Info Card -->
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #064e3b; margin: 0 0 10px 0; font-size: 16px; font-weight: 700;">Why join us as an Ambassador?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;"><strong>Real Startup Experience:</strong> Represent local and national startups on your campus.</li>
            <li style="margin-bottom: 8px;"><strong>Income & Incentives:</strong> Earn payouts and bonuses based on campaign executions.</li>
            <li style="margin-bottom: 8px;"><strong>Networking:</strong> Connect with ambitious peers from other campuses.</li>
            <li style="margin-bottom: 8px;"><strong>Build Your Portfolio:</strong> Add real leadership credentials to your resume.</li>
            <li><strong>Certifications:</strong> Get official Ambassador Certificates and Letters of Recommendation.</li>
          </ul>
        </div>

        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          This is not a typical program where you just get sign-ups. You'll act as a community builder, marketing partner, and talent scout, gaining real hands-on business skills.
        </p>

        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 30px; font-weight: 600;">
          To apply, please click the button below and fill out the Google Form. We will review your application and get back to you shortly!
        </p>

        <!-- Button -->
        <div style="text-align: center; margin-bottom: 35px;">
          <a href="${googleFormLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);">
            Fill the Application Form →
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">

        <!-- Footer -->
        <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center; margin: 0;">
          <strong>NextGenGrowth</strong> — Connecting Startup Innovation with Student Talent.<br>
          <a href="https://nextgengrowth.in" style="color: #10b981; text-decoration: none; font-weight: 600;">nextgengrowth.in</a>
        </p>
        <p style="color: #94a3b8; font-size: 10px; line-height: 1.4; text-align: center; margin-top: 15px;">
          If you do not wish to receive updates about ambassador roles, please reply to this email with "Unsubscribe".
        </p>
      </div>
    </div>
  `;
}

// Delay helper to throttle email sending
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple CSV line parser
function parseCSVLine(line) {
  // Matches fields split by comma and stripping enclosing quotes
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  return matches.map(val => val.replace(/^"|"$/g, '').trim());
}

async function main() {
  const csvPath = path.resolve(__dirname, 'students_emails.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}\nRun "node extract_emails.js" first to generate the email list!`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      console.log('⚠️ No students found in CSV file (only header present). Exiting.');
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

    console.log(`📋 Found ${students.length} valid students in CSV file.`);
    console.log(`🚀 Starting bulk email campaign with 2-second throttling...`);
    console.log('------------------------------------------------------------');

    const report = {
      campaignRunAt: new Date().toISOString(),
      applicationLink: GOOGLE_FORM_LINK,
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
        const html = generateAmbassadorEmail(firstName, GOOGLE_FORM_LINK);
        
        const { data, error } = await resend.emails.send({
          from: 'NextGenGrowth <team@nextgengrowth.in>',
          to: [email],
          subject: 'Become a Campus Ambassador at NextGenGrowth 🚀',
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

      // Add a 2-second delay to avoid rate limits
      if (i < students.length - 1) {
        await sleep(2000);
      }
    }

    console.log('------------------------------------------------------------');
    console.log(`📊 Campaign Summary:`);
    console.log(`   - Total Processed: ${students.length}`);
    console.log(`   - Successful: ${report.successCount}`);
    console.log(`   - Failed: ${report.failCount}`);

    // Save report
    const reportPath = path.resolve(__dirname, 'ambassador_email_campaign_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Detailed log written to: ${reportPath}`);

  } catch (err) {
    console.error('❌ Critical error executing email campaign:', err);
  }
}

main();
