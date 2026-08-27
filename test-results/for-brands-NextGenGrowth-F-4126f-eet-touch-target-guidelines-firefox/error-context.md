# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: for-brands.spec.js >> NextGenGrowth For Brands responsiveness & styling >> should ensure mobile menu toggle and menu links meet touch target guidelines
- Location: tests-e2e\for-brands.spec.js:107:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.boundingBox: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#navToggle')
    - locator resolved to visible <button id="navToggle" class="nav-toggle" aria-label="Open menu">…</button>

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "NextGenGrowth Logo" [ref=e3] [cursor=pointer]:
      - /url: /
      - img "NextGenGrowth Logo" [ref=e5]
    - button "Open menu" [ref=e7] [cursor=pointer]
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
  - generic [ref=e13]:
    - generic [ref=e14]: Vetted Student Creators & Campus Campaigns
    - heading "Hire Verified College Talent & Scale Your Campus Reach" [level=1] [ref=e16]:
      - text: Hire Verified College Talent
      - text: "& Scale Your Campus Reach"
    - paragraph [ref=e17]: Post creative projects (video editing, graphic design, writing) on our secure marketplace, or deploy managed Campus Ambassador squads. Get high-quality Gen-Z execution, backed by a 7-day risk-free pilot.
    - generic [ref=e18]:
      - link "Post a Project (Free Trial)" [ref=e19] [cursor=pointer]:
        - /url: /login?tab=register&role=brand
      - link "Deploy Campus Network" [ref=e20] [cursor=pointer]:
        - /url: "#contact"
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]: 0+
        - generic [ref=e24]: Colleges Reached
      - generic [ref=e25]:
        - generic [ref=e26]: 0+
        - generic [ref=e27]: Verified Students
      - generic [ref=e28]:
        - generic [ref=e29]: 40%
        - generic [ref=e30]: Cost Savings
  - generic [ref=e47]:
    - generic [ref=e48]:
      - heading "Vetted for Quality. Built for Startups." [level=2] [ref=e49]
      - paragraph [ref=e50]: How we ensure you only work with the top 15% of college talent.
    - generic [ref=e51]:
      - generic [ref=e52]:
        - img [ref=e54]
        - generic [ref=e56]:
          - heading "Rigorous Portfolio Screening" [level=3] [ref=e57]
          - paragraph [ref=e58]: Every student applicant must submit past work proofs. We manually verify and screen their portfolios before they can apply to your campaigns.
      - generic [ref=e59]:
        - img [ref=e61]
        - generic [ref=e63]:
          - heading "Milestone Escrow Protection" [level=3] [ref=e64]
          - paragraph [ref=e65]: Your budget is held safely in escrow. Payouts are released only after you review and approve the final completed creative deliverables.
      - generic [ref=e66]:
        - img [ref=e68]
        - generic [ref=e70]:
          - heading "Full KYC & Verification" [level=3] [ref=e71]
          - paragraph [ref=e72]: We check student credentials and official college IDs. Rest easy knowing that the students working on your projects are legitimate and accountable.
  - generic [ref=e74]:
    - generic [ref=e75]:
      - heading "Hire for Creative Projects" [level=2] [ref=e76]
      - paragraph [ref=e77]: Directly hire skilled student talent on our marketplace for a fraction of the agency cost.
    - generic [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]: 🎬
        - generic [ref=e81]:
          - heading "Video Editing & Reels" [level=3] [ref=e82]
          - paragraph [ref=e83]: Gen-Z editors who know CapCut, Premiere Pro, and typography. Turn raw clips into high-retention reels, TikToks, and YouTube thumbnails.
          - generic [ref=e84]:
            - generic [ref=e85]: Shorts & Reels
            - generic [ref=e86]: CapCut Subtitles
            - generic [ref=e87]: Color Grading
      - generic [ref=e88]:
        - generic [ref=e89]: 🎨
        - generic [ref=e90]:
          - heading "Graphic Design & UI/UX" [level=3] [ref=e91]
          - paragraph [ref=e92]: Figma-fluent student designers creating modern social media banners, pitch decks, landing pages, and vector brand illustrations.
          - generic [ref=e93]:
            - generic [ref=e94]: Figma UI
            - generic [ref=e95]: Social Creatives
            - generic [ref=e96]: Pitch Decks
      - generic [ref=e97]:
        - generic [ref=e98]: 💻
        - generic [ref=e99]:
          - heading "Web & App Development" [level=3] [ref=e100]
          - paragraph [ref=e101]: Student developers creating lightning-fast landing pages, Next.js React templates, Shopify stores, and fixing frontend bugs.
          - generic [ref=e102]:
            - generic [ref=e103]: React / Next.js
            - generic [ref=e104]: Tailwind CSS
            - generic [ref=e105]: Shopify Setup
      - generic [ref=e106]:
        - generic [ref=e107]: ✍️
        - generic [ref=e108]:
          - heading "Content & Script Writing" [level=3] [ref=e109]
          - paragraph [ref=e110]: Copywriters who understand Gen-Z hooks. Get high-ranking SEO blogs, email newsletters, reel scripts, and ad copywriting.
          - generic [ref=e111]:
            - generic [ref=e112]: SEO Blogs
            - generic [ref=e113]: Reel Scripts
            - generic [ref=e114]: Ad Copy
    - link "Hire Creative Students Now" [ref=e116] [cursor=pointer]:
      - /url: /login?tab=register&role=brand
  - generic [ref=e118]:
    - generic [ref=e119]:
      - heading "Success Stories & Case Studies" [level=2] [ref=e120]
      - paragraph [ref=e121]: How top brands leverage our combined marketplace talent and campus ambassador network.
    - generic [ref=e122]:
      - generic [ref=e123]:
        - generic [ref=e124]: ChakDeBharat
        - heading "Organized On-Ground Campaigns & Creative Support" [level=3] [ref=e125]
        - paragraph [ref=e126]: Humne Delhi NCR ke 15+ major college campuses mein ChakDeBharat ke liye targeted events organize kiye. NextGenGrowth ke campus ambassadors ne physical registration booths lagaye aur coordinate kiya, jabki hamare creative student developers aur designers ne high-converting promotional banners aur reels assets design kiye.
        - generic [ref=e127]:
          - generic [ref=e128]:
            - generic [ref=e129]: 15+
            - generic [ref=e130]: Campuses Covered
          - generic [ref=e131]:
            - generic [ref=e132]: 20,000+
            - generic [ref=e133]: Student Impressions
      - generic [ref=e134]:
        - generic [ref=e135]: IndiaSportHub
        - heading "Tournament Hype & On-Campus Signups" [level=3] [ref=e136]
        - paragraph [ref=e137]: IndiaSportHub ke regional tournaments ke liye humne 30+ official campus ambassadors deploy kiye. Ambassadors ne offline sports matches promote kiye aur college clubs ke sath collaborations set kiye. Usi dauran, NextGenGrowth marketplace se hired editors ne event coverage videos aur reels generate kiye, jisse user base dramatically grow hua.
        - generic [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e140]: 30+
            - generic [ref=e141]: Ambassadors Deployed
          - generic [ref=e142]:
            - generic [ref=e143]: 5,000+
            - generic [ref=e144]: App Signups
  - generic [ref=e146]:
    - generic [ref=e147]:
      - heading "The Student-Powered Growth Engine" [level=2] [ref=e148]
      - paragraph [ref=e149]: 5 key pillars designed to drive authentic college reach, high-converting content, and digital execution.
    - generic [ref=e150]:
      - generic [ref=e151]:
        - img [ref=e153]
        - heading "Campus Ambassadors" [level=3] [ref=e155]
        - paragraph [ref=e156]: Verified campus representatives promoting your brand on-ground through community events, posters, and campus group outreach.
        - list [ref=e157]:
          - listitem [ref=e158]:
            - img [ref=e159]
            - text: On-ground college presence
          - listitem [ref=e161]:
            - img [ref=e162]
            - text: Event organization & promos
          - listitem [ref=e164]:
            - img [ref=e165]
            - text: Lead generation drives
      - generic [ref=e167]:
        - img [ref=e169]
        - heading "Content Creators (UGC)" [level=3] [ref=e171]
        - paragraph [ref=e172]: Ambitious college creators building high-converting reels, TikToks, UGC videos, and graphic assets curated specifically for your brand.
        - list [ref=e173]:
          - listitem [ref=e174]:
            - img [ref=e175]
            - text: Slick social video content
          - listitem [ref=e177]:
            - img [ref=e178]
            - text: Premium editing & design
          - listitem [ref=e180]:
            - img [ref=e181]
            - text: High engagement metrics
      - generic [ref=e183]:
        - img [ref=e185]
        - heading "Marketing & Campaigns" [level=3] [ref=e188]
        - paragraph [ref=e189]: Dynamic micro-campaigns designed to spark brand recognition. Launch influencer seeding, community challenges, and campus sign-up marathons.
        - list [ref=e190]:
          - listitem [ref=e191]:
            - img [ref=e192]
            - text: Influencer product seeding
          - listitem [ref=e194]:
            - img [ref=e195]
            - text: App download campaigns
          - listitem [ref=e197]:
            - img [ref=e198]
            - text: Social buzz trigger drives
      - generic [ref=e200]:
        - img [ref=e202]
        - heading "Sales & Outreach Force" [level=3] [ref=e204]
        - paragraph [ref=e205]: A specialized student sales team executing lead generation, campus trials, partnership setups, and referral campaigns.
        - list [ref=e206]:
          - listitem [ref=e207]:
            - img [ref=e208]
            - text: Campus referral sales
          - listitem [ref=e210]:
            - img [ref=e211]
            - text: Direct sales drives
          - listitem [ref=e213]:
            - img [ref=e214]
            - text: Product testing feedback
      - generic [ref=e216]:
        - img [ref=e218]
        - heading "Community Building" [level=3] [ref=e220]
        - paragraph [ref=e221]: Establish and grow a dedicated club or Discord server for your brand. Create organic brand ambassadors who promote your products for the long haul.
        - list [ref=e222]:
          - listitem [ref=e223]:
            - img [ref=e224]
            - text: Brand-themed student clubs
          - listitem [ref=e226]:
            - img [ref=e227]
            - text: Online college communities
          - listitem [ref=e229]:
            - img [ref=e230]
            - text: Peer-to-peer discussions
      - generic [ref=e232]:
        - img [ref=e234]
        - heading "Start With A Free Pilot" [level=3] [ref=e236]
        - paragraph [ref=e237]: No commitment needed. Request a simple project or small pilot task first, see student applications within 24 hours, and pay only if you confirm.
        - link "Post a Project (Free)" [ref=e238] [cursor=pointer]:
          - /url: /login?tab=register&role=brand
  - generic [ref=e241]:
    - generic [ref=e242]:
      - generic [ref=e243]: Fully Managed Program
      - heading "Official Campus Ambassador Campaigns" [level=2] [ref=e245]
      - paragraph [ref=e246]: This isn't a spammy referral program. We build a structured, vetted ambassador squad that represents your brand officially on-ground, coordinates events, distributes merchandise, and gains authentic signups.
      - generic [ref=e247]:
        - generic [ref=e248]:
          - img [ref=e250]
          - generic [ref=e252]:
            - heading "Strict Selection (Top 2%)" [level=4] [ref=e253]
            - paragraph [ref=e254]: We filter out inactive students and recruit only highly active, connected student leaders, college union heads, and community organizers.
        - generic [ref=e255]:
          - img [ref=e257]
          - generic [ref=e259]:
            - heading "Manual Setup, Full Support" [level=4] [ref=e260]
            - paragraph [ref=e261]: We work closely with you to define KPIs, write clear campaign briefs, design incentives, and handle student queries directly.
        - generic [ref=e262]:
          - img [ref=e264]
          - generic [ref=e266]:
            - heading "Performance Rewards" [level=4] [ref=e267]
            - paragraph [ref=e268]: Ambassadors stay motivated with structured certificates, performance bonuses, premium merchandise, and letter of recommendations.
      - link "Discuss Ambassador Program" [ref=e270] [cursor=pointer]:
        - /url: https://wa.me/919532792303?text=Hi!%20I%20want%20to%20know%20more%20about%20deploying%20a%20Campus%20Ambassador%20program%20for%20my%20brand.
        - img [ref=e271]
        - text: Discuss Ambassador Program
    - generic [ref=e274]:
      - generic [ref=e275]:
        - heading "Campaign Pipeline" [level=3] [ref=e276]
        - text: Active (Delhi NCR)
      - generic [ref=e277]:
        - generic [ref=e278]:
          - generic [ref=e279]:
            - generic [ref=e280]: "1"
            - generic [ref=e281]: Recruitment & Vetting
          - generic [ref=e282]: Done
        - generic [ref=e283]:
          - generic [ref=e284]:
            - generic [ref=e285]: "2"
            - generic [ref=e286]: Briefing & Collateral
          - generic [ref=e287]: Done
        - generic [ref=e288]:
          - generic [ref=e289]:
            - generic [ref=e290]: "3"
            - generic [ref=e291]: Campus Merch Distribution
          - generic [ref=e292]: Active
        - generic [ref=e293]:
          - generic [ref=e294]:
            - generic [ref=e295]: "4"
            - generic [ref=e296]: Lead Generation Drive
          - generic [ref=e297]: Pending
  - generic [ref=e299]:
    - generic [ref=e300]:
      - heading "Self-Serve Brand Dashboard" [level=2] [ref=e301]
      - paragraph [ref=e302]: Post projects, review student profiles, communicate in secure workspaces, and unlock contact details only after confirming delivery.
    - generic [ref=e303]:
      - generic [ref=e304]:
        - generic [ref=e305] [cursor=pointer]:
          - heading "1. AI-Powered Brief Builder" [level=3] [ref=e306]
          - paragraph [ref=e307]: Describe your design, video editing, or marketing project in seconds. Our builder formats the requirements and creates application questions automatically.
        - generic [ref=e308] [cursor=pointer]:
          - heading "2. Filtered Applications" [level=3] [ref=e309]
          - paragraph [ref=e310]: Review student portfolios, social profile links, and answers to your application questions. Unlocking contacts is protected until you choose the candidate.
        - generic [ref=e311] [cursor=pointer]:
          - heading "3. Protected Workspace Escrow" [level=3] [ref=e312]
          - paragraph [ref=e313]: Keep your project payments secure. Milestones are released only when students upload files and you approve the delivery quality.
      - generic [ref=e316]:
        - text: "# AI Brief Assistant"
        - text: "\"I need a student video editor to turn 5 raw videos into reels with sleek captions.\""
        - text: ">> Project Category: Video Editing & Reels"
        - text: ">> Recommended Budget: ₹3,500 - ₹5,000"
        - text: ">> Screening Questions Created:"
        - text: 1. Share links to your top 3 edited short videos.
        - text: 2. What software do you use for overlays & captions?
  - generic [ref=e318]:
    - generic [ref=e319]:
      - heading "Frequently Asked Questions" [level=2] [ref=e320]
      - paragraph [ref=e321]: Have questions about how we vet students, handle payments, or structure ambassador campaigns? Find answers here.
    - generic [ref=e322]:
      - generic [ref=e323]:
        - generic [ref=e324] [cursor=pointer]:
          - text: How does the 7-day risk-free pilot work?
          - generic [ref=e325]: +
        - generic [ref=e326]: When you post a project, you describe the requirements and select a student. If the student fails to start or deliver the pilot task within 7 days, you can request a replacement or cancel the contract with 100% of your escrow balance refunded.
      - generic [ref=e327]:
        - generic [ref=e328] [cursor=pointer]:
          - text: How do you verify student skills?
          - generic [ref=e329]: +
        - generic [ref=e330]: Every student registering on NextGenGrowth must upload past project links, work proofs, or active social media links. Our team manually reviews their portfolio before enabling them to apply for premium brand projects.
      - generic [ref=e331]:
        - generic [ref=e332] [cursor=pointer]:
          - text: Can you run campus campaigns in specific cities/colleges?
          - generic [ref=e333]: +
        - generic [ref=e334]: Yes! Because our campus ambassador network is managed manually, we can target specific geographical hubs (like Delhi NCR, Mumbai, Bangalore) or specific colleges (IITs, DU, engineering, design schools) based on your target audience.
      - generic [ref=e335]:
        - generic [ref=e336] [cursor=pointer]:
          - text: How are payouts and incentives managed?
          - generic [ref=e337]: +
        - generic [ref=e338]: Brands deposit the campaign budget into our secure escrow. Once the ambassador tasks or content submissions are approved by you, we handle the payouts, taxes, certificates, and incentives directly with the students.
  - generic [ref=e340]:
    - generic [ref=e341]:
      - heading "Let's Plan Your Campus Takeover" [level=2] [ref=e342]:
        - text: Let's Plan Your
        - text: Campus Takeover
      - paragraph [ref=e343]: Ready to deploy a college marketing campaign or hire a student team? Get in touch directly and let's map out a strategy for your brand.
      - generic [ref=e344]:
        - link "Email Support hello@nextgengrowth.in" [ref=e345] [cursor=pointer]:
          - /url: mailto:hello@nextgengrowth.in
          - img [ref=e347]
          - generic [ref=e349]:
            - heading "Email Support" [level=4] [ref=e350]
            - paragraph [ref=e351]: hello@nextgengrowth.in
        - link "WhatsApp Founder +91 9532792303 (Quick Response)" [ref=e352] [cursor=pointer]:
          - /url: https://wa.me/919532792303?text=Hi!%20I%20want%20to%20know%20more%20about%20deploying%20a%20Campus%20Ambassador%20program%20for%20my%20brand.
          - img [ref=e354]
          - generic [ref=e356]:
            - heading "WhatsApp Founder" [level=4] [ref=e357]
            - paragraph [ref=e358]: +91 9532792303 (Quick Response)
    - generic [ref=e360]:
      - generic [ref=e361]:
        - generic [ref=e362]: Brand / Company Name
        - textbox "Brand / Company Name" [ref=e363]:
          - /placeholder: e.g. NextGen Corp
      - generic [ref=e364]:
        - generic [ref=e365]: Business Email
        - textbox "Business Email" [ref=e366]:
          - /placeholder: e.g. founder@company.com
      - generic [ref=e367]:
        - generic [ref=e368]: Campaign Type
        - combobox "Campaign Type" [ref=e369]:
          - option "Campus Ambassador Squad" [selected]
          - option "UGC & Reels Creators"
          - option "On-Ground Event Marketing"
          - option "Social Media Marketing / Lead Gen"
          - option "Direct Hire (Long-Term Interns)"
      - generic [ref=e370]:
        - generic [ref=e371]: Brief details about your brand & goal
        - textbox "Brief details about your brand & goal" [ref=e372]:
          - /placeholder: Describe your goal (e.g. We want to deploy 10 ambassadors in DU colleges to get app downloads)
      - button "Send Inquiry" [ref=e373] [cursor=pointer]
  - contentinfo [ref=e374]:
    - generic [ref=e375]:
      - generic [ref=e376]:
        - generic [ref=e377]:
          - link "NextGenGrowth Logo" [ref=e378] [cursor=pointer]:
            - /url: /
            - img "NextGenGrowth Logo" [ref=e380]
          - paragraph [ref=e381]: India's premier student-powered marketing network and talent dashboard connecting companies with verified builders.
        - generic [ref=e382]:
          - heading "Solutions" [level=4] [ref=e383]
          - list [ref=e384]:
            - listitem [ref=e385]:
              - link "Campus Marketing" [ref=e386] [cursor=pointer]:
                - /url: "#services"
            - listitem [ref=e387]:
              - link "Creative Work" [ref=e388] [cursor=pointer]:
                - /url: "#creative-services"
            - listitem [ref=e389]:
              - link "Ambassador Squads" [ref=e390] [cursor=pointer]:
                - /url: "#ambassador"
            - listitem [ref=e391]:
              - link "Project Posting" [ref=e392] [cursor=pointer]:
                - /url: /login?tab=register&role=brand
        - generic [ref=e393]:
          - heading "Platform" [level=4] [ref=e394]
          - list [ref=e395]:
            - listitem [ref=e396]:
              - link "Client Login" [ref=e397] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e398]:
              - link "Student Signup" [ref=e399] [cursor=pointer]:
                - /url: /login?tab=register
            - listitem [ref=e400]:
              - link "Skill Compass" [ref=e401] [cursor=pointer]:
                - /url: /skill-compass
            - listitem [ref=e402]:
              - link "Support Center" [ref=e403] [cursor=pointer]:
                - /url: /contact
      - generic [ref=e404]:
        - generic [ref=e405]: © 2026 NextGenGrowth. Handcrafted with care in India.
        - generic [ref=e406]:
          - link "Privacy Policy" [ref=e407] [cursor=pointer]:
            - /url: /privacy
          - link "Terms & Conditions" [ref=e408] [cursor=pointer]:
            - /url: /terms
          - link "Refund Policy" [ref=e409] [cursor=pointer]:
            - /url: /refund-policy
