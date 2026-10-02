const mongoose = require('mongoose');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY is not defined in .env file.');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

// Parse CLI arguments
const args = process.argv.slice(2);
let testEmail = null;
let isDryRun = false;
let sendAll = false;
let customLink = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--test' && args[i + 1]) {
    testEmail = args[i + 1].toLowerCase().trim();
    i++;
  } else if (args[i] === '--dry-run') {
    isDryRun = true;
  } else if (args[i] === '--send-all') {
    sendAll = true;
  } else if (args[i] === '--link' && args[i + 1]) {
    customLink = args[i + 1].trim();
    i++;
  }
}

const WHATSAPP_LINK = customLink || process.env.WHATSAPP_COMMUNITY_LINK || 'https://chat.whatsapp.com/invite/nextgengrowth';
const SITE_URL = (process.env.SITE_URL || 'https://www.nextgengrowth.in').replace(/\/$/, '');
const DASHBOARD_URL = `${SITE_URL}/dashboard`;
const FROM_EMAIL = 'Swatantra from NextGenGrowth <team@nextgengrowth.in>';
const SUBJECT = 'NextGenGrowth: Direct client projects & WhatsApp Community invite';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateTagdiEmail(firstName, skills = []) {
  const name = firstName ? firstName.trim() : 'there';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:24px 12px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;font-size:15px;line-height:1.65;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px 28px;border-radius:12px;border:1px solid #e2e8f0;">
    
    <p style="margin-top:0;font-size:16px;">Hi <strong>${name}</strong>,</p>

    <p>I hope you are doing well.</p>

    <p>Since you are a registered student on NextGenGrowth, I am personally reaching out to invite you to our official WhatsApp Community: <strong>NextGenGrowth Skilled Team</strong>.</p>

    <p>We are currently onboarding brands and startups with live paid requirements (Video Editing, Graphic Design, Web Development, Content Writing, AI Tools, Social Media, etc.). Rather than having you wait through long bidding cycles on the platform, <strong>I will be manually distributing and assigning client tasks directly through this WhatsApp community.</strong></p>

    <div style="margin:26px 0;">
      <a href="${WHATSAPP_LINK}" target="_blank" style="display:inline-block;background:#25d366;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        👉 Join WhatsApp Community →
      </a>
      <div style="margin-top:8px;font-size:13px;color:#64748b;">
        Direct link: <a href="${WHATSAPP_LINK}" style="color:#059669;">${WHATSAPP_LINK}</a>
      </div>
    </div>

    <div style="background:#f1f5f9;border-left:3px solid #10b981;padding:12px 16px;border-radius:6px;font-size:14px;margin-bottom:20px;">
      <strong>⚠️ Quick Action Required:</strong><br>
      Please log into your <a href="${DASHBOARD_URL}" style="color:#059669;font-weight:600;">NextGenGrowth Dashboard</a> and confirm your <strong>10-digit WhatsApp number</strong> so our team can reach out to you directly as matching project briefs come in.
    </div>

    <p style="margin-top:20px;">
      If you have any questions or recent work samples you'd like to share, feel free to reply directly to this email.
    </p>

    <div style="margin-top:28px;border-top:1px solid #f1f5f9;padding-top:18px;color:#475569;font-size:14px;line-height:1.5;">
      Best regards,<br>
      <strong style="color:#0f172a;font-size:15px;">Swatantra Shukla</strong><br>
      Founder, NextGenGrowth<br>
      <a href="${SITE_URL}" style="color:#059669;text-decoration:none;font-size:13px;">www.nextgengrowth.in</a>
    </div>

  </div>
</body>
</html>
`;
}

async function run() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 NextGenGrowth: WhatsApp Community Email Broadcast');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 WhatsApp Community Link: ${WHATSAPP_LINK}`);
    console.log(`✉️  Sender: ${FROM_EMAIL}`);
    console.log(`🔗 Dashboard Link: ${DASHBOARD_URL}`);

    if (testEmail) {
      console.log(`\n🧪 TEST MODE ACTIVE: Sending single preview email to: ${testEmail}`);
      const html = generateTagdiEmail('Swatantra', ['Video Editing', 'Web Development', 'AI Tools']);
      const res = await resend.emails.send({
        from: FROM_EMAIL,
        to: [testEmail],
        subject: SUBJECT,
        html: html,
      });
      if (res.error) {
        console.error('❌ Test email failed:', res.error);
      } else {
        console.log(`✅ Test email successfully sent! Resend ID: ${res.data?.id}`);
        console.log(`👉 Please check your inbox at: ${testEmail}`);
      }
      return;
    }

    // Connect to Mongo to fetch all students
    console.log('\nConnecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB.');

    const students = await mongoose.connection.collection('users')
      .find({ role: 'student' })
      .project({ firstName: 1, lastName: 1, email: 1, skills: 1 })
      .toArray();

    console.log(`📋 Total Registered Students Found: ${students.length}`);

    if (isDryRun) {
      console.log('\n🔍 DRY RUN MODE: No emails will be sent.');
      console.log(`Would send to ${students.length} students. Sample targets:`);
      students.slice(0, 5).forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName || ''} <${s.email}> (${(s.skills || []).join(', ') || 'No skills listed'})`);
      });
      console.log('\nTo send for real, run with: node scripts/send_whatsapp_community_invite.js --send-all');
      return;
    }

    if (!sendAll) {
      console.log('\n⚠️  SAFETY NOTICE: Neither --test nor --send-all was specified.');
      console.log('Usage:');
      console.log('  1. Test first on your email:');
      console.log('     node scripts/send_whatsapp_community_invite.js --test swatantrashukla411@gmail.com');
      console.log('  2. Preview without sending:');
      console.log('     node scripts/send_whatsapp_community_invite.js --dry-run');
      console.log('  3. Send to all students:');
      console.log('     node scripts/send_whatsapp_community_invite.js --send-all');
      console.log('  4. Custom WhatsApp Link:');
      console.log('     node scripts/send_whatsapp_community_invite.js --send-all --link https://chat.whatsapp.com/XXXXX');
      return;
    }

    console.log(`\n🚀 Starting live broadcast to ${students.length} students...`);
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const email = (student.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        console.log(`⏩ [${i + 1}/${students.length}] Skipping invalid email: ${email}`);
        continue;
      }

      const html = generateTagdiEmail(student.firstName, student.skills);
      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [email],
          subject: SUBJECT,
          html: html,
        });

        if (error) {
          console.error(`❌ [${i + 1}/${students.length}] Failed to send to ${email}:`, error.message);
          failedCount++;
        } else {
          console.log(`✅ [${i + 1}/${students.length}] Sent to ${student.firstName || 'Student'} <${email}> (ID: ${data?.id})`);
          sentCount++;
        }
      } catch (err) {
        console.error(`❌ [${i + 1}/${students.length}] Exception sending to ${email}:`, err.message);
        failedCount++;
      }

      // 400ms throttle to stay comfortably within Resend rate limits
      await delay(400);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Broadcast Completed! Total Sent: ${sentCount}, Failed: ${failedCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('Fatal error in script:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

run().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
