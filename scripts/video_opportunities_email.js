require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.SITE_URL || 'https://www.nextgengrowth.in';

function generateVideoOpportunitiesEmail(firstName) {
  const name = firstName || 'Creator';
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7fcf9;padding:24px;border-radius:20px;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a7c44,#04381e);border-radius:18px;padding:30px 24px;text-align:center;margin-bottom:24px;box-shadow:0 8px 24px rgba(10,124,68,0.2)">
    <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#ffffff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:50px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">🎬 Active Opportunities Alert</span>
    <h1 style="color:#ffffff;margin:0;font-size:24px;line-height:1.3;font-weight:800">Video Editing Projects Are Live! 🚀</h1>
    <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:14px">NextGenGrowth — Student Opportunity Platform</p>
  </div>

  <!-- Body Container -->
  <div style="background:#ffffff;border-radius:18px;padding:28px 24px;border:1px solid #d8ede0;box-shadow:0 4px 16px rgba(0,0,0,0.04)">
    <h2 style="color:#0a1f12;margin-top:0;font-size:20px">Hi ${name}! 👋</h2>
    <p style="color:#2d5a3d;font-size:15px;line-height:1.6;margin-bottom:20px">
      We noticed you have <strong>Video Editing / Content Creation</strong> listed on your NextGenGrowth profile. There are <strong>multiple live paid opportunities</strong> currently accepting applications from student editors!
    </p>

    <!-- Urgency Notice -->
    <div style="background:#fff9e6;border:1px solid #ffe180;border-radius:12px;padding:14px 18px;margin-bottom:24px">
      <p style="margin:0;color:#855d00;font-size:13px;line-height:1.5">
        ⚡ <strong>Urgent Tip:</strong> Brands are shortlisting candidates today. Students who apply early have a <strong>3x higher selection rate</strong>!
      </p>
    </div>

    <h3 style="color:#064e2b;margin:24px 0 14px;font-size:16px;border-bottom:2px solid #e8fdf2;padding-bottom:8px">
      🔥 Live Video Editing Opportunities:
    </h3>

    <!-- Project 1 -->
    <div style="background:#f4fbf7;border:1px solid #c9ecda;border-radius:14px;padding:16px 18px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong style="color:#064e2b;font-size:16px">Short-Form Video Editor (Healthcare Reels)</strong>
      </div>
      <p style="margin:4px 0;color:#2d5a3d;font-size:13px"><strong>🏢 Brand:</strong> Priyanka Udayshankar &nbsp;|&nbsp; <strong>💰 Payout:</strong> <span style="color:#0a7c44;font-weight:700">₹3,500 – ₹6,000</span></p>
      <p style="margin:6px 0 0;color:#4f7a60;font-size:13px">Create engaging, retention-focused Instagram reels with clean transitions and subtitles.</p>
    </div>

    <!-- Project 2 -->
    <div style="background:#f4fbf7;border:1px solid #c9ecda;border-radius:14px;padding:16px 18px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong style="color:#064e2b;font-size:16px">Monthly Video Editor Role</strong>
      </div>
      <p style="margin:4px 0;color:#2d5a3d;font-size:13px"><strong>🏢 Brand:</strong> Priyanka Udayshankar &nbsp;|&nbsp; <strong>💰 Stipend:</strong> <span style="color:#0a7c44;font-weight:700">₹8,000 / month</span></p>
      <p style="margin:6px 0 0;color:#4f7a60;font-size:13px">Consistent monthly retainer role for ongoing video editing & content delivery.</p>
    </div>

    <!-- Project 3 -->
    <div style="background:#f4fbf7;border:1px solid #c9ecda;border-radius:14px;padding:16px 18px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong style="color:#064e2b;font-size:16px">🏸 Content Creator – Badminton (Internship)</strong>
      </div>
      <p style="margin:4px 0;color:#2d5a3d;font-size:13px"><strong>🏢 Brand:</strong> Sportslet &nbsp;|&nbsp; <strong>💰 Stipend:</strong> <span style="color:#0a7c44;font-weight:700">₹10,000 – ₹15,000 / month</span></p>
      <p style="margin:6px 0 0;color:#4f7a60;font-size:13px">Sports content creation, reels editing, and social media production.</p>
    </div>

    <!-- Project 4 -->
    <div style="background:#f4fbf7;border:1px solid #c9ecda;border-radius:14px;padding:16px 18px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong style="color:#064e2b;font-size:16px">Part-time Content Creator / Social Media Creator</strong>
      </div>
      <p style="margin:4px 0;color:#2d5a3d;font-size:13px"><strong>🏢 Brand:</strong> Shruti Goswami &nbsp;|&nbsp; <strong>💰 Payout:</strong> <span style="color:#0a7c44;font-weight:700">₹3,000 – ₹5,000</span></p>
      <p style="margin:6px 0 0;color:#4f7a60;font-size:13px">Video editing & creative social media content production.</p>
    </div>

    <!-- Project 5 -->
    <div style="background:#f4fbf7;border:1px solid #c9ecda;border-radius:14px;padding:16px 18px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong style="color:#064e2b;font-size:16px">Monthly Video Editor & Social Media Intern</strong>
      </div>
      <p style="margin:4px 0;color:#2d5a3d;font-size:13px"><strong>🏢 Brand:</strong> Shruti Goswami &nbsp;|&nbsp; <strong>💰 Stipend:</strong> <span style="color:#0a7c44;font-weight:700">₹3,000 / month</span></p>
      <p style="margin:6px 0 0;color:#4f7a60;font-size:13px">Monthly long-term internship for short-form editing and brand support.</p>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:30px 0 10px">
      <a href="${BASE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0a7c44,#064e2b);color:#ffffff;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 6px 18px rgba(10,124,68,0.3)">
        Apply Now on Dashboard →
      </a>
    </div>
  </div>

  <!-- Footer -->
  <p style="text-align:center;color:#7a9d86;font-size:12px;margin-top:20px;line-height:1.5">
    NextGenGrowth — India's Student Opportunity Platform<br>
    <a href="${BASE_URL}/dashboard" style="color:#0a7c44;text-decoration:none">View Matched Projects</a> &nbsp;|&nbsp; <a href="${BASE_URL}/profile" style="color:#0a7c44;text-decoration:none">Update Skills</a>
  </p>
</div>`;
}

module.exports = { generateVideoOpportunitiesEmail };
