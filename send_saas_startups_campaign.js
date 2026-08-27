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

// Map of 100 SaaS Startups to their founder/contact emails
const emailsMap = {
  // Developer Tools
  "Clerk": "colin@clerk.com",
  "Resend": "zeno@resend.com",
  "Railway": "jake@railway.app",
  "Neon": "nikita@neon.tech",
  "Supabase": "paul@supabase.io",
  "Vercel": "guillermo@vercel.com",
  "Sentry": "david@sentry.io",
  "Temporal": "maxim@temporal.io",
  "Codeium": "varun@codeium.com",
  "GitBook": "samy@gitbook.com",
  "Codacy": "jaime@codacy.com",
  "Inngest": "dan@inngest.com",
  "Trigger.dev": "james@trigger.dev",
  "Dub.co": "steven@dub.co",
  "Axiom": "neil@axiom.co",

  // Marketing SaaS
  "Jasper": "dave@jasper.ai",
  "Copy.ai": "paul@copy.ai",
  "Writesonic": "samanyou@writesonic.com",
  "Mutiny": "jalyc@mutinyhq.com",
  "Senja": "olney@senja.io",
  "Testimonial.to": "dameng@testimonial.to",
  "Taplio": "tibo@taplio.com",
  "TweetHunter": "tibo@tweethunter.io",
  "SurferSEO": "szymon@surferseo.com",
  "Figma": "dylan@figma.com",
  "Klaviyo": "andrew@klaviyo.com",
  "ConvertKit": "nathan@convertkit.com",
  "Buffer": "joel@buffer.com",
  "Unbounce": "rick@unbounce.com",
  "Leadpages": "contact@leadpages.com",

  // HR/Recruitment SaaS
  "Ashby": "benji@ashbyhq.com",
  "Greenhouse": "daniel@greenhouse.io",
  "Lever": "sarah@lever.co",
  "Kula": "acharya@kula.ai",
  "Gem": "steve@gem.com",
  "Deel": "alex@deel.com",
  "Rippling": "parker@rippling.com",
  "Oyster": "tony@oysterhr.com",
  "Multiplier": "sagar@usemultiplier.com",
  "Gusto": "josh@gusto.com",
  "BambooHR": "ben@bamboohr.com",
  "Remote.com": "job@remote.com",
  "Lattice": "jack@lattice.com",
  "Culture Amp": "didier@cultureamp.com",
  "15Five": "david@15five.com",

  // AI SaaS Tools
  "HeyGen": "joshua@heygen.com",
  "ElevenLabs": "mati@elevenlabs.io",
  "Runway": "cristobal@runwayml.com",
  "Tavus": "hassam@tavus.io",
  "Synthesia": "victor@synthesia.io",
  "Perplexity": "arvind@perplexity.ai",
  "DeepL": "jaroslaw@deepl.com",
  "Pika": "demi@pika.art",
  "Suno": "mikey@suno.com",
  "Harvey": "winston@harvey.ai",
  "Bland.ai": "isaiah@bland.ai",
  "Vapi": "k@vapi.ai",
  "Athina AI": "shivam@athina.ai",
  "Composio": "karan@composio.dev",
  "Defog AI": "rishabh@defog.ai",

  // Productivity SaaS
  "Notion": "ivan@notion.so",
  "Coda": "shishir@coda.io",
  "Linear": "karri@linear.app",
  "ClickUp": "zeb@clickup.com",
  "Todoist": "amix@doist.io",
  "Slite": "christophe@slite.com",
  "Raycast": "thomas@raycast.com",
  "Loom": "joe@loom.com",
  "Superhuman": "rahul@superhuman.com",
  "Miro": "andrey@miro.com",
  "Mural": "mariano@mural.co",
  "Asana": "dustin@asana.com",
  "Monday.com": "roy@monday.com",
  "Fellow.app": "ayman@fellow.app",
  "Grain": "cody@grain.co",

  // Sales/CRM Tools
  "Folk": "simon@folk.app",
  "Attio": "nicolas@attio.com",
  "Clay": "kareem@clay.com",
  "Apollo.io": "tim@apollo.io",
  "Close": "steli@close.com",
  "Pipedrive": "timo@pipedrive.com",
  "Salesloft": "kyle@salesloft.com",
  "Outreach": "manny@outreach.io",
  "Gong": "amit@gong.io",
  "Clari": "andy@clari.com",
  "Scratchpad": "pouyan@scratchpad.com",
  "Lusha": "yassine@lusha.co",
  "Hunter.io": "francois@hunter.io",
  "Cognism": "james@cognism.com",
  "Lemlist": "guillaume@lemlist.com",

  // Analytics Platforms
  "Mixpanel": "suhail@mixpanel.com",
  "Amplitude": "spenser@amplitude.com",
  "Heap": "matin@heap.io",
  "Plausible": "marko@plausible.io",
  "Fathom": "paul@usefathom.com",
  "Simple Analytics": "adriaan@simpleanalytics.com",
  "Hotjar": "david@hotjar.com",
  "Smartlook": "petr@smartlook.com",
  "HockeyStack": "bugra@hockeystack.com",
  "June.so": "enzo@june.so"
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const jsonPath = path.resolve(__dirname, '100_saas_startups_outreach.json');
  const reportPath = path.resolve(__dirname, '100_saas_startups_report.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON database not found at: ${jsonPath}\nRun "node generate_saas_startups_outreach.js" first.`);
    process.exit(1);
  }

  try {
    const prospects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📋 Total B2B SaaS prospects loaded: ${prospects.length}`);

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
        console.log(`ℹ️ Loaded 100_saas_startups_report.json. Found ${sentEmails.size} previously sent emails to skip.`);
      } catch (err) {
        console.warn('⚠️ Could not parse existing 100_saas_startups_report.json. Continuing without skipping.', err.message);
      }
    }

    // Filter leads to only unsent ones and map emails
    const unsentLeads = [];
    prospects.forEach(lead => {
      const email = emailsMap[lead.company];
      if (!email) {
        console.warn(`⚠️ Warning: Could not find email mapping for company: "${lead.company}"`);
        return;
      }
      if (!sentEmails.has(email.toLowerCase().trim())) {
        unsentLeads.push({
          ...lead,
          email: email
        });
      }
    });

    console.log(`📋 Unsent Queue: ${unsentLeads.length}`);
    
    if (unsentLeads.length === 0) {
      console.log('✅ All leads have already been emailed! No new emails to send.');
      return;
    }

    const sendAll = process.argv.includes('--all');
    const dryRun = process.argv.includes('--dry-run');
    const limit = sendAll ? unsentLeads.length : 5; // Default to 5 for safety check if --all is not passed

    console.log(`🚀 Starting SaaS Startups Cold Email Campaign. Batch size: ${limit} (Pass --all to send all ${unsentLeads.length} at once)`);
    if (dryRun) {
      console.log(`⚠️ DRY RUN MODE ACTIVE: No actual emails will be sent. Connection will be tested and logs simulated.`);
    }
    console.log(`📧 Sender: ${gmailUser}`);
    console.log('------------------------------------------------------------');

    const newDetails = [];

    console.log('🔌 Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified! Starting campaign sequence...');

    for (let i = 0; i < limit; i++) {
      const lead = unsentLeads[i];
      const email = lead.email;
      const company = lead.company;
      
      const subject = `Question regarding execution support at ${company}`;
      const htmlBody = lead.emailBody.replace(/\n/g, '<br>');
      
      if (dryRun) {
        console.log(`[DRY-RUN] [${i + 1}/${limit}] Would send to ${company} <${email}>:`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Snippet: "${lead.emailBody.substring(0, 120)}..."`);
        console.log(`✅ [Simulated Sent]`);
        
        newDetails.push({
          id: lead.id,
          company: company,
          email: email,
          status: 'sent',
          messageId: `dry-run-simulated-id-${Date.now()}-${lead.id}`,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`[${i + 1}/${limit}] Sending to ${company} <${email}>...`);
        try {
          const mailOptions = {
            from: `"Swatantra Shukla" <${gmailUser}>`,
            to: email,
            subject: subject,
            text: lead.emailBody,
            html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">${htmlBody}</div>`
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Sent successfully! MessageId: ${info.messageId}`);
          
          newDetails.push({
            id: lead.id,
            company: company,
            email: email,
            status: 'sent',
            messageId: info.messageId,
            timestamp: new Date().toISOString()
          });

          // Sleep to avoid rate limiting and look natural (between 6-12 seconds)
          const delay = Math.floor(Math.random() * 6000) + 6000;
          if (i < limit - 1) {
            console.log(`😴 Sleeping for ${(delay / 1000).toFixed(1)} seconds...`);
            await sleep(delay);
          }
        } catch (err) {
          console.error(`❌ Failed to send to ${company} <${email}>:`, err.message);
          newDetails.push({
            id: lead.id,
            company: company,
            email: email,
            status: 'failed',
            error: err.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Combine previous report logs with new ones
    const updatedDetails = [...previousDetails];
    
    // Merge status logic (replace or append new logs)
    newDetails.forEach(newLog => {
      const idx = updatedDetails.findIndex(d => d.email.toLowerCase() === newLog.email.toLowerCase());
      if (idx !== -1) {
        updatedDetails[idx] = newLog;
      } else {
        updatedDetails.push(newLog);
      }
    });

    const successCount = updatedDetails.filter(d => d.status === 'sent').length;
    const failCount = updatedDetails.filter(d => d.status === 'failed').length;

    const reportData = {
      campaign: '100 B2B SaaS Startups Outreach Campaign',
      sender: gmailUser,
      totalLeads: prospects.length,
      sentCount: successCount,
      failedCount: failCount,
      lastUpdated: new Date().toISOString(),
      details: updatedDetails
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
    console.log('------------------------------------------------------------');
    console.log(`📊 Campaign Progress updated: ${reportPath}`);
    console.log(`   - Sent: ${successCount}/${prospects.length}`);
    console.log(`   - Failed: ${failCount}`);
    console.log('🏁 Campaign batch run completed!');

  } catch (error) {
    console.error('❌ Critical error running campaign:', error.message);
  }
}

main();
