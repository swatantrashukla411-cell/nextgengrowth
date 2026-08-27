const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Load environment variables
require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY is not defined in the .env file.');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

// CHANGE THESE DETAILS FOR YOUR CAMPAIGN
const FROM_EMAIL = 'NextGenGrowth <team@nextgengrowth.in>'; // Must be a verified domain in Resend
const GOOGLE_FORM_URL = 'YOUR_GOOGLE_FORM_LINK_HERE'; // Replace with your actual google form link
const SUBJECT = 'Become a Campus Ambassador with NextGenGrowth! 🚀';

// Delay helper to throttle emails (in milliseconds)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTML template for the email
function getAmbassadorEmailTemplate(firstName) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #064e3b, #022c22); padding: 30px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.025em;">NextGenGrowth</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Campus Ambassador Program 2026</p>
      </div>
      
      <div style="padding: 24px; background: white; border-radius: 0 0 8px 8px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${firstName || 'there'}! 👋</p>
        
        <p style="font-size: 15px; line-height: 1.6;">
          Hope you are doing great! As a valued student registered on the <strong>NextGenGrowth</strong> platform, we want to invite you to join our exclusive <strong>Campus Ambassador Program</strong>.
        </p>

        <p style="font-size: 15px; line-height: 1.6;">
          This is not your typical ambassador program. You won't just be asking students to register; you will act as a <strong>local startup representative, community builder, and marketing partner</strong>.
        </p>
        
        <h3 style="color: #047857; margin-top: 24px; margin-bottom: 12px; font-size: 18px;">Why Join NextGenGrowth as an Ambassador?</h3>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          <li style="margin-bottom: 8px;"><strong>Real Startup Experience:</strong> Work directly with founders and brands.</li>
          <li style="margin-bottom: 8px;"><strong>Income & Incentives:</strong> Earn payouts and bonuses based on campaign executions.</li>
          <li style="margin-bottom: 8px;"><strong>Networking:</strong> Connect with ambitious peers from other campuses.</li>
          <li style="margin-bottom: 8px;"><strong>Build Your Portfolio:</strong> Add real leadership credentials to your resume.</li>
        </ul>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${GOOGLE_FORM_URL}" style="display: inline-block; background-color: #059669; color: white; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);">
            Apply Now & Join the Network →
          </a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          Best regards,<br/>
          <strong>Team NextGenGrowth</strong><br/>
          <a href="https://nextgengrowth.in" style="color: #059669; text-decoration: none;">nextgengrowth.in</a>
        </p>
        
        <p style="font-size: 10px; color: #94a3b8; margin-top: 20px; text-align: center; line-height: 1.4;">
          If you don't wish to receive future ambassador updates, please reply to this email with "Unsubscribe".
        </p>
      </div>
    </div>
  `;
}

async function sendEmails() {
  const csvPath = path.resolve(__dirname, 'students_emails.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}\nRun "node extract_emails.js" first to generate the file!`);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.trim().split('\n').slice(1); // Skip header row
  
  console.log(`📋 Found ${lines.length} students in CSV file.`);
  
  if (lines.length === 0) {
    console.log('⚠️ No students to send email to.');
    return;
  }
  
  if (GOOGLE_FORM_URL === 'YOUR_GOOGLE_FORM_LINK_HERE') {
    console.warn('⚠️ WARNING: You have not replaced YOUR_GOOGLE_FORM_LINK_HERE in the script. Please update it before sending.');
    process.exit(1);
  }

  console.log(`🚀 Starting email campaign to ${lines.length} students...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match fields split by comma and strip quotes
    const fields = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    
    if (fields.length < 3) {
      console.warn(`⚠️ Skipping line ${i+2} due to invalid formatting: "${line}"`);
      continue;
    }

    const firstName = fields[0].replace(/"/g, '').trim();
    const lastName = fields[1].replace(/"/g, '').trim();
    const email = fields[2].replace(/"/g, '').trim();

    console.log(`\n📬 [${i+1}/${lines.length}] Sending to: ${firstName} ${lastName} <${email}>...`);

    try {
      const htmlContent = getAmbassadorEmailTemplate(firstName);
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: SUBJECT,
        html: htmlContent,
      });

      if (error) {
        console.error(`❌ Failed for ${email}:`, error.message);
        failCount++;
      } else {
        console.log(`✅ Sent successfully! ID: ${data.id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error sending to ${email}:`, err.message);
      failCount++;
    }

    // Wait 2 seconds (2000ms) between emails to prevent spam detection and comply with rate limits
    if (i < lines.length - 1) {
      console.log(`⏳ Waiting 2 seconds before the next email...`);
      await delay(2000);
    }
  }

  console.log('\n=======================================');
  console.log('🏁 Campaign Completed!');
  console.log(`✅ Successfully Sent: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('=======================================');
}

sendEmails();
