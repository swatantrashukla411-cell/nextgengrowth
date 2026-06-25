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

// High-converting cold outreach email template
function generateBrandEmailTemplate(name, company) {
  const cleanName = name ? name.trim() : 'Founder';
  const cleanCompany = company ? company.trim() : 'your company';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; line-height: 1.6;">
      <p style="font-size: 15px;">Hi ${cleanName},</p>

      <p style="font-size: 15px;">Hope you are doing well.</p>

      <p style="font-size: 15px;">
        My name is Swatantra Shukla, and I am the founder of <strong>NextGenGrowth</strong>. I am reaching out because I noticed your work at <strong>${cleanCompany}</strong>, and I believe we can help you scale your creative operations while significantly reducing overhead costs.
      </p>

      <p style="font-size: 15px;">
        We are a student-powered marketplace and campus growth platform that connects startups and brands with the top 15% vetted college creators, editors, designers, and developers in India.
      </p>

      <h3 style="color: #10b981; font-size: 17px; margin-top: 24px; border-bottom: 1px solid #eeeeee; padding-bottom: 8px;">Why Startups & Brands use NextGenGrowth:</h3>
      <ol style="padding-left: 20px; font-size: 14.5px;">
        <li style="margin-bottom: 10px;">
          <strong>Direct Marketplace Hiring (40% Cost Savings):</strong> Post creative tasks like video editing (reels/shorts), social media graphic design, content writing, or frontend web development. Hire skilled students on our dashboard at a fraction of agency rates.
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Escrow Protection (Risk-Free):</strong> Your project budget is locked securely in escrow and only released to the student after you review and approve the final files. If they don't deliver, you get a 100% refund.
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Managed Campus Ambassador Campaigns:</strong> Deploy dedicated squads of student ambassadors across campuses to promote your product, organize on-ground events, and drive signups (Case studies like <strong>ChakDeBharat</strong> and <strong>IndiaSportHub</strong> are live on our page).
        </li>
      </ol>

      <p style="font-size: 15px; margin-top: 24px;">
        It takes less than 2 minutes to get started. You can register, build an AI brief, and post a project directly on our platform:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="https://www.nextgengrowth.in/for-brands" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">
          Post a Project (Free Trial) →
        </a>
      </div>

      <p style="font-size: 14px; color: #666666;">
        Check out more details about our vetting system, services, and ambassador programs here: <a href="https://www.nextgengrowth.in/for-brands" style="color: #10b981; text-decoration: none;">nextgengrowth.in/for-brands</a>.
      </p>

      <p style="font-size: 15px; margin-top: 24px;">Would love to see ${cleanCompany} on the platform!</p>

      <p style="font-size: 14px; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 16px; color: #777777;">
        Warm regards,<br>
        <strong>Swatantra Shukla</strong><br>
        Founder, NextGenGrowth<br>
        Phone: +91 9532792303<br>
        LinkedIn: <a href="https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/" style="color: #10b981; text-decoration: none;">Swatantra Shukla</a>
      </p>
    </div>
  `;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCSVLine(line) {
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  return matches.map(val => val.replace(/^"|"$/g, '').trim());
}

async function main() {
  const csvPath = path.resolve(__dirname, 'brand_contacts.csv');

  if (!fs.existsSync(csvPath)) {
    // Generate a template file if it doesn't exist
    const templateContent = 'Name,Company,Email\nRajesh Kumar,D2C Style,rajesh@example.com\nAnjali Sharma,Fintech Solutions,anjali@example.com\n';
    fs.writeFileSync(csvPath, templateContent, 'utf8');
    console.log(`📝 Generated a template CSV file at: ${csvPath}\nPlease fill this file with your brand leads before running the script!`);
    process.exit(0);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      console.log('⚠️ No contacts found in CSV file. Please add your leads to brand_contacts.csv.');
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

    console.log(`📋 Loaded ${brandLeads.length} brand leads from CSV.`);
    console.log(`🚀 Starting Cold Email Campaign to Brands via: ${gmailUser}...`);
    console.log('------------------------------------------------------------');

    const report = {
      campaignRunAt: new Date().toISOString(),
      sender: gmailUser,
      totalCount: brandLeads.length,
      successCount: 0,
      failCount: 0,
      details: []
    };

    console.log('🔌 Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified! Sending process started...');

    for (let i = 0; i < brandLeads.length; i++) {
      const lead = brandLeads[i];
      const email = lead.email;
      const name = lead.name;
      const company = lead.company;

      console.log(`[${i + 1}/${brandLeads.length}] Sending to ${name} <${email}> (${company})...`);

      try {
        const html = generateBrandEmailTemplate(name, company);
        
        const mailOptions = {
          from: `"Swatantra Shukla" <${gmailUser}>`,
          to: email,
          subject: `Get your video editing & design done by vetted Gen-Z talent (40% less cost)`,
          html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
        
        report.successCount++;
        report.details.push({ name: name, email: email, company: company, status: 'sent', messageId: info.messageId });

      } catch (err) {
        console.error(`  ❌ Failed to send to ${email}:`, err.message);
        report.failCount++;
        report.details.push({ name: name, email: email, company: company, status: 'failed', error: err.message });
      }

      // Delay to avoid SMTP block / spam detection (5 seconds default)
      if (i < brandLeads.length - 1) {
        await sleep(5000);
      }
    }

    console.log('------------------------------------------------------------');
    console.log(`📊 Campaign Summary:`);
    console.log(`   - Total Processed: ${brandLeads.length}`);
    console.log(`   - Successful: ${report.successCount}`);
    console.log(`   - Failed: ${report.failCount}`);

    const reportPath = path.resolve(__dirname, 'brand_campaign_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Detailed log report written to: ${reportPath}`);

  } catch (err) {
    console.error('❌ Critical error during campaign:', err.message);
  }
}

main();
