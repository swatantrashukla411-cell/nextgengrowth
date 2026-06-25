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
    pass: gmailPass.replace(/\s+/g, '') // Remove spaces in password
  }
});

// Helper to determine salutation based on email type (personal vs generic)
function getSalutation(name, email, company) {
  const genericPrefixes = [
    'hello', 'info', 'support', 'careers', 'care', 'contact', 'team', 'connect', 
    'partner', 'growth', 'sales', 'marketing', 'hi', 'help', 'customercare', 
    'book', 'campus', 'talent', 'jobs', 'recruitment', 'hr', 'university', 
    'office', 'admin', 'press', 'media', 'enquiries', 'feedback', 'getcoffee', 
    'service-in', 'service', 'talktous', 'customercare', 'feedback', 'sales'
  ];
  
  const localPart = email.split('@')[0].toLowerCase().trim();
  
  const isGeneric = genericPrefixes.some(prefix => 
    localPart === prefix || 
    localPart.startsWith(prefix + '.') || 
    localPart.startsWith(prefix + '_') || 
    localPart.endsWith('.' + prefix) ||
    localPart.endsWith('_' + prefix)
  );
  
  if (isGeneric) {
    return `Team ${company.trim()}`;
  } else {
    // Return just the first name
    return name ? name.split(' ')[0].trim() : 'Founder';
  }
}

