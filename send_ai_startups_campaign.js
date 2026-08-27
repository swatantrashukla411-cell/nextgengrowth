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

// Map of 100 AI Startups to their founder/contact emails
const emailsMap = {
  "Bolna AI": "rahul@bolna.ai",
  "Perseus": "srikanth@perseus.dev",
  "Composio": "karan@composio.dev",
  "Athina AI": "shivam@athina.ai",
  "Sarvam AI": "vivek@sarvam.ai",
  "Defog AI": "rishabh@defog.ai",
  "Portkey AI": "rohit@portkey.ai",
  "Bland AI": "isaiah@bland.ai",
  "Vapi": "k@vapi.ai",
  "Flowise": "henry@flowiseai.com",
  "LlamaIndex": "jerry@llamaindex.ai",
  "LangSmith": "harrison@langchain.dev",
  "Pika Labs": "demi@pika.art",
  "CognitiveLab": "adithya@cognitivelab.ai",
  "Segmind": "rohit@segmind.com",
  "ElevenLabs": "mateusz@elevenlabs.io",
  "Perplexity AI": "aravind@perplexity.ai",
  "Anyscale": "robert@anyscale.com",
  "Fireworks AI": "lin@fireworks.ai",
  "Together AI": "vipul@together.ai",
  "Fal.ai": "gorkem@fal.ai",
  "RunPod": "ramtin@runpod.io",
  "Vast.ai": "alex@vast.ai",
  "Cognition AI": "scott@cognition.ai",
  "Midjourney": "david@midjourney.com",
  "Runway": "cristobal@runwayml.com",
  "Synthesia": "victor@synthesia.io",
  "Jasper AI": "dave@jasper.ai",
  "Copy.ai": "paul@copy.ai",
  "Writer.com": "may@writer.com",
  "Cohere": "aidan@cohere.com",
  "Anthropic": "dario@anthropic.com",
  "Hugging Face": "clement@huggingface.co",
  "Replicate": "ben@replicate.com",
  "Pinecone": "edo@pinecone.io",
  "Weaviate": "bob@weaviate.io",
  "Milvus": "charles@zilliz.com",
  "Qdrant": "andre@qdrant.com",
  "Chroma DB": "jeff@trychroma.com",
  "Langflow": "rodrigo@langflow.org",
  "AgentOps": "alex@agentops.ai",
  "Superagent": "ismail@superagent.sh",
  "AutoGPT": "toran@autogpt.co",
  "Deepgram": "scott@deepgram.com",
  "AssemblyAI": "dylan@assemblyai.com",
  "Gladia": "jean@gladia.io",
  "Braintrust": "anish@braintrust.dev",
  "Arize AI": "jason@arize.com",
  "Phoenix": "arize-phoenix@arize.com",
  "Fiddler AI": "krishna@fiddler.ai",
  "WhyLabs": "alessio@whylabs.ai",
  "Arthur AI": "mariel@arthur.ai",
  "Giskard": "alex@giskard.ai",
  "Ragas": "shahul@ragas.io",
  "TruLens": "evaluation@trulens.org",
  "Cleanlab": "curtis@cleanlab.ai",
  "Snorkel AI": "alex@snorkel.ai",
  "Scale AI": "alexandr@scale.com",
  "Labelbox": "manu@labelbox.com",
  "V7 Labs": "alberto@v7labs.com",
  "Roboflow": "joseph@roboflow.com",
  "Dify.ai": "peizhi@dify.ai",
  "Flowith": "hello@flowith.com",
  "Phind": "michael@phind.com",
  "Tabnine": "dror@tabnine.com",
  "Double.bot": "support@double.bot",
  "CodiumAI": "itamar@codium.ai",
  "Bito": "amar@bito.ai",
  "Sourcegraph Cody": "quinn@sourcegraph.com",
  "Sweep AI": "william@sweep.dev",
  "Mutable AI": "sohrob@mutable.ai",
  "Codeium": "varun@codeium.com",
  "Anysphere": "arvid@anysphere.co",
  "Superwhisper": "support@superwhisper.com",
  "AudioPen": "louis@audiopen.org",
  "Limitless AI": "dan@limitless.ai",
  "Otter.ai": "sam@otter.ai",
  "Fireflies.ai": "krishan@fireflies.ai",
  "Read AI": "david@read.ai",
  "Fathom": "richard@fathom.video",
  "Gong.io": "amit@gong.io",
  "Chorus.ai": "roy@chorus.ai",
  "Humata AI": "cyrus@humata.ai",
  "ChatPDF": "support@chatpdf.com",
  "Julius AI": "rahul@julius.ai",
  "Rose.com": "tony@rose.com",
  "Hebbia": "george@hebbia.ai",
  "AlphaSense": "jack@alpha-sense.com",
  "Elicit": "andreas@elicit.org",
  "Consensus": "christian@consensus.app",
  "SciSpace": "saikiran@scispace.com",
  "QuillBot": "rohan@quillbot.com",
  "Grammarly": "brad@grammarly.com",
  "DeepL": "jaroslaw@deepl.com",
  "HeyGen": "joshua@heygen.com",
  "D-ID": "gil@d-id.com",
  "ElevenLabs Reader": "support@elevenlabs.io",
  "Suno AI": "mikey@suno.com",
  "Owkin": "thomas@owkin.com",
  "Shield AI": "ryan@shield.ai"
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const jsonPath = path.resolve(__dirname, '100_ai_startups_outreach.json');
  const reportPath = path.resolve(__dirname, '100_ai_startups_report.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON database not found at: ${jsonPath}\nRun "node generate_ai_startups_outreach.js" first.`);
    process.exit(1);
  }

  try {
    const prospects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📋 Total prospects loaded: ${prospects.length}`);

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
        console.log(`ℹ️ Loaded 100_ai_startups_report.json. Found ${sentEmails.size} previously sent emails to skip.`);
      } catch (err) {
        console.warn('⚠️ Could not parse existing 100_ai_startups_report.json. Continuing without skipping.', err.message);
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
    const limit = sendAll ? unsentLeads.length : 5; // Default to 5 for safety check if --all is not passed

    console.log(`🚀 Starting AI Startups Cold Email Campaign. Batch size: ${limit} (Pass --all to send all ${unsentLeads.length} at once)`);
    console.log(`📧 Sender: ${gmailUser}`);
    console.log('------------------------------------------------------------');

    const newDetails = [];

    console.log('🔌 Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified! Sending process started...');

    for (let i = 0; i < limit; i++) {
      const lead = unsentLeads[i];
      const email = lead.email;
      const company = lead.company;
      
      // Dynamic Subject Line matching Campaign 1 styling
      const subject = `Quick idea for ${company} growth`;
      
      // Convert text newlines to HTML line breaks
      const htmlBody = lead.emailBody.replace(/\n/g, '<br>');
      
      console.log(`[${i + 1}/${limit}] Sending to ${company} <${email}>...`);

      try {
        const mailOptions = {
          from: `"Swatantra Shukla" <${gmailUser}>`,
          to: email,
          subject: subject,
          html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">${htmlBody}</div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`  ✅ Sent successfully! Message ID: ${info.messageId}`);
        
        newDetails.push({
          id: lead.id,
          company: company,
          email: email,
          status: 'sent',
          messageId: info.messageId,
          sentAt: new Date().toISOString()
        });

      } catch (err) {
        console.error(`  ❌ Failed to send to ${email}:`, err.message);
        newDetails.push({
          id: lead.id,
          company: company,
          email: email,
          status: 'failed',
          error: err.message,
          attemptedAt: new Date().toISOString()
        });
      }

      // Delay to avoid spam detection (5 seconds)
      if (i < limit - 1) {
        await sleep(5000);
      }
    }

    console.log('------------------------------------------------------------');

    // Combine previous run logs with the new run logs
    const allDetails = [...previousDetails, ...newDetails];
    
    const report = {
      campaignRunAt: new Date().toISOString(),
      sender: gmailUser,
      totalCount: prospects.length,
      sentCount: allDetails.filter(d => d.status === 'sent').length,
      failCount: allDetails.filter(d => d.status === 'failed').length,
      details: allDetails
    };

    console.log(`📊 AI Campaign Summary (Overall):`);
    console.log(`   - Total Database: ${report.totalCount}`);
    console.log(`   - Successfully Sent: ${report.sentCount}`);
    console.log(`   - Failed: ${report.failCount}`);
    console.log(`   - Sent in this batch: ${newDetails.filter(d => d.status === 'sent').length}`);
    console.log(`   - Failed in this batch: ${newDetails.filter(d => d.status === 'failed').length}`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 Campaign report log updated at: ${reportPath}`);

    if (limit < unsentLeads.length) {
      console.log(`\n💡 To send the remaining ${unsentLeads.length - limit} emails, run:`);
      console.log('   node send_ai_startups_campaign.js --all');
    }

  } catch (err) {
    console.error('❌ Critical error during campaign execution:', err.message);
  }
}

main();
