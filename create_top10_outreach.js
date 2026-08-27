const fs = require('fs');
const path = require('path');

const top10Outreach = [
  {
    rank: 1,
    company: "WickedGud",
    category: "Healthy FMCG (Noodles & Pasta)",
    fitScore: "96/100",
    decisionMaker: "Bhuman Dani",
    title: "Founder & CEO",
    email: "bhuman@wickedgud.com",
    campaignBlueprint: "The Midnight Munchies Upgrade",
    subject: "Campus sampling idea for WickedGud",
    emailBody: `Hi Bhuman,

Loved seeing WickedGud's recent ₹20 Cr funding push to scale offline retail and un-junk India's snacking habits. I'm reaching out because college hostels represent the single highest-frequency instant noodle consumption pocket in India.

The opportunity we see for WickedGud is capturing high-frequency late-night college snacking demand through student-led hostel sampling and canteen takeovers that build lifetime brand loyalty before graduation.

NextGenGrowth is a student-powered marketing ecosystem. We manage active student networks across 100+ premier Indian engineering, MBA, and undergraduate colleges.

Here is what we can execute for WickedGud:
• Creator Campaigns: Unscripted blind taste test reels comparing WickedGud with legacy maida noodles under #UnjunkHostelNights.
• Campus Activations: 'Late Night Noodle Bars' and canteen takeovers during exam prep weeks and college hackathons.
• Product Sampling: On-ground cooked sampling kits distributed directly to hostel rooms.
• Student Communities: Active hostel wing leaders driving word-of-mouth and localized Zepto/Blinkit promo codes.

By placing WickedGud directly inside student residential wings during peak hunger hours, we drive immediate dark-store volume, lower customer acquisition costs, and convert traditional noodle eaters into loyal WickedGud consumers.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for WickedGud.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 2,
    company: "abCoffee",
    category: "QSR Specialty Coffee Kiosks",
    fitScore: "95/100",
    decisionMaker: "Abhijeet Anand",
    title: "Founder & CEO",
    email: "abhijeet@abcoffee.in",
    campaignBlueprint: "The 8:45 AM Brew Pass",
    subject: "Campus growth idea for abCoffee",
    emailBody: `Hi Abhijeet,

Loved seeing abCoffee cross 90+ outlets and secure ₹61 Cr to make grab-and-go specialty coffee an everyday habit across India. I'm reaching out because university clusters represent an enormous, untapped daily footfall engine for your kiosks.

The opportunity we see for abCoffee is establishing grab-and-go coffee as an affordable daily student ritual right before 9 AM lectures by activating campus micro-influencers around university kiosk hubs.

NextGenGrowth is a student-powered marketing ecosystem. We connect consumer brands with verified student networks across 100+ top Indian universities and college clusters.

Here is what we can execute for abCoffee:
• Creator Campaigns: Trending 'Lecture Survival Brew' reels by popular campus micro-creators.
• Campus Activations: Morning 'Brew Pass' entry gate pop-ups and sports fest cheer stations.
• Product Sampling: Digital & physical scratch-card trial passes distributed at high-density campus exits.
• Student Communities: College ambassador squads driving app downloads and group morning coffee orders.

This targeted campus push creates a recurring morning habit for students, driving sustained store-level walk-ins, high app retention, and maximum daily kiosk throughput.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for abCoffee.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 3,
    company: "Bummer",
    category: "D2C Gen-Z Underwear & Loungewear",
    fitScore: "94/100",
    decisionMaker: "Sulay Lavsi",
    title: "Founder & CEO",
    email: "sulay@bummer.in",
    campaignBlueprint: "The Ultimate Hostel Lounge-Off",
    subject: "Gen-Z campus acquisition idea for Bummer",
    emailBody: `Hi Sulay,

Loved seeing Bummer scale past the ₹15 Cr monthly revenue mark while keeping your bold, colorful brand voice front and center. I'm reaching out because residential college hostels represent the highest concentration of daily loungewear consumption in India.

The opportunity we see for Bummer is turning your funky loungewear into a campus hostel flex through student-led dorm style challenges, lounge battles, and unboxing creator waves.

NextGenGrowth is a student-powered marketing ecosystem. We build and manage creator networks across 100+ premier residential campuses in India.

Here is what we can execute for Bummer:
• Creator Campaigns: Viral transition reels ('8 AM Formal Lecture vs 11 PM Hostel Vibe') featuring Bummer prints.
• Campus Activations: 'Hostel Lounge-Off' pajama study nights and dorm-room runway events.
• Product Sampling: Gifting custom Bummer 'Dorm Kits' to influential floor leaders and campus style heads.
• Student Communities: Hostel wing ambassador networks distributing tracked student discount codes.

By leveraging peer influence where students spend 70%+ of their time, we generate organic social proof, lower CAC on Meta ads, and drive high-volume website checkouts.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Bummer.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 4,
    company: "Perfora",
    category: "Clean Oral Care & Smart Grooming",
    fitScore: "93/100",
    decisionMaker: "Jatan Bawa",
    title: "Co-Founder",
    email: "jatan@perfora.co",
    campaignBlueprint: "The Clean Smile Move-In Kit",
    targetMetric: "4,000 direct kit trials & 120+ student creator reels across Delhi NCR and Bengaluru",
    subject: "Campus acquisition idea for Perfora",
    emailBody: `Hi Jatan,

Loved seeing Perfora hit ₹42 Cr ARR with 180% growth while keeping ingredient transparency at the core of your brand. I'm reaching out because college move-in season represents a critical, high-intent habit formation window for young adults.

The opportunity we see for Perfora is positioning clean oral care as an essential college self-care upgrade by embedding smart oral kits directly into fresher move-in weeks and dorm routines.

NextGenGrowth is a student-powered marketing ecosystem. We connect wellness and D2C brands with verified student communities across 100+ universities in India.

Here is what we can execute for Perfora:
• Creator Campaigns: Unfiltered dorm Get-Ready-With-Me (GRWM) reels showcasing smart electric brushes and whitening pens.
• Campus Activations: 'Smile Check' interactive kiosks during college fests and fresher orientation fairs.
• Product Sampling: Mini SLS-free mouthwashes and trial kits placed inside fresher orientation welcome bags.
• Student Communities: Student wellness ambassadors driving peer education on SLS-free oral hygiene.

Converting college students right as they build independent grooming routines secures long-term customer LTV that stays with Perfora well past graduation.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Perfora.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 5,
    company: "Freakins",
    category: "Gen-Z Fast-Fashion Denim & Streetwear",
    fitScore: "92/100",
    decisionMaker: "Shaan Shah",
    title: "Co-Founder & COO",
    email: "shaan@freakins.com",
    campaignBlueprint: "Freakins Campus Runway",
    subject: "Gen-Z campus acquisition idea for Freakins",
    emailBody: `Hi Shaan,

Loved seeing Freakins scale past 1,500+ styles with backing from Matrix and Blume, especially how fast your team translates trends into accessible denim. I'm reaching out because college corridors are the ultimate daily physical runway for Gen-Z fashion.

The opportunity we see for Freakins is establishing exclusive campus fashion chapters that turn college campuses into daily lookbook showcases through student style ambassadors.

NextGenGrowth is a student-powered marketing ecosystem. We manage hyper-engaged student creator and fashion networks across 100+ colleges nationwide.

Here is what we can execute for Freakins:
• Creator Campaigns: Weekly 'Outfit Of The Day' (OOTD) transition reels shot across college libraries, cafes, and fests.
• Campus Activations: 'Fit Check' pop-up photo booths and college fashion show styling sponsorships.
• Product Sampling: Seeding new denim drops directly to university fashion society leads and campus micro-creators.
• Student Communities: Campus fashion chapters distributing exclusive student promo codes to peer groups.

This approach creates authentic daily visibility on campus, drives viral student-generated content, and converts peer inspiration into direct e-commerce sales.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Freakins.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 6,
    company: "Snitch",
    category: "Menswear Retail & Youth Fast-Fashion",
    fitScore: "91/100",
    decisionMaker: "Aninditta Datta",
    title: "Head of Growth",
    email: "aninditta@snitch.co.in",
    campaignBlueprint: "The Snitch Campus Style League",
    subject: "A Gen-Z acquisition idea for Snitch",
    emailBody: `Hi Aninditta,

Loved seeing Snitch's aggressive 17+ store North India rollout and your call for bold multi-channel growth initiatives. I'm reaching out because capturing the college demographic within a 7km radius of your stores is the key to sustained weekend retail footfall.

The opportunity we see for Snitch is mobilizing campus styling squads to drive immediate footfall and store billing at your newly opened North Indian retail locations.

NextGenGrowth is a student-powered marketing ecosystem. We maintain active campus ambassador networks across 100+ colleges, with strong density across Delhi NCR and North India.

Here is what we can execute for Snitch:
• Creator Campaigns: '3 College Fits in 3 Minutes' store try-on reels tagged with local store locations.
• Campus Activations: 'Student VIP Nights' and exclusive weekend shopping hours at nearby Snitch stores.
• Product Sampling: Physical 'Student VIP Passes' with exclusive in-store shopping perks distributed on campus.
• Student Communities: On-ground campus ambassador squads organizing group weekend store visits.

This localized campus drive fills new retail stores during peak weekend hours, builds brand affinity among young men, and delivers measurable retail revenue.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Snitch.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 7,
    company: "Foxtale",
    category: "D2C Skincare & Bodycare",
    fitScore: "90/100",
    decisionMaker: "Romita Mazumdar",
    title: "Founder & CEO",
    email: "romita@foxtale.in",
    campaignBlueprint: "The Campus Glow Station",
    subject: "A Gen-Z acquisition idea for Foxtale",
    emailBody: `Hi Romita,

Loved seeing Foxtale secure $30M from KOSÉ Corporation and your focus on high-efficacy formulations solving real Indian skin concerns. I'm reaching out because college students facing daily sun exposure and hostel breakouts represent your highest-LTV early discovery audience.

The opportunity we see for Foxtale is building dominant sunscreen and acne-patch market share among college girls through campus sun-safety kiosks and authentic dormitory routine seeding.

NextGenGrowth is a student-powered marketing ecosystem. We connect leading beauty and wellness brands with student creator networks across 100+ universities.

Here is what we can execute for Foxtale:
• Creator Campaigns: Unfiltered dorm skincare reviews and UV-camera sunscreen protection reels under #CampusGlow.
• Campus Activations: 'Campus Glow Stations' featuring live UV-mirror sunscreen testing booths at college fests.
• Product Sampling: Sachet and mini-tube sunscreen trials distributed directly inside girls' hostels and fest zones.
• Student Communities: Campus beauty ambassadors leading peer discussions on skin barrier health and daily sun protection.

Experiential UV testing combined with trusted dorm room recommendations drives immediate product trial, unprompted social sharing, and repeat quick-commerce orders.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Foxtale.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 8,
    company: "Jar",
    category: "Fintech / Digital Micro-Savings",
    fitScore: "88/100",
    decisionMaker: "Nishchay AG",
    title: "Co-Founder & CEO",
    email: "nishchay@myjar.app",
    campaignBlueprint: "The 30-Day College Gold Streak",
    subject: "Gen-Z acquisition idea for Jar",
    emailBody: `Hi Nishchay,

Loved seeing Jar reach profitability and expand daily savings technology across millions of Indian households. I'm reaching out because college students represent the most valuable cohort to capture right before they enter the corporate workforce.

The opportunity we see for Jar is acquiring first-time Gen-Z savers before graduation by partnering with university finance societies and launching college savings streak challenges.

NextGenGrowth is a student-powered marketing ecosystem. We maintain deep relationships with student clubs, finance societies, and campus leaders across 100+ top colleges in India.

Here is what we can execute for Jar:
• Creator Campaigns: Relatable 'How I Saved ₹1,500 for My Weekend Trip Using Spare Change' breakdown reels.
• Campus Activations: 10-minute 'Sip & Save' workshops and inter-college savings leaderboard challenges.
• Product Sampling: Starter digital gold credits (₹50) distributed to workshop participants for instant KYC onboarding.
• Student Communities: Finance club leaders moderating WhatsApp accountability circles and daily savings streaks.

Capturing student savings habits during college establishes long-term customer loyalty that rolls directly into their first salary accounts, drastically reducing lifetime CAC.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Jar.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 9,
    company: "Beyond Snack",
    category: "Gourmet Banana Chips & Clean Snacks",
    fitScore: "87/100",
    decisionMaker: "Manas Madhu",
    title: "Co-Founder & CEO",
    email: "manas@beyondsnack.in",
    campaignBlueprint: "The Clean Crunch Challenge",
    subject: "Campus snacking idea for Beyond Snack",
    emailBody: `Hi Manas,

Loved seeing Beyond Snack raise $8.3M Series A to challenge traditional potato chips with clean, gourmet banana chips. I'm reaching out because college tuck-shops and library study sessions represent your fastest path to high-volume snack trials.

The opportunity we see for Beyond Snack is replacing greasy potato chips in student diets by establishing campus canteen crunch zones and dorm study-pack sampling.

NextGenGrowth is a student-powered marketing ecosystem. We execute on-ground sampling and student activations across 100+ Indian university campuses.

Here is what we can execute for Beyond Snack:
• Creator Campaigns: ASMR crunch reels and unscripted 'Laptop Keyboard Oil Test' student reaction videos.
• Campus Activations: 'Clean Crunch Stations' set up in campus library lobbies, gaming lounges, and fest food courts.
• Product Sampling: Sample pouches distributed directly in canteen tuck-shops and hostel study rooms.
• Student Communities: Student snack ambassadors sharing quick-commerce discount links in college WhatsApp groups.

Taste trial is the #1 driver of repeat purchases for Beyond Snack; getting students to taste your Peri Peri banana chips creates immediate Blinkit/Zepto reorders around college hubs.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for Beyond Snack.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  },
  {
    rank: 10,
    company: "GOBOULT",
    category: "Consumer Tech / TWS Earbuds & Headphones",
    fitScore: "86/100",
    decisionMaker: "Shivi Srivastava",
    title: "Marketing Head",
    email: "shivi@boultaudio.com",
    campaignBlueprint: "The Boult Campus Sound Lab",
    subject: "Campus growth idea for GOBOULT",
    emailBody: `Hi Shivi,

Loved seeing GOBOULT cross ₹762 Cr ARR and expand into a full lifestyle audio portfolio with the Mustang collection. I'm reaching out because college campuses represent the highest-density daily listening hub for over-ear headphones and gaming gear.

The opportunity we see for GOBOULT is establishing absolute campus audio dominance in the ANC and gaming segment through inter-college esports lounges and campus sound ambassadors.

NextGenGrowth is a student-powered marketing ecosystem. We deploy experiential tech pop-ups and student ambassador networks across 100+ universities in India.

Here is what we can execute for GOBOULT:
• Creator Campaigns: 'Noise Cancellation Test in the Loudest College Cafeteria' short-form reels.
• Campus Activations: 'Boult Sound Labs' and interactive audio experience booths at college fests and esports tournaments.
• Product Sampling: Hands-on trial stations enabling students to test low-latency gaming modes and ANC live on campus.
• Student Communities: Campus audio reps and gaming society leads distributing student-exclusive promo codes.

Giving students a hands-on trial inside noisy campus environments drives immediate trial-to-purchase conversion and positions Boult as the go-to youth audio brand.

Would you be open to a brief 15-minute call this week? I'd love to walk you through our pilot structure for GOBOULT.

Best regards,

Swatantra Shukla
Founder, NextGenGrowth | nextgengrowth.in
Email: nextgengrowthwork@gmail.com
Phone: +91 9532792303`,
  }
];

const outputPath = path.join(__dirname, 'top_10_campus_outreach.json');
fs.writeFileSync(outputPath, JSON.stringify(top10Outreach, null, 2), 'utf8');
console.log(`✅ Updated top_10_campus_outreach.json adhering to 6-part outreach framework!`);
