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
    return name ? name.split(' ')[0].trim() : 'Founder';
  }
}

function generatePsychologicalTextTemplate(salutation, company, companyKey) {
  const cleanCompany = company ? company.trim() : 'your startup';
  let personalizedIntro = '';
  let personalizedAngle = '';

  if (companyKey.includes('shoegr') || companyKey.includes('svish') || companyKey.includes('koparo') || companyKey.includes('clensta') || companyKey.includes('boat') || companyKey.includes('sugar') || companyKey.includes('mamaearth') || companyKey.includes('minimalist') || companyKey.includes('plum') || companyKey.includes('pilgrim')) {
    personalizedIntro = `I'm reaching out because I've been following how ${cleanCompany} has been scaling in the direct-to-consumer space. For D2C brands, maintaining a constant stream of high-impact Gen-Z social media content (like edited product reels, aesthetic unboxings, and TikTok ads) is critical to keeping Customer Acquisition Costs (CAC) down.`;
    personalizedAngle = `We connect brands like yours with top-vetted college video editors, designers, and social content writers who understand Gen-Z hooks because they *are* Gen-Z. Instead of paying agency retainers, you can hire them directly for specific tasks (like turning raw product clips into high-retention video reels) to build your content pipeline.`;
  } else if (companyKey.includes('sleepycat') || companyKey.includes('the sleep company') || companyKey.includes('sleepyhead') || companyKey.includes('wakefit') || companyKey.includes('duroflex')) {
    personalizedIntro = `I wanted to connect because I've been studying ${cleanCompany}'s positioning in the premium home comfort and mattress segment. Visual design, high-quality video walkthroughs, and organic peer recommendations are crucial to driving online trust in this high-ticket space.`;
    personalizedAngle = `We can connect you with vetted graphic designers for social creatives, and student marketing teams to drive localized college campaigns. The best part? You can post a task and collaborate directly with students on our dashboard—only approving the output once it meets your guidelines, ensuring zero risk.`;
  } else if (companyKey.includes('healthcred') || companyKey.includes('apnibus') || companyKey.includes('kenko') || companyKey.includes('ikin') || companyKey.includes('superliving')) {
    personalizedIntro = `I'm writing to you because I noticed ${cleanCompany}'s growth in the tech ecosystem. For SaaS, fintech, and digital logistics platforms, getting developer support for quick frontend bug fixes, landing page design, and app download drives is always a bottleneck.`;
    personalizedAngle = `We have a verified database of engineering and design students from colleges like IITs and DU who can develop next-gen UI/UX wireframes or build speed-optimized landing pages. You can delegate frontend tasks directly through our marketplace, saving your core team valuable time.`;
  } else {
    personalizedIntro = `I'm reaching out because I noticed your recent growth milestone at ${cleanCompany}. As founders, we're constantly trying to execute high-quality design, video editing, and marketing campaigns while keeping overheads low and team sizes lean.`;
    personalizedAngle = `NextGenGrowth lets you hire vetted, talented college students for short-term projects (like reel editing, banner design, or web fixes) at a fraction of standard agency overheads. All work is managed on our platform, so you only approve once you are satisfied with the output.`;
  }

  return `Hi ${salutation},

My name is Swatantra Shukla, and I'm the founder of NextGenGrowth.

${personalizedIntro}

${personalizedAngle}

Here is how we verify quality and guarantee results:
- Vetted Talent Only: We screen student portfolios manually. You review verified work samples before selecting an applicant.
- Quality Approval: You assign the project guidelines and only accept the final files once they meet your standards.
- Managed Campus Ambassadors: If you need on-ground college signups or offline activations, we deploy dedicated student squads (like we did for ChakDeBharat and IndiaSportHub).

We have optimized our platform for quick setups. You can post a pilot project on our brand dashboard in under 2 minutes:
https://www.nextgengrowth.in/for-brands

Would love to know if you'd be open to a quick pilot task this week to test out the talent quality.

Warm regards,

Swatantra Shukla
Founder, NextGenGrowth
Phone: +91 9532792303
LinkedIn: https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/`;
}

async function main() {
  const testLead = {
    name: "Aman Gupta",
    company: "boAt",
    email: "hello@boat-lifestyle.com"
  };

  console.log(`🔌 Verifying SMTP Connection...`);
  await transporter.verify();
  console.log(`✅ SMTP Connection verified!`);

  console.log(`🚀 Sending brand outreach preview email to: ${gmailUser} (simulating boAt)...`);
  
  const salutation = getSalutation(testLead.name, testLead.email, testLead.company);
  const text = generatePsychologicalTextTemplate(salutation, testLead.company, testLead.company.toLowerCase());
  const subject = `[PREVIEW] Vetted Gen-Z creators and developers for ${testLead.company} (Quality Guaranteed Pilot)`;

  const mailOptions = {
    from: `"Swatantra Shukla" <${gmailUser}>`,
    to: gmailUser,
    subject: subject,
    text: text
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  console.log(`👉 Please check your Gmail Inbox (${gmailUser}) to review the layout.`);
}

main().catch(err => console.error('❌ Error sending test email:', err.message));