// A highly personalized, high-converting psychological email template tailored to specific startup segments
// ABSOLUTELY ZERO MENTION of money, cost, budget, escrow, pricing, or currency symbols.
function generatePsychologicalEmailTemplate(salutation, company, companyKey) {
  const cleanCompany = company ? company.trim() : 'your startup';

  let personalizedIntro = '';
  let personalizedAngle = '';

  // Tailor template based on company profile segments to maximize response rate
  if (companyKey.includes('shoegr') || companyKey.includes('svish') || companyKey.includes('koparo') || companyKey.includes('clensta') || companyKey.includes('boat') || companyKey.includes('sugar') || companyKey.includes('mamaearth') || companyKey.includes('minimalist') || companyKey.includes('plum') || companyKey.includes('pilgrim')) {
    // D2C / Personal Care / Cleanliness / Fashion Segment
    personalizedIntro = `I'm reaching out because I've been following how <strong>${cleanCompany}</strong> has been scaling in the direct-to-consumer space. For D2C brands, maintaining a constant stream of high-impact Gen-Z social media content (like edited product reels, aesthetic unboxings, and TikTok ads) is critical to keeping Customer Acquisition Costs (CAC) down.`;
    
    personalizedAngle = `We connect brands like yours with top-vetted college video editors, designers, and social content writers who understand Gen-Z hooks because they *are* Gen-Z. Instead of paying agency retainers, you can hire them directly for specific tasks (like turning raw product clips into high-retention video reels) to build your content pipeline.`;
  } else if (companyKey.includes('sleepycat') || companyKey.includes('the sleep company') || companyKey.includes('sleepyhead') || companyKey.includes('wakefit') || companyKey.includes('duroflex')) {
    // Home / Sleep Solutions Segment
    personalizedIntro = `I wanted to connect because I've been studying <strong>${cleanCompany}</strong>'s positioning in the premium home comfort and mattress segment. Visual design, high-quality video walkthroughs, and organic peer recommendations are crucial to driving online trust in this high-ticket space.`;
    
    personalizedAngle = `We can connect you with vetted graphic designers for social creatives, and student marketing teams to drive localized college campaigns. The best part? You can post a task and collaborate directly with students on our dashboard—only approving the output once it meets your guidelines, ensuring zero risk.`;
  } else if (companyKey.includes('healthcred') || companyKey.includes('apnibus') || companyKey.includes('kenko') || companyKey.includes('ikin') || companyKey.includes('superliving')) {
    // FinTech / SaaS / Tech Platform Segment
    personalizedIntro = `I'm writing to you because I noticed <strong>${cleanCompany}</strong>'s growth in the tech ecosystem. For SaaS, fintech, and digital logistics platforms, getting developer support for quick frontend bug fixes, landing page design, and app download drives is always a bottleneck.`;
    
    personalizedAngle = `We have a verified database of engineering and design students from colleges like IITs and DU who can develop next-gen UI/UX wireframes or build speed-optimized landing pages. You can delegate frontend tasks directly through our marketplace, saving your core team valuable time.`;
  } else {
    // General Startup Segment
    personalizedIntro = `I'm reaching out because I noticed your recent growth milestone at <strong>${cleanCompany}</strong>. As founders, we're constantly trying to execute high-quality design, video editing, and marketing campaigns while keeping overheads low and team sizes lean.`;
    
    personalizedAngle = `NextGenGrowth lets you hire vetted, talented college students for short-term projects (like reel editing, banner design, or web fixes) at a fraction of standard agency overheads. All work is managed on our platform, so you only approve once you are satisfied with the output.`;
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <p style="font-size: 15px; margin-top: 0;">Hi ${salutation},</p>

      <p style="font-size: 15px;">
        My name is Swatantra Shukla, and I'm the founder of <strong>NextGenGrowth</strong>. 
      </p>

      <p style="font-size: 15px;">
        ${personalizedIntro}
      </p>

      <p style="font-size: 15px;">
        ${personalizedAngle}
      </p>

      <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 24px; margin-bottom: 8px;">
        Here is how we verify quality and guarantee results:
      </p>
      <ul style="padding-left: 20px; font-size: 14.5px; margin-top: 0; margin-bottom: 24px; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Vetted Talent Only:</strong> We screen student portfolios manually. You review verified work samples before selecting an applicant.</li>
        <li style="margin-bottom: 8px;"><strong>Quality Approval:</strong> You assign the project guidelines and only accept the final files once they meet your standards.</li>
        <li style="margin-bottom: 8px;"><strong>Managed Campus Ambassadors:</strong> If you need on-ground college signups or offline activations, we deploy dedicated student squads (like we did for <strong>ChakDeBharat</strong> and <strong>IndiaSportHub</strong>).</li>
      </ul>

      <p style="font-size: 15px;">
        We have optimized our platform for quick setups. You can post a pilot project on our brand dashboard in under 2 minutes:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="https://www.nextgengrowth.in/for-brands" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; font-weight: 700; border-radius: 9999px; text-decoration: none; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); transition: background-color 0.2s;">
          Post a Pilot Project on Dashboard →
        </a>
      </div>

      <p style="font-size: 13.5px; color: #64748b; text-align: center; margin-bottom: 24px;">
        Or check out our brand page: <a href="https://www.nextgengrowth.in/for-brands" style="color: #10b981; text-decoration: none; font-weight: 600;">nextgengrowth.in/for-brands</a>
      </p>

      <p style="font-size: 15px;">
        Would love to know if you'd be open to a quick pilot task this week to test out the talent quality.
      </p>

      <p style="font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #475569; font-style: normal;">
        Warm regards,<br>
        <strong>Swatantra Shukla</strong><br>
        Founder, NextGenGrowth<br>
        Phone: +91 9532792303<br>
        LinkedIn: <a href="https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/" style="color: #10b981; text-decoration: none; font-weight: 500;">Swatantra Shukla</a>
      </p>
    </div>
  `;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Robust CSV parser that handles quotes and does not split on whitespace
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  const csvPath = path.resolve(__dirname, 'brand_contacts.csv');
  const reportPath = path.resolve(__dirname, 'brand_campaign_report.json');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      console.log('⚠️ No contacts found in CSV file.');
      return;
    }

    const header = parseCSVLine(lines[0]);
    const emailIndex = header.findIndex(h => {
      const clean = h.toLowerCase().trim();
      return clean === 'email' || clean === 'work email' || clean === 'email address';
    });
    const nameIndex = header.findIndex(h => {
      const clean = h.toLowerCase().trim();
      return clean === 'name' || clean === 'full name' || clean === 'contact name';
    });
    const companyIndex = header.findIndex(h => {
      const clean = h.toLowerCase().trim();
      return clean === 'company' || clean === 'brand' || clean === 'company name';
    });

    if (emailIndex === -1 || nameIndex === -1) {
      console.error('❌ Could not find required columns (Name, Email) in the CSV.');
      process.exit(1);
    }

    const brandLeads = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      if (fields.length > Math.max(emailIndex, nameIndex)) {
        brandLeads.push({
          email: fields[emailIndex],
          name: fields[nameIndex],
          company: companyIndex !== -1 ? fields[companyIndex] : 'your company'
        });
      }
    }

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
        console.log(`ℹ️ Loaded brand_campaign_report.json. Found ${sentEmails.size} previously sent emails to skip.`);
      } catch (err) {
        console.warn('⚠️ Could not parse existing brand_campaign_report.json. Continuing without skipping.', err.message);
      }
    }

    // Filter leads to only unsent ones
    const unsentLeads = brandLeads.filter(lead => !sentEmails.has(lead.email.toLowerCase().trim()));

    console.log(`📋 Total Leads: ${brandLeads.length} | Already Sent: ${sentEmails.size} | Unsent Queue: ${unsentLeads.length}`);
    
    if (unsentLeads.length === 0) {
      console.log('✅ All leads have already been emailed! No new emails to send.');
      return;
    }

    console.log(`🚀 Starting Cold Email Campaign to ${unsentLeads.length} new brands via: ${gmailUser}...`);
    console.log('------------------------------------------------------------');

    const newDetails = [];

    console.log('🔌 Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified! Sending process started...');

    for (let i = 0; i < unsentLeads.length; i++) {
      const lead = unsentLeads[i];
      const email = lead.email;
      const name = lead.name;
      const company = lead.company;

      console.log(`[${i + 1}/${unsentLeads.length}] Sending to ${name} <${email}> (${company})...`);

      try {
        const salutation = getSalutation(name, email, company);
        const html = generatePsychologicalEmailTemplate(salutation, company, company.toLowerCase());
        
        // Subject line is quality-focused (No money mentions)
        const subject = `Vetted Gen-Z creators and developers for ${company} (Quality Guaranteed Pilot)`;
        
        const mailOptions = {
          from: `"Swatantra Shukla" <${gmailUser}>`,
          to: email,
          subject: subject,
          html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
        
        newDetails.push({ name: name, email: email, company: company, status: 'sent', messageId: info.messageId });

      } catch (err) {
        console.error(`  ❌ Failed to send to ${email}:`, err.message);
        newDetails.push({ name: name, email: email, company: company, status: 'failed', error: err.message });
      }

      // Delay to avoid SMTP block / spam detection (5 seconds)
      if (i < unsentLeads.length - 1) {
        await sleep(5000);
      }
    }

    console.log('------------------------------------------------------------');

    // Combine previous run logs with the new run logs
    const allDetails = [...previousDetails, ...newDetails];
    
    const report = {
      campaignRunAt: new Date().toISOString(),
      sender: gmailUser,
      totalCount: allDetails.length,
      successCount: allDetails.filter(d => d.status === 'sent').length,
      failCount: allDetails.filter(d => d.status === 'failed').length,
      details: allDetails
    };

    console.log(`📊 Campaign Summary (Overall):`);
    console.log(`   - Total Processed: ${report.totalCount}`);
    console.log(`   - Successful: ${report.successCount}`);
    console.log(`   - Failed: ${report.failCount}`);
    console.log(`   - Sent in this batch: ${newDetails.filter(d => d.status === 'sent').length}`);
    console.log(`   - Failed in this batch: ${newDetails.filter(d => d.status === 'failed').length}`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Detailed log report updated at: ${reportPath}`);

  } catch (err) {
    console.error('❌ Critical error during campaign:', err.message);
  }
}

main();
