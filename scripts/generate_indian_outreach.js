/**
 * NextGenGrowth — Organic Outreach Script Generator for Indian Startups
 * 
 * Run: node scripts/generate_indian_outreach.js
 */

const fs = require('fs');
const path = require('path');

const outreachContent = `# NextGenGrowth - Organic Outreach Playbook & Copy-Paste Scripts

This playbook is optimized for zero-budget organic acquisition of Indian D2C, consumer tech, and growth-stage startup brands.

---

## 🎯 Target Audience Checklist (Who to search for on LinkedIn)
Search for founders or marketing heads of Indian consumer brands on LinkedIn. Use these search queries:
- \`"Founder" AND "D2C" AND "India"\`
- \`"Co-Founder" AND ("Snack" OR "Apparel" OR "Beverage" OR "Skincare") AND "India"\`
- \`"Head of Marketing" AND "D2C" AND "India"\`
- \`"Growth Manager" AND "D2C" AND "India"\`

---

## 1. LinkedIn Connection Request Notes (Max 300 Characters)
*Use these when sending a connection request to founders or marketing heads. Keep it personal and focused on solving a bottleneck.*

### Option A: Video/Design Focus (D2C Brands)
> Hi [Name], noticed how [Company] is scaling on socials! Visuals are great, but maintaining a pipeline of reels/designs is always a bottleneck. I run NextGenGrowth—we connect brands with top-vetted college editors/designers for zero-risk pilots. Open to connecting?

### Option B: Campus Ambassador Focus (Student Apps / Consumer Brands)
> Hi [Name], love what you are building at [Company]! If you are looking to drive college app downloads or set up campus ambassador squads in Delhi/Bangalore, we have managed student networks at 100+ colleges ready to deploy. Let's connect!

---

## 2. LinkedIn Follow-Up Messages (Once Connected)
*Send these within 24 hours after they accept your connection request.*

### Template: UGC & Content Pipeline (D2C Founders)
\`\`\`text
Hi [Name],

Thanks for connecting! 

If [Company] is looking to scale up organic reels, product shoots, or social design templates without paying high agency retainers, we can help. 

At NextGenGrowth, we verify college creators (video editors, Figma designers, writers) manually. You can hire them for quick pilot tasks on our dashboard:
1. Post a project (it's 100% free to post).
2. Review applicant portfolios and select the best fit.
3. Pay via secure escrow—the money is only released to the student after you approve the final files.

Would you be open to running a small trial reel or graphic design task this week? We'd love to show you the quality.

Best,
Swatantra Shukla
Founder, NextGenGrowth
\`\`\`

### Template: Campus Squads & Offline Growth (Consumer Apps)
\`\`\`text
Hi [Name],

Appreciate the connection!

I wanted to quickly ask if you are planning any college campus campaigns or app-install drives for [Company] this semester. 

NextGenGrowth deploys managed campus ambassador squads. We handle the recruitment, task tracking, and payouts. Our squads can drive:
- Direct app downloads & registration milestones.
- Offline activations (vision check camps, fest promotions, flyers).
- WhatsApp viral chains inside university groups.

We do this at zero upfront retainer—you only pay for verified milestones delivered. 

Would love to jump on a quick 5-min call or share a brief proposal on how we can structure a pilot for [Company]. Let me know what works!

Best,
Swatantra Shukla
nextgengrowth.in
\`\`\`

---

## 3. WhatsApp Pitch (For Marketing Heads / Growth Managers)
*Short, direct, and conversational. Best sent if you get their contact or reach out directly.*

\`\`\`text
Hi [Name], Swatantra here from NextGenGrowth. 

Love [Company]'s recent campaigns! We help Indian D2C brands scale their content pipelines (Reels editing, Figma designs, product UGC) by connecting them with top-vetted student creators.

It's 100% free to post a project on our dashboard, and payouts are escrow-protected (you only pay once you approve the work). 

Would you be open to running a risk-free trial video edit or graphic design banner with one of our verified students this week? 

Link: nextgengrowth.in/for-brands
\`\`\`

---

## 4. Cold Email (Optimized for Indian D2C Founders)
*Send to direct founder/marketing emails (e.g., kshitij@company.in), NOT to support@ or info@.*

**Subject:** Vetted Gen-Z creators for [Company] (Zero-Risk Pilot)

\`\`\`html
Hi [Name],

I'm reaching out because I've been following how [Company] is scaling in the consumer space. 

For D2C brands, keeping a constant stream of high-converting reels and social creatives is key to keeping CAC low. But managing agencies or expensive full-timers is a hassle.

At NextGenGrowth, we connect brands with vetted college video editors, Figma designers, and content writers. You can hire them for single tasks (like editing 5 reels or designing carousels) directly through our platform:

- Free to Post: Post your requirement in under 2 minutes.
- Vetted Portfolios: See student work samples before selecting.
- Escrow Protection: You pay only when you approve the final delivery.

Check out our student portfolio gallery here: https://www.nextgengrowth.in/creators

Would love to know if you'd be open to running a trial project this week to test out the student quality.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth
Phone: +91 9532792303
LinkedIn: https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/
\`\`\`
`;

const outputPath = path.resolve(__dirname, '..', 'indian_outreach_templates.md');
fs.writeFileSync(outputPath, outreachContent, 'utf8');
console.log(`✅ Successfully generated outreach playbook at: ${outputPath}`);