```

# Test source

```ts
  13  |         textSizeAdjust: styles.textSizeAdjust || styles.getPropertyValue('text-size-adjust')
  14  |       };
  15  |     });
  16  | 
  17  |     expect(htmlStyle.webkitTextSizeAdjust).toBe('100%');
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
> 113 |     const toggleBox = await navToggle.boundingBox();
      |                                       ^ Error: locator.boundingBox: Test timeout of 30000ms exceeded.
  114 |     expect(toggleBox.width).toBeGreaterThanOrEqual(44);
  115 |     expect(toggleBox.height).toBeGreaterThanOrEqual(44);
  116 | 
  117 |     // Open mobile menu
  118 |     await navToggle.click();
  119 | 
  120 |     // Check touch target of mobile menu links
  121 |     const links = page.locator('.mobile-menu-links a:not(.btn)');
  122 |     const count = await links.count();
  123 |     for (let i = 0; i < count; i++) {
  124 |       const box = await links.nth(i).boundingBox();
  125 |       expect(box.height).toBeGreaterThanOrEqual(44);
  126 |     }
  127 | 
  128 |     // Check touch target of mobile menu buttons
  129 |     const btns = page.locator('.mobile-menu-links .btn');
  130 |     const btnCount = await btns.count();
  131 |     for (let i = 0; i < btnCount; i++) {
  132 |       const box = await btns.nth(i).boundingBox();
  133 |       expect(box.height).toBeGreaterThanOrEqual(44);
  134 |     }
  135 |   });
  136 | 
  137 |   test('should apply responsive rules and prevent overflow in landscape mode', async ({ page }) => {
  138 |     // Set landscape view (e.g. height 320, width 640)
  139 |     await page.setViewportSize({ width: 640, height: 320 });
  140 |     await page.goto('/for-brands');
  141 | 
  142 |     // Open mobile menu
  143 |     await page.locator('#navToggle').click();
  144 | 
  145 |     // Verify mobile menu scrollability features
  146 |     const mobileMenuStyles = await page.evaluate(() => {
  147 |       const el = document.getElementById('mobileMenu');
  148 |       const styles = window.getComputedStyle(el);
  149 |       return {
  150 |         overflowY: styles.overflowY,
  151 |         webkitOverflowScrolling: styles.webkitOverflowScrolling || styles.getPropertyValue('-webkit-overflow-scrolling')
  152 |       };
  153 |     });
  154 | 
  155 |     expect(mobileMenuStyles.overflowY).toBe('auto');
  156 |   });
  157 | });
  158 | 
```