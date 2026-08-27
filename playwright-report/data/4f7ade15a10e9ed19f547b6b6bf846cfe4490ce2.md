# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: for-brands.spec.js >> NextGenGrowth For Brands responsiveness & styling >> should load page and have HTML text-size-adjust set correctly
- Location: tests-e2e\for-brands.spec.js:4:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "100%"
Received: "auto"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "NextGenGrowth Logo NextGenGrowth" [ref=e3] [cursor=pointer]:
      - /url: /
      - img "NextGenGrowth Logo" [ref=e5]
      - generic [ref=e6]: NextGenGrowth
    - navigation [ref=e7]:
      - link "Creative Services" [ref=e8] [cursor=pointer]:
        - /url: "#creative-services"
      - link "Our Pillars" [ref=e9] [cursor=pointer]:
        - /url: "#services"
      - link "Campus Network" [ref=e10] [cursor=pointer]:
        - /url: "#ambassador"
      - link "Success Stories" [ref=e11] [cursor=pointer]:
        - /url: "#cases"
      - link "Platform" [ref=e12] [cursor=pointer]:
        - /url: "#dashboard"
      - link "FAQ" [ref=e13] [cursor=pointer]:
        - /url: "#faq"
    - generic [ref=e14]:
      - link "Client Login" [ref=e15] [cursor=pointer]:
        - /url: /login
      - link "Post a Project" [ref=e16] [cursor=pointer]:
        - /url: /login?tab=register&role=brand
  - generic:
    - generic:
      - link "Creative Services":
        - /url: "#creative-services"
      - link "Our Pillars":
        - /url: "#services"
      - link "Campus Network":
        - /url: "#ambassador"
      - link "Success Stories":
        - /url: "#cases"
      - link "Platform":
        - /url: "#dashboard"
      - link "Client Login":
        - /url: /login
      - link "Post a Project":
        - /url: /login?tab=register&role=brand
  - generic [ref=e18]:
    - generic [ref=e19]:
      - generic [ref=e20]: Vetted Student Creators & Campus Campaigns
      - heading "Hire Verified College Talent & Scale Your Campus Reach" [level=1] [ref=e22]:
        - text: Hire Verified College Talent
        - text: "& Scale Your Campus Reach"
      - paragraph [ref=e23]: Post creative projects (video editing, graphic design, writing) on our secure marketplace, or deploy managed Campus Ambassador squads. Get high-quality Gen-Z execution, backed by a 7-day risk-free pilot.
      - generic [ref=e24]:
        - link "Post a Project (Free Trial)" [ref=e25] [cursor=pointer]:
          - /url: /login?tab=register&role=brand
        - link "Deploy Campus Network" [ref=e26] [cursor=pointer]:
          - /url: "#contact"
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: 0+
          - generic [ref=e30]: Colleges Reached
        - generic [ref=e31]:
          - generic [ref=e32]: 0+
          - generic [ref=e33]: Verified Students
        - generic [ref=e34]:
          - generic [ref=e35]: 40%
          - generic [ref=e36]: Cost Savings
    - generic [ref=e37]:
      - generic [ref=e52]:
        - heading "Campus Ambassadors" [level=4] [ref=e53]
        - paragraph [ref=e54]: 25 active reps deployed in Delhi NCR colleges
      - generic [ref=e59]:
        - heading "Latest UGC Campaign" [level=4] [ref=e60]
        - paragraph [ref=e61]: 15 creator submissions received
        - text: APPROVED
  - generic [ref=e63]:
    - generic [ref=e64]:
      - heading "Vetted for Quality. Built for Startups." [level=2] [ref=e65]
      - paragraph [ref=e66]: How we ensure you only work with the top 15% of college talent.
    - generic [ref=e67]:
      - generic [ref=e68]:
        - img [ref=e70]
        - generic [ref=e72]:
          - heading "Rigorous Portfolio Screening" [level=3] [ref=e73]
          - paragraph [ref=e74]: Every student applicant must submit past work proofs. We manually verify and screen their portfolios before they can apply to your campaigns.
      - generic [ref=e75]:
        - img [ref=e77]
        - generic [ref=e79]:
          - heading "Milestone Escrow Protection" [level=3] [ref=e80]
          - paragraph [ref=e81]: Your budget is held safely in escrow. Payouts are released only after you review and approve the final completed creative deliverables.
      - generic [ref=e82]:
        - img [ref=e84]
        - generic [ref=e86]:
          - heading "Full KYC & Verification" [level=3] [ref=e87]
          - paragraph [ref=e88]: We check student credentials and official college IDs. Rest easy knowing that the students working on your projects are legitimate and accountable.
  - generic [ref=e90]:
    - generic [ref=e91]:
      - heading "Hire for Creative Projects" [level=2] [ref=e92]
      - paragraph [ref=e93]: Directly hire skilled student talent on our marketplace for a fraction of the agency cost.
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic [ref=e96]: 🎬
        - generic [ref=e97]:
          - heading "Video Editing & Reels" [level=3] [ref=e98]
          - paragraph [ref=e99]: Gen-Z editors who know CapCut, Premiere Pro, and typography. Turn raw clips into high-retention reels, TikToks, and YouTube thumbnails.
          - generic [ref=e100]:
            - generic [ref=e101]: Shorts & Reels
            - generic [ref=e102]: CapCut Subtitles
            - generic [ref=e103]: Color Grading
      - generic [ref=e104]:
        - generic [ref=e105]: 🎨
        - generic [ref=e106]:
          - heading "Graphic Design & UI/UX" [level=3] [ref=e107]
          - paragraph [ref=e108]: Figma-fluent student designers creating modern social media banners, pitch decks, landing pages, and vector brand illustrations.
          - generic [ref=e109]:
            - generic [ref=e110]: Figma UI
            - generic [ref=e111]: Social Creatives
            - generic [ref=e112]: Pitch Decks
      - generic [ref=e113]:
        - generic [ref=e114]: 💻
        - generic [ref=e115]:
          - heading "Web & App Development" [level=3] [ref=e116]
          - paragraph [ref=e117]: Student developers creating lightning-fast landing pages, Next.js React templates, Shopify stores, and fixing frontend bugs.
          - generic [ref=e118]:
            - generic [ref=e119]: React / Next.js
            - generic [ref=e120]: Tailwind CSS
            - generic [ref=e121]: Shopify Setup
      - generic [ref=e122]:
        - generic [ref=e123]: ✍️
        - generic [ref=e124]:
          - heading "Content & Script Writing" [level=3] [ref=e125]
          - paragraph [ref=e126]: Copywriters who understand Gen-Z hooks. Get high-ranking SEO blogs, email newsletters, reel scripts, and ad copywriting.
          - generic [ref=e127]:
            - generic [ref=e128]: SEO Blogs
            - generic [ref=e129]: Reel Scripts
            - generic [ref=e130]: Ad Copy
    - link "Hire Creative Students Now" [ref=e132] [cursor=pointer]:
      - /url: /login?tab=register&role=brand
  - generic [ref=e134]:
    - generic [ref=e135]:
      - heading "Success Stories & Case Studies" [level=2] [ref=e136]
      - paragraph [ref=e137]: How top brands leverage our combined marketplace talent and campus ambassador network.
    - generic [ref=e138]:
      - generic [ref=e139]:
        - generic [ref=e140]: ChakDeBharat
        - heading "Organized On-Ground Campaigns & Creative Support" [level=3] [ref=e141]
        - paragraph [ref=e142]: Humne Delhi NCR ke 15+ major college campuses mein ChakDeBharat ke liye targeted events organize kiye. NextGenGrowth ke campus ambassadors ne physical registration booths lagaye aur coordinate kiya, jabki hamare creative student developers aur designers ne high-converting promotional banners aur reels assets design kiye.
        - generic [ref=e143]:
          - generic [ref=e144]:
            - generic [ref=e145]: 15+
            - generic [ref=e146]: Campuses Covered
          - generic [ref=e147]:
            - generic [ref=e148]: 20,000+
            - generic [ref=e149]: Student Impressions
      - generic [ref=e150]:
        - generic [ref=e151]: IndiaSportHub
        - heading "Tournament Hype & On-Campus Signups" [level=3] [ref=e152]
        - paragraph [ref=e153]: IndiaSportHub ke regional tournaments ke liye humne 30+ official campus ambassadors deploy kiye. Ambassadors ne offline sports matches promote kiye aur college clubs ke sath collaborations set kiye. Usi dauran, NextGenGrowth marketplace se hired editors ne event coverage videos aur reels generate kiye, jisse user base dramatically grow hua.
        - generic [ref=e154]:
          - generic [ref=e155]:
            - generic [ref=e156]: 30+
            - generic [ref=e157]: Ambassadors Deployed
          - generic [ref=e158]:
            - generic [ref=e159]: 5,000+
            - generic [ref=e160]: App Signups
  - generic [ref=e162]:
    - generic [ref=e163]:
      - heading "The Student-Powered Growth Engine" [level=2] [ref=e164]
      - paragraph [ref=e165]: 5 key pillars designed to drive authentic college reach, high-converting content, and digital execution.
    - generic [ref=e166]:
      - generic [ref=e167]:
        - img [ref=e169]
        - heading "Campus Ambassadors" [level=3] [ref=e171]
        - paragraph [ref=e172]: Verified campus representatives promoting your brand on-ground through community events, posters, and campus group outreach.
        - list [ref=e173]:
          - listitem [ref=e174]:
            - img [ref=e175]
            - text: On-ground college presence
          - listitem [ref=e177]:
            - img [ref=e178]
            - text: Event organization & promos
          - listitem [ref=e180]:
            - img [ref=e181]
            - text: Lead generation drives
      - generic [ref=e183]:
        - img [ref=e185]
        - heading "Content Creators (UGC)" [level=3] [ref=e187]
        - paragraph [ref=e188]: Ambitious college creators building high-converting reels, TikToks, UGC videos, and graphic assets curated specifically for your brand.
        - list [ref=e189]:
          - listitem [ref=e190]:
            - img [ref=e191]
            - text: Slick social video content
          - listitem [ref=e193]:
            - img [ref=e194]
            - text: Premium editing & design
          - listitem [ref=e196]:
            - img [ref=e197]
            - text: High engagement metrics
      - generic [ref=e199]:
        - img [ref=e201]
        - heading "Marketing & Campaigns" [level=3] [ref=e204]
        - paragraph [ref=e205]: Dynamic micro-campaigns designed to spark brand recognition. Launch influencer seeding, community challenges, and campus sign-up marathons.
        - list [ref=e206]:
          - listitem [ref=e207]:
            - img [ref=e208]
            - text: Influencer product seeding
          - listitem [ref=e210]:
            - img [ref=e211]
            - text: App download campaigns
          - listitem [ref=e213]:
            - img [ref=e214]
            - text: Social buzz trigger drives
      - generic [ref=e216]:
        - img [ref=e218]
        - heading "Sales & Outreach Force" [level=3] [ref=e220]
        - paragraph [ref=e221]: A specialized student sales team executing lead generation, campus trials, partnership setups, and referral campaigns.
        - list [ref=e222]:
          - listitem [ref=e223]:
            - img [ref=e224]
            - text: Campus referral sales
          - listitem [ref=e226]:
            - img [ref=e227]
            - text: Direct sales drives
          - listitem [ref=e229]:
            - img [ref=e230]
            - text: Product testing feedback
      - generic [ref=e232]:
        - img [ref=e234]
        - heading "Community Building" [level=3] [ref=e236]
        - paragraph [ref=e237]: Establish and grow a dedicated club or Discord server for your brand. Create organic brand ambassadors who promote your products for the long haul.
        - list [ref=e238]:
          - listitem [ref=e239]:
            - img [ref=e240]
            - text: Brand-themed student clubs
          - listitem [ref=e242]:
            - img [ref=e243]
            - text: Online college communities
          - listitem [ref=e245]:
            - img [ref=e246]
            - text: Peer-to-peer discussions
      - generic [ref=e248]:
        - img [ref=e250]
        - heading "Start With A Free Pilot" [level=3] [ref=e252]
        - paragraph [ref=e253]: No commitment needed. Request a simple project or small pilot task first, see student applications within 24 hours, and pay only if you confirm.
        - link "Post a Project (Free)" [ref=e254] [cursor=pointer]:
          - /url: /login?tab=register&role=brand
  - generic [ref=e257]:
    - generic [ref=e258]:
      - generic [ref=e259]: Fully Managed Program
      - heading "Official Campus Ambassador Campaigns" [level=2] [ref=e261]
      - paragraph [ref=e262]: This isn't a spammy referral program. We build a structured, vetted ambassador squad that represents your brand officially on-ground, coordinates events, distributes merchandise, and gains authentic signups.
      - generic [ref=e263]:
        - generic [ref=e264]:
          - img [ref=e266]
          - generic [ref=e268]:
            - heading "Strict Selection (Top 2%)" [level=4] [ref=e269]
            - paragraph [ref=e270]: We filter out inactive students and recruit only highly active, connected student leaders, college union heads, and community organizers.
        - generic [ref=e271]:
          - img [ref=e273]
          - generic [ref=e275]:
            - heading "Manual Setup, Full Support" [level=4] [ref=e276]
            - paragraph [ref=e277]: We work closely with you to define KPIs, write clear campaign briefs, design incentives, and handle student queries directly.
        - generic [ref=e278]:
          - img [ref=e280]
          - generic [ref=e282]:
            - heading "Performance Rewards" [level=4] [ref=e283]
            - paragraph [ref=e284]: Ambassadors stay motivated with structured certificates, performance bonuses, premium merchandise, and letter of recommendations.
      - link "Discuss Ambassador Program" [ref=e286] [cursor=pointer]:
        - /url: https://wa.me/919532792303?text=Hi!%20I%20want%20to%20know%20more%20about%20deploying%20a%20Campus%20Ambassador%20program%20for%20my%20brand.
        - img [ref=e287]
        - text: Discuss Ambassador Program
    - generic [ref=e290]:
      - generic [ref=e291]:
        - heading "Campaign Pipeline" [level=3] [ref=e292]
        - text: Active (Delhi NCR)
      - generic [ref=e293]:
        - generic [ref=e294]:
          - generic [ref=e295]:
            - generic [ref=e296]: "1"
            - generic [ref=e297]: Recruitment & Vetting
          - generic [ref=e298]: Done
        - generic [ref=e299]:
          - generic [ref=e300]:
            - generic [ref=e301]: "2"
            - generic [ref=e302]: Briefing & Collateral
          - generic [ref=e303]: Done
        - generic [ref=e304]:
          - generic [ref=e305]:
            - generic [ref=e306]: "3"
            - generic [ref=e307]: Campus Merch Distribution
          - generic [ref=e308]: Active
        - generic [ref=e309]:
          - generic [ref=e310]:
            - generic [ref=e311]: "4"
            - generic [ref=e312]: Lead Generation Drive
          - generic [ref=e313]: Pending
  - generic [ref=e315]:
    - generic [ref=e316]:
      - heading "Self-Serve Brand Dashboard" [level=2] [ref=e317]
      - paragraph [ref=e318]: Post projects, review student profiles, communicate in secure workspaces, and unlock contact details only after confirming delivery.
    - generic [ref=e319]:
      - generic [ref=e320]:
        - generic [ref=e321] [cursor=pointer]:
          - heading "1. AI-Powered Brief Builder" [level=3] [ref=e322]
          - paragraph [ref=e323]: Describe your design, video editing, or marketing project in seconds. Our builder formats the requirements and creates application questions automatically.
        - generic [ref=e324] [cursor=pointer]:
          - heading "2. Filtered Applications" [level=3] [ref=e325]
          - paragraph [ref=e326]: Review student portfolios, social profile links, and answers to your application questions. Unlocking contacts is protected until you choose the candidate.
        - generic [ref=e327] [cursor=pointer]:
          - heading "3. Protected Workspace Escrow" [level=3] [ref=e328]
          - paragraph [ref=e329]: Keep your project payments secure. Milestones are released only when students upload files and you approve the delivery quality.
      - generic [ref=e332]:
        - text: "# AI Brief Assistant"
        - text: "\"I need a student video editor to turn 5 raw videos into reels with sleek captions.\""
        - text: ">> Project Category: Video Editing & Reels"
        - text: ">> Recommended Budget: ₹3,500 - ₹5,000"
        - text: ">> Screening Questions Created:"
        - text: 1. Share links to your top 3 edited short videos.
        - text: 2. What software do you use for overlays & captions?
  - generic [ref=e334]:
    - generic [ref=e335]:
      - heading "Frequently Asked Questions" [level=2] [ref=e336]
      - paragraph [ref=e337]: Have questions about how we vet students, handle payments, or structure ambassador campaigns? Find answers here.
    - generic [ref=e338]:
      - generic [ref=e339]:
        - generic [ref=e340] [cursor=pointer]:
          - text: How does the 7-day risk-free pilot work?
          - generic [ref=e341]: +
        - generic [ref=e342]: When you post a project, you describe the requirements and select a student. If the student fails to start or deliver the pilot task within 7 days, you can request a replacement or cancel the contract with 100% of your escrow balance refunded.
      - generic [ref=e343]:
        - generic [ref=e344] [cursor=pointer]:
          - text: How do you verify student skills?
          - generic [ref=e345]: +
        - generic [ref=e346]: Every student registering on NextGenGrowth must upload past project links, work proofs, or active social media links. Our team manually reviews their portfolio before enabling them to apply for premium brand projects.
      - generic [ref=e347]:
        - generic [ref=e348] [cursor=pointer]:
          - text: Can you run campus campaigns in specific cities/colleges?
          - generic [ref=e349]: +
        - generic [ref=e350]: Yes! Because our campus ambassador network is managed manually, we can target specific geographical hubs (like Delhi NCR, Mumbai, Bangalore) or specific colleges (IITs, DU, engineering, design schools) based on your target audience.
      - generic [ref=e351]:
        - generic [ref=e352] [cursor=pointer]:
          - text: How are payouts and incentives managed?
          - generic [ref=e353]: +
        - generic [ref=e354]: Brands deposit the campaign budget into our secure escrow. Once the ambassador tasks or content submissions are approved by you, we handle the payouts, taxes, certificates, and incentives directly with the students.
  - generic [ref=e356]:
    - generic [ref=e357]:
      - heading "Let's Plan Your Campus Takeover" [level=2] [ref=e358]:
        - text: Let's Plan Your
        - text: Campus Takeover
      - paragraph [ref=e359]: Ready to deploy a college marketing campaign or hire a student team? Get in touch directly and let's map out a strategy for your brand.
      - generic [ref=e360]:
        - link "Email Support hello@nextgengrowth.in" [ref=e361] [cursor=pointer]:
          - /url: mailto:hello@nextgengrowth.in
          - img [ref=e363]
          - generic [ref=e365]:
            - heading "Email Support" [level=4] [ref=e366]
            - paragraph [ref=e367]: hello@nextgengrowth.in
        - link "WhatsApp Founder +91 9532792303 (Quick Response)" [ref=e368] [cursor=pointer]:
          - /url: https://wa.me/919532792303?text=Hi!%20I%20want%20to%20know%20more%20about%20deploying%20a%20Campus%20Ambassador%20program%20for%20my%20brand.
          - img [ref=e370]
          - generic [ref=e372]:
            - heading "WhatsApp Founder" [level=4] [ref=e373]
            - paragraph [ref=e374]: +91 9532792303 (Quick Response)
    - generic [ref=e376]:
      - generic [ref=e377]:
        - generic [ref=e378]: Brand / Company Name
        - textbox "Brand / Company Name" [ref=e379]:
          - /placeholder: e.g. NextGen Corp
      - generic [ref=e380]:
        - generic [ref=e381]: Business Email
        - textbox "Business Email" [ref=e382]:
          - /placeholder: e.g. founder@company.com
      - generic [ref=e383]:
        - generic [ref=e384]: Campaign Type
        - combobox "Campaign Type" [ref=e385]:
          - option "Campus Ambassador Squad" [selected]
          - option "UGC & Reels Creators"
          - option "On-Ground Event Marketing"
          - option "Social Media Marketing / Lead Gen"
          - option "Direct Hire (Long-Term Interns)"
      - generic [ref=e386]:
        - generic [ref=e387]: Brief details about your brand & goal
        - textbox "Brief details about your brand & goal" [ref=e388]:
          - /placeholder: Describe your goal (e.g. We want to deploy 10 ambassadors in DU colleges to get app downloads)
      - button "Send Inquiry" [ref=e389] [cursor=pointer]
  - contentinfo [ref=e390]:
    - generic [ref=e391]:
      - generic [ref=e392]:
        - generic [ref=e393]:
          - link "NextGenGrowth Logo NextGenGrowth" [ref=e394] [cursor=pointer]:
            - /url: /
            - img "NextGenGrowth Logo" [ref=e396]
            - generic [ref=e397]: NextGenGrowth
          - paragraph [ref=e398]: India's premier student-powered marketing network and talent dashboard connecting companies with verified builders.
        - generic [ref=e399]:
          - heading "Solutions" [level=4] [ref=e400]
          - list [ref=e401]:
            - listitem [ref=e402]:
              - link "Campus Marketing" [ref=e403] [cursor=pointer]:
                - /url: "#services"
            - listitem [ref=e404]:
              - link "Creative Work" [ref=e405] [cursor=pointer]:
                - /url: "#creative-services"
            - listitem [ref=e406]:
              - link "Ambassador Squads" [ref=e407] [cursor=pointer]:
                - /url: "#ambassador"
            - listitem [ref=e408]:
              - link "Project Posting" [ref=e409] [cursor=pointer]:
                - /url: /login?tab=register&role=brand
        - generic [ref=e410]:
          - heading "Platform" [level=4] [ref=e411]
          - list [ref=e412]:
            - listitem [ref=e413]:
              - link "Client Login" [ref=e414] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e415]:
              - link "Student Signup" [ref=e416] [cursor=pointer]:
                - /url: /login?tab=register
            - listitem [ref=e417]:
              - link "Skill Compass" [ref=e418] [cursor=pointer]:
                - /url: /skill-compass
            - listitem [ref=e419]:
              - link "Support Center" [ref=e420] [cursor=pointer]:
                - /url: /contact
      - generic [ref=e421]:
        - generic [ref=e422]: © 2026 NextGenGrowth. Handcrafted with care in India.
        - generic [ref=e423]:
          - link "Privacy Policy" [ref=e424] [cursor=pointer]:
            - /url: /privacy
          - link "Terms & Conditions" [ref=e425] [cursor=pointer]:
            - /url: /terms
          - link "Refund Policy" [ref=e426] [cursor=pointer]:
            - /url: /refund-policy
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | test.describe('NextGenGrowth For Brands responsiveness & styling', () => {
  4   |   test('should load page and have HTML text-size-adjust set correctly', async ({ page }) => {
  5   |     await page.goto('/for-brands');
  6   |     
  7   |     // Check text-size-adjust properties on html
  8   |     const htmlStyle = await page.evaluate(() => {
  9   |       const htmlEl = document.documentElement;
  10  |       const styles = window.getComputedStyle(htmlEl);
  11  |       return {
  12  |         webkitTextSizeAdjust: styles.webkitTextSizeAdjust,
  13  |         textSizeAdjust: styles.textSizeAdjust || styles.getPropertyValue('text-size-adjust')
  14  |       };
  15  |     });
  16  | 
> 17  |     expect(htmlStyle.webkitTextSizeAdjust).toBe('100%');
      |                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  18  |   });
  19  | 
  20  |   test('should have vendor prefixed backdrop-filter and user-select rules', async ({ page }) => {
  21  |     await page.goto('/for-brands');
  22  |     
  23  |     // Evaluate if backdrop-filter and user-select exist in style sheet rules
  24  |     const styleChecks = await page.evaluate(() => {
  25  |       const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
  26  |       
  27  |       const mockDashboardMatch = styles.match(/\.mock-dashboard\s*\{([^}]+)\}/);
  28  |       const mockCard1Match = styles.match(/\.mock-card-1\s*\{([^}]+)\}/);
  29  |       const mockCard2Match = styles.match(/\.mock-card-2\s*\{([^}]+)\}/);
  30  |       const mobileMenuMatch = styles.match(/\.mobile-menu\s*\{([^}]+)\}/);
  31  |       const faqQuestionMatch = styles.match(/\.faq-question\s*\{([^}]+)\}/);
  32  | 
  33  |       const checkWebkitBackdrop = (blockText) => blockText && blockText.includes('-webkit-backdrop-filter');
  34  |       const checkUserSelectPrefixes = (blockText) => blockText && 
  35  |         blockText.includes('-webkit-user-select') && 
  36  |         blockText.includes('-moz-user-select') && 
  37  |         blockText.includes('-ms-user-select');
  38  | 
  39  |       return {
  40  |         mockDashboardHasWebkit: checkWebkitBackdrop(mockDashboardMatch ? mockDashboardMatch[1] : ''),
  41  |         mockCard1HasWebkit: checkWebkitBackdrop(mockCard1Match ? mockCard1Match[1] : ''),
  42  |         mockCard2HasWebkit: checkWebkitBackdrop(mockCard2Match ? mockCard2Match[1] : ''),
  43  |         mobileMenuHasWebkit: checkWebkitBackdrop(mobileMenuMatch ? mobileMenuMatch[1] : ''),
  44  |         faqQuestionHasWebkitUserSelect: checkUserSelectPrefixes(faqQuestionMatch ? faqQuestionMatch[1] : '')
  45  |       };
  46  |     });
  47  | 
  48  |     expect(styleChecks.mockDashboardHasWebkit).toBe(true);
  49  |     expect(styleChecks.mockCard1HasWebkit).toBe(true);
  50  |     expect(styleChecks.mockCard2HasWebkit).toBe(true);
  51  |     expect(styleChecks.mobileMenuHasWebkit).toBe(true);
  52  |     expect(styleChecks.faqQuestionHasWebkitUserSelect).toBe(true);
  53  |   });
  54  | 
  55  |   test('should handle menu toggle clicks, scroll locking, and ARIA updates', async ({ page }) => {
  56  |     // We set mobile viewport first to make sure toggle is displayed
  57  |     await page.setViewportSize({ width: 375, height: 667 });
  58  |     await page.goto('/for-brands');
  59  | 
  60  |     const navToggle = page.locator('#navToggle');
  61  |     const body = page.locator('body');
  62  |     const mobileMenu = page.locator('#mobileMenu');
  63  | 
  64  |     // Initially: toggle not open, scroll-locked not present, aria attributes
  65  |     await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  66  |     await expect(body).not.toHaveClass(/scroll-locked/);
  67  |     await expect(mobileMenu).not.toHaveClass(/show/);
  68  | 
  69  |     // Click toggle to open menu
  70  |     await navToggle.click();
  71  |     await expect(mobileMenu).toHaveClass(/show/);
  72  |     await expect(body).toHaveClass(/scroll-locked/);
  73  |     await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
  74  |     await expect(navToggle).toHaveAttribute('aria-label', 'Close menu');
  75  | 
  76  |     // Click toggle again to close menu
  77  |     await navToggle.click();
  78  |     await expect(mobileMenu).not.toHaveClass(/show/);
  79  |     await expect(body).not.toHaveClass(/scroll-locked/);
  80  |     await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
  81  |     await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  82  | 
  83  |     // Open again and click a link to close
  84  |     await navToggle.click();
  85  |     await expect(body).toHaveClass(/scroll-locked/);
  86  |     
  87  |     const firstLink = page.locator('.mobile-menu-links a').first();
  88  |     await firstLink.click();
  89  |     await expect(mobileMenu).not.toHaveClass(/show/);
  90  |     await expect(body).not.toHaveClass(/scroll-locked/);
  91  |     await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
  92  |     await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  93  |   });
  94  | 
  95  |   test('should hide Client Login and Post a Project from header on mobile viewports', async ({ page }) => {
  96  |     await page.setViewportSize({ width: 375, height: 667 });
  97  |     await page.goto('/for-brands');
  98  | 
  99  |     // Header buttons
  100 |     const clientLoginBtn = page.locator('header .btn-login');
  101 |     const postProjectBtn = page.locator('header .btn-primary');
  102 | 
  103 |     await expect(clientLoginBtn).not.toBeVisible();
  104 |     await expect(postProjectBtn).not.toBeVisible();
  105 |   });
  106 | 
  107 |   test('should ensure mobile menu toggle and menu links meet touch target guidelines', async ({ page }) => {
  108 |     await page.setViewportSize({ width: 375, height: 667 });
  109 |     await page.goto('/for-brands');
  110 | 
  111 |     // Hamburger toggle dimensions
  112 |     const navToggle = page.locator('#navToggle');
  113 |     const toggleBox = await navToggle.boundingBox();
  114 |     expect(toggleBox.width).toBeGreaterThanOrEqual(44);
  115 |     expect(toggleBox.height).toBeGreaterThanOrEqual(44);
  116 | 
  117 |     // Open mobile menu
```