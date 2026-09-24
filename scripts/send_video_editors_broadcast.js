require('dotenv').config();
const mongoose = require('mongoose');
const { Resend } = require('resend');
const { generateVideoOpportunitiesEmail } = require('./video_opportunities_email');

const resend = new Resend(process.env.RESEND_API_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function broadcastToVideoEditors() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    const students = await mongoose.connection.collection('users').find({ role: 'student' }).toArray();
    const videoKeywords = ['video', 'editing', 'editor', 'reels', 'premiere', 'after effects', 'capcut', 'davinci', 'motion graphics', 'shorts', 'youtube editing'];

    const editors = [];
    for (const s of students) {
      if (!s.email) continue;
      const cleanSkills = (s.skills || []).map(sk => String(sk).toLowerCase().replace(/[^\w\s]/gi, ' ').trim());
      const headline = String(s.headline || '').toLowerCase();
      const bio = String(s.bio || '').toLowerCase();

      const matches = cleanSkills.some(sk => videoKeywords.some(kw => sk.includes(kw))) ||
                      videoKeywords.some(kw => kw.length >= 4 && (headline.includes(kw) || (kw.length >= 6 && bio.includes(kw))));

      if (matches) {
        editors.push({
          firstName: s.firstName || 'Creator',
          lastName: s.lastName || '',
          email: s.email.trim().toLowerCase()
        });
      }
    }

    // Deduplicate by email
    const uniqueEditorsMap = new Map();
    editors.forEach(e => uniqueEditorsMap.set(e.email, e));
    const uniqueEditors = Array.from(uniqueEditorsMap.values());

    console.log(`\n🎯 Found ${uniqueEditors.length} unique Video Editors to notify:`);
    uniqueEditors.forEach((e, idx) => console.log(`  ${idx + 1}. ${e.firstName} ${e.lastName} <${e.email}>`));

    console.log('\n🚀 Starting email broadcast via Resend (team@nextgengrowth.in)...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uniqueEditors.length; i++) {
      const editor = uniqueEditors[i];
      const html = generateVideoOpportunitiesEmail(editor.firstName);
      const subject = `🔥 5+ Video Editing Opportunities Are Live on NextGenGrowth — Apply Before Spots Fill Up!`;

      try {
        const { data, error } = await resend.emails.send({
          from: 'NextGenGrowth <team@nextgengrowth.in>',
          to: [editor.email],
          subject: subject,
          html: html,
        });

        if (error) {
          console.error(`❌ [${i + 1}/${uniqueEditors.length}] Failed for ${editor.email}:`, error.message);
          failCount++;
        } else {
          console.log(`✅ [${i + 1}/${uniqueEditors.length}] Sent to ${editor.firstName} <${editor.email}> (ID: ${data.id})`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ [${i + 1}/${uniqueEditors.length}] Exception for ${editor.email}:`, err.message);
        failCount++;
      }

      // 150ms delay between emails to stay comfortably below rate limits
      await sleep(150);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log(`🎉 Broadcast Completed!`);
    console.log(`✅ Successfully Delivered: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total Processed: ${uniqueEditors.length}`);
    console.log('═══════════════════════════════════════════════\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Fatal Broadcast Error:', err);
    process.exit(1);
  }
}

broadcastToVideoEditors();
