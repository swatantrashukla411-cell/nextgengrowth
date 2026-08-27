const fs = require('fs');
const path = require('path');

// Database of 100 real, active B2B SaaS startups globally (early-stage to Series B/C/D)
const saasStartups = [
  // ==========================================
  // DEVELOPER TOOLS (1-15)
  // ==========================================
  {
    name: "Clerk",
    category: "Developer tools",
    website: "https://clerk.com",
    targetUsers: "Developers, SaaS founders, and Engineering teams",
    linkedin: "https://www.linkedin.com/company/clerk-inc",
    hiring: "Yes",
    funding: "Series B",
    description: "Provides complete user management, authentication, and pre-built login components for web applications.",
    domain: "user authentication and identity management APIs",
    introDetail: "Your pre-built login components and React hooks that make user authentication completely painless to integrate are fantastic.",
    painPoints: [
      "Testing SDK library rendering and sessions across various framework versions.",
      "Auditing and rewriting developer quick-start docs for new API releases.",
      "Scaling developer community engagement and user acquisition channels."
    ],
    customPainPointFraming: "testing authentication SDK versions, updating developer setup documentation, or scaling developer outreach"
  },
  {
    name: "Resend",
    category: "Developer tools",
    website: "https://resend.com",
    targetUsers: "Software developers, SaaS builders, and engineering teams",
    linkedin: "https://www.linkedin.com/company/resend",
    hiring: "Yes",
    funding: "Series A",
    description: "An email API platform for developers that allows sending transactional emails with clean code and React templates.",
    domain: "email infrastructure and developer APIs",
    introDetail: "I really like how you're using React Email to let developers build and preview beautiful responsive emails using clean code.",
    painPoints: [
      "Running manual and automated testing of email rendering on diverse client apps.",
      "Cleaning and tag-enriching user list databases to maintain high deliverability.",
      "Developing tutorial guides and templates to acquire new developers."
    ],
    customPainPointFraming: "testing email client layouts, cleaning recipient databases, or creating developer tutorial resources"
  },
  {
    name: "Railway",
    category: "Developer tools",
    website: "https://railway.app",
    targetUsers: "Full-stack developers, DevOps teams, and startups",
    linkedin: "https://www.linkedin.com/company/railway-app",
    hiring: "Yes",
    funding: "Series A",
    description: "A cloud deployment platform that lets developers provision databases, microservices, and web applications instantly.",
    domain: "cloud infrastructure and developer deployment workflows",
    introDetail: "I saw how your environment templates and serverless hosting let developers spin up databases and microservices instantly.",
    painPoints: [
      "Testing community deployment templates to ensure they build without errors.",
      "Collecting user feedback on environment dashboard configuration steps.",
      "Running outbound developer developer relations campaigns for new templates."
    ],
    customPainPointFraming: "testing deploy templates, gathering onboarding feedback, or scaling developer ambassador programs"
  },
  {
    name: "Neon",
    category: "Developer tools",
    website: "https://neon.tech",
    targetUsers: "Backend engineers, software developers, and database teams",
    linkedin: "https://www.linkedin.com/company/neon-tech",
    hiring: "Yes",
    funding: "Series B",
    description: "A serverless Postgres database platform featuring autoscaling, database branching, and instant provisioning.",
    domain: "serverless Postgres database scaling",
    introDetail: "Your database branching feature that replicates schema and data for local developer testing is a game-changer.",
    painPoints: [
      "Testing database branch creation under concurrent simulated workloads.",
      "Writing step-by-step developer guides for backend ORM integrations.",
      "Sourcing developer feedback on serverless pricing and setup hurdles."
    ],
    customPainPointFraming: "testing DB branching workloads, compiling backend ORM tutorials, or gathering developer setup feedback"
  },
  {
    name: "Supabase",
    category: "Developer tools",
    website: "https://supabase.com",
    targetUsers: "Web and mobile app developers, SaaS founders",
    linkedin: "https://www.linkedin.com/company/supabase",
    hiring: "Yes",
    funding: "Series B",
    description: "An open-source Firebase alternative providing a Postgres database, authentication, instant APIs, and edge functions.",
    domain: "open-source backend-as-a-service and database tooling",
    introDetail: "I saw how your platform brings together Postgres databases, auth, and edge functions into a clean, unified dashboard.",
    painPoints: [
      "Running regression testing on dashboard modules and client SDK updates.",
      "Benchmarking response times for database edge functions globally.",
      "Structuring and cleaning community-submitted integration tutorials."
    ],
    customPainPointFraming: "testing dashboard UI regressions, benchmarking edge functions, or structuring developer integration docs"
  },
  {
    name: "Vercel",
    category: "Developer tools",
    website: "https://vercel.com",
    targetUsers: "Frontend developers, SaaS teams, and enterprise engineering departments",
    linkedin: "https://www.linkedin.com/company/vercel",
    hiring: "Yes",
    funding: "Series D",
    description: "Provides hosting and deployment infrastructure optimized for Next.js, frontend frameworks, and edge performance.",
    domain: "frontend deployment and hosting infrastructure",
    introDetail: "Your collaborative preview deployments that let teams comment directly on live frontend iterations are incredibly useful.",
    painPoints: [
      "Testing edge middleware functions for compatibility across various browser agents.",
      "Auditing and cleaning platform documentation logs for dead links and outdated syntax.",
      "Gathering detailed user experience feedback from enterprise team onboardings."
    ],
    customPainPointFraming: "testing edge middleware versions, auditing documentation links, or collecting enterprise UX feedback"
  },
  {
    name: "Sentry",
    category: "Developer tools",
    website: "https://sentry.io",
    targetUsers: "Software engineers, mobile developers, and DevOps leads",
    linkedin: "https://www.linkedin.com/company/sentry",
    hiring: "Yes",
    funding: "Series E",
    description: "An application performance and error tracking platform that monitors stack traces and performance issues in real time.",
    domain: "real-time application error monitoring",
    introDetail: "Your stack trace aggregation and session replay tools that pinpoint the exact code line responsible for crashes are life-savers.",
    painPoints: [
      "Testing exception-tracking SDK integrations across legacy framework versions.",
      "Structuring and tagging error databases for predictive crash notifications.",
      "Writing developer comparison blogs and technical outreach documentation."
    ],
    customPainPointFraming: "testing SDK tracking integrations, structuring error databases, or compiling technical dev content"
  },
  {
    name: "Temporal",
    category: "Developer tools",
    website: "https://temporal.io",
    targetUsers: "Distributed systems engineers, backend architects",
    linkedin: "https://www.linkedin.com/company/temporal-technologies",
    hiring: "Yes",
    funding: "Series B",
    description: "An open-source durable execution platform that enables developers to build highly reliable distributed workflows.",
    domain: "microservices orchestration and durable execution",
    introDetail: "I saw how your platform handles state maintenance and retry logic automatically for complex distributed microservices.",
    painPoints: [
      "Testing workflow recovery edge cases in simulated network partition crashes.",
      "Creating tutorial guides and boilerplate repositories for new language SDKs.",
      "Running developer research surveys to track workflow onboarding bottlenecks."
    ],
    customPainPointFraming: "testing workflow recovery setups, building SDK boilerplate repositories, or running onboarding surveys"
  },
  {
    name: "Codeium",
    category: "Developer tools",
    website: "https://codeium.com",
    targetUsers: "Developers, software engineers, and enterprise software teams",
    linkedin: "https://www.linkedin.com/company/codeium",
    hiring: "Yes",
    funding: "Series C",
    description: "An AI-powered code autocomplete and developer search tool that integrates with modern IDEs.",
    domain: "AI-powered developer code autocomplete",
    introDetail: "Your rapid inline autocomplete suggestions and multi-file contextual chat are making coding workflows incredibly efficient.",
    painPoints: [
      "Testing IDE extension plugins for compatibility across various editor versions.",
      "Running human evaluations to benchmark autocomplete suggestions for accuracy.",
      "Gathering user feedback from university developer hackathons."
    ],
    customPainPointFraming: "testing IDE plugin updates, benchmarking code completions, or coordinating student hackathons"
  },
  {
    name: "GitBook",
    category: "Developer tools",
    website: "https://gitbook.com",
    targetUsers: "Engineering teams, product managers, and developers",
    linkedin: "https://www.linkedin.com/company/gitbook",
    hiring: "Yes",
    funding: "Series A",
    description: "A collaborative documentation platform for teams to write product wikis, API references, and user guides.",
    domain: "developer documentation and team wiki systems",
    introDetail: "I noticed how your Git integration and markdown editor make keeping technical documentation updated so simple.",
    painPoints: [
      "Testing rich text editor layouts and markdown parsers across multiple browsers.",
      "Auditing user template libraries to ensure high-quality styling defaults.",
      "Acquiring developer teams to try out your new AI search integration."
    ],
    customPainPointFraming: "testing editor markdown parsers, auditing documentation styles, or scaling dev team acquisition"
  },
  {
    name: "Codacy",
    category: "Developer tools",
    website: "https://codacy.com",
    targetUsers: "Engineering managers, team leads, and developers",
    linkedin: "https://www.linkedin.com/company/codacy",
    hiring: "Yes",
    funding: "Series B",
    description: "An automated code review and static analysis tool that monitors code quality, security, and coverage.",
    domain: "code analysis and automated review platforms",
    introDetail: "I like how your platform integrates static analysis and security checks directly into the pull request workflow.",
    painPoints: [
      "Testing parser rule execution for edge cases in less common programming languages.",
      "Writing technical product integration guides and customer onboarding manuals.",
      "Outbound prospecting to connect with engineering managers on GitHub."
    ],
    customPainPointFraming: "testing static code rules, writing developer integration guides, or scaling outbound pipeline"
  },
  {
    name: "Inngest",
    category: "Developer tools",
    website: "https://inngest.com",
    targetUsers: "SaaS developers, serverless builders, and backend teams",
    linkedin: "https://www.linkedin.com/company/inngest",
    hiring: "Yes",
    funding: "Seed",
    description: "An event-driven serverless workflow platform that lets developers run background jobs without managing queues.",
    domain: "event-driven serverless workflows",
    introDetail: "I love how your zero-infrastructure approach lets developers write event-driven background functions with simple code.",
    painPoints: [
      "Testing function retry logic under simulated rate-limit scenarios.",
      "Writing step-by-step developer guides for setting up webhooks.",
      "Acquiring early SaaS developers to build initial feedback loops."
    ],
    customPainPointFraming: "testing event retry flows, writing webhook tutorial setups, or driving developer signups"
  },
  {
    name: "Trigger.dev",
    category: "Developer tools",
    website: "https://trigger.dev",
    targetUsers: "Node.js developers, SaaS builders, and backend teams",
    linkedin: "https://www.linkedin.com/company/trigger-dev",
    hiring: "Yes",
    funding: "Seed",
    description: "An open-source background jobs framework that lets developers run long-running tasks in Next.js and Node.js.",
    domain: "open-source background jobs frameworks",
    introDetail: "I saw how your platform handles execution state and timeouts for long-running Next.js background tasks.",
    painPoints: [
      "Testing background job runner stability during heavy concurrent loads.",
      "Writing documentation tutorials on connecting third-party API integrations.",
      "Promoting your open-source repository on GitHub to increase developer stars."
    ],
    customPainPointFraming: "testing background runner stability, writing API integration guides, or driving GitHub developer stars"
  },
  {
    name: "Dub.co",
    category: "Developer tools",
    website: "https://dub.co",
    targetUsers: "Startups, growth marketers, and SaaS founders",
    linkedin: "https://www.linkedin.com/company/dub-co",
    hiring: "Yes",
    funding: "Seed",
    description: "An open-source link management infrastructure for modern marketing teams, featuring geo-targeting and analytics.",
    domain: "link management and redirection infrastructure",
    introDetail: "Your customizable link redirections and high-fidelity analytics dashboard for tracking marketing campaigns look incredibly clean.",
    painPoints: [
      "Testing redirect speeds and edge caching across global servers.",
      "Gathering user feedback on analytics dashboard filters and exports.",
      "Outbound marketing to source SaaS builders for your developer tier."
    ],
    customPainPointFraming: "testing global redirection speeds, gathering analytics feedback, or scaling developer outreach"
  },
  {
    name: "Axiom",
    category: "Developer tools",
    website: "https://axiom.co",
    targetUsers: "DevOps teams, backend engineers, and security leads",
    linkedin: "https://www.linkedin.com/company/axiom-data",
    hiring: "Yes",
    funding: "Seed",
    description: "A serverless logging and data analytics platform that allows querying terabytes of log data in real-time.",
    domain: "serverless logging and query infrastructure",
    introDetail: "Your ability to ingest gigabytes of logs and run real-time queries without managing complex infrastructure is highly impressive.",
    painPoints: [
      "Testing query parser accuracy against complex structured log formats.",
      "Writing integration guides for popular cloud providers (AWS, Vercel).",
      "Running developer research surveys to locate dashboard navigation hurdles."
    ],
    customPainPointFraming: "testing log query accuracy, writing cloud platform integrations, or running UX surveys"
  },

  // ==========================================
  // MARKETING SAAS (16-30)
  // ==========================================
  {
    name: "Jasper",
    category: "Marketing SaaS",
    website: "https://jasper.ai",
    targetUsers: "Enterprise marketing teams, content managers, and agencies",
    linkedin: "https://www.linkedin.com/company/jasper-ai",
    hiring: "Yes",
    funding: "Series A",
    description: "An AI-powered co-pilot that helps marketing teams write content, align with brand voice, and manage campaigns.",
    domain: "AI copywriting and marketing content systems",
    introDetail: "I really like your brand voice model which ensures generated blog posts and ads stay aligned with company style guides.",
    painPoints: [
      "Testing template outputs for formatting consistency across browser types.",
      "Auditing generated text outputs to identify repetitive phrasing or style deviations.",
      "Creating diverse ad designs and creatives for multichannel marketing tests."
    ],
    customPainPointFraming: "testing editor formatting behaviors, auditing text styling variations, or designing marketing ad creatives"
  },
  {
    name: "Copy.ai",
    category: "Marketing SaaS",
    website: "https://copy.ai",
    targetUsers: "Go-to-market teams, marketers, and growth builders",
    linkedin: "https://www.linkedin.com/company/copyai",
    hiring: "Yes",
    funding: "Series A",
    description: "A GTM automation platform that generates blog posts, emails, and social copy using AI workflows.",
    domain: "AI marketing copy and workflow automation",
    introDetail: "I noticed how your GTM workflow builder automates multi-step processes like converting product releases into marketing copy.",
    painPoints: [
      "Testing workflow run outputs for structural formatting errors.",
      "Collecting user feedback on custom workflow template creation.",
      "Cleaning and enriching prospecting data feeds for cold outreach flows."
    ],
    customPainPointFraming: "testing workflow output formatting, collecting template builder reviews, or enriching outreach lists"
  },
  {
    name: "Writesonic",
    category: "Marketing SaaS",
    website: "https://writesonic.com",
    targetUsers: "SEO professionals, digital marketers, and agency owners",
    linkedin: "https://www.linkedin.com/company/writesonic",
    hiring: "Yes",
    funding: "Seed",
    description: "A generative AI platform for creating SEO-friendly articles, marketing copy, and customizable AI chatbots.",
    domain: "AI writing and SEO content optimization",
    introDetail: "Your SEO-optimized blog generator that analyzes current search rankings to compile drafts is exceptionally useful.",
    painPoints: [
      "Testing article editor features (like formatting and image insertion) for web bugs.",
      "Auditing chatbot response accuracy on custom customer datasets.",
      "Sourcing marketing leads and executing outbound growth campaigns."
    ],
    customPainPointFraming: "testing blog editor components, auditing custom chatbot responses, or running outbound campaigns"
  },
  {
    name: "Mutiny",
    category: "Marketing SaaS",
    website: "https://mutinyhq.com",
    targetUsers: "B2B growth teams, marketing leads, and conversion specialists",
    linkedin: "https://www.linkedin.com/company/mutinyhq",
    hiring: "Yes",
    funding: "Series B",
    description: "A website personalization platform that allows B2B companies to customize copy and layouts for target companies.",
    domain: "web personalization and conversion optimization",
    introDetail: "I really like how your platform identifies site visitors by IP to swap headlines for specific industries.",
    painPoints: [
      "Testing personalized layout rendering across diverse mobile browsers.",
      "Auditing client IP resolution databases to clean up mismatches.",
      "Designing and executing ad creatives for customer acquisition tests."
    ],
    customPainPointFraming: "testing mobile layout variations, cleaning IP databases, or producing acquisition marketing creatives"
  },
  {
    name: "Senja",
    category: "Marketing SaaS",
    website: "https://senja.io",
    targetUsers: "SaaS founders, creators, and marketers",
    linkedin: "https://www.linkedin.com/company/senjahq",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A tool that helps businesses collect, manage, and share customer text and video testimonials.",
    domain: "customer testimonial collection and widgets",
    introDetail: "Your simple collection forms that make it incredibly easy for users to record and submit video testimonials are brilliant.",
    painPoints: [
      "Testing collection widgets on mobile safari and edge cases.",
      "Auditing video testimonial transcriber scripts for grammar errors.",
      "Outbound outreach to acquire new SaaS founders for your paid plans."
    ],
    customPainPointFraming: "testing collection widgets on mobile, auditing transcript accuracy, or scaling outbound outreach"
  },
  {
    name: "Testimonial.to",
    category: "Marketing SaaS",
    website: "https://testimonial.to",
    targetUsers: "Online businesses, course creators, and SaaS startups",
    linkedin: "https://www.linkedin.com/company/testimonialto",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A video and text testimonial tool that collects customer reviews and displays them on a dedicated wall of love.",
    domain: "testimonial collection widgets and video reviews",
    introDetail: "Your 'Wall of Love' widget that aggregates text and video reviews in a beautiful masonry grid is incredibly clean.",
    painPoints: [
      "Testing wall of love widget embeds on various CMS templates (Webflow, Shopify).",
      "Auditing and tagging video transcripts for search keywords.",
      "Sourcing marketing leads and building outreach databases."
    ],
    customPainPointFraming: "testing widget embeds on CMS pages, auditing video transcripts, or compiling marketing databases"
  },
  {
    name: "Taplio",
    category: "Marketing SaaS",
    website: "https://taplio.com",
    targetUsers: "Founders, content creators, and marketing managers",
    linkedin: "https://www.linkedin.com/company/taplio",
    hiring: "Yes",
    funding: "Seed",
    description: "An all-in-one tool for LinkedIn creators to schedule posts, analyze performance, and engage with their audience.",
    domain: "social media management and LinkedIn content curation",
    introDetail: "Your AI-powered content suggestion queue and post scheduling capabilities are highly effective for building personal brands.",
    painPoints: [
      "Testing scheduler queue stability during API rate limit fluctuations.",
      "Structuring and cleaning content libraries for curated post ideas.",
      "Running outbound growth campaigns to source agencies and corporate teams."
    ],
    customPainPointFraming: "testing scheduler API integrations, cleaning content library databases, or scaling outbound campaigns"
  },
  {
    name: "TweetHunter",
    category: "Marketing SaaS",
    website: "https://tweethunter.io",
    targetUsers: "Creators, Twitter marketers, and business owners",
    linkedin: "https://www.linkedin.com/company/tweethunter",
    hiring: "Yes",
    funding: "Seed",
    description: "A Twitter growth tool with scheduling, AI content suggestions, analytics, and CRM features.",
    domain: "Twitter growth and audience analytics",
    introDetail: "I saw how you help users schedule threads and locate viral content inspirations using AI analytics.",
    painPoints: [
      "Testing thread scheduler APIs for browser compatibility.",
      "Cleaning and tagging data sets of viral tweets for model updates.",
      "Running user research to investigate dashboard onboarding drops."
    ],
    customPainPointFraming: "testing post schedule interfaces, cleaning tweet database assets, or running user onboarding research"
  },
  {
    name: "SurferSEO",
    category: "Marketing SaaS",
    website: "https://surferseo.com",
    targetUsers: "SEO specialists, copywriters, and content agencies",
    linkedin: "https://www.linkedin.com/company/surfer",
    hiring: "Yes",
    funding: "Series A",
    description: "An SEO content optimization tool that analyzes page content against top competitors to provide optimization guidelines.",
    domain: "SEO content optimization dashboards",
    introDetail: "Your content editor's real-time score metric and keyword density feedback loop are essential for copywriters.",
    painPoints: [
      "Testing content editor UI elements for lagging or text cursor jumps.",
      "Cleaning and tagging competitor keyword datasets to update content models.",
      "Outbound outreach to acquire new digital marketing agencies."
    ],
    customPainPointFraming: "testing editor UI components, cleaning keyword datasets, or scaling outbound outreach campaigns"
  },
  {
    name: "Figma",
    category: "Marketing SaaS",
    website: "https://figma.com",
    targetUsers: "UI/UX designers, product managers, and developers",
    linkedin: "https://www.linkedin.com/company/figma",
    hiring: "Yes",
    funding: "Series E",
    description: "A collaborative web-based tool for interface design, wireframing, and interactive prototyping.",
    domain: "collaborative UI design and prototyping suites",
    introDetail: "Your real-time collaborative canvas and dev mode features make bridging design to development incredibly smooth.",
    painPoints: [
      "Testing plugin marketplace installations for layout bugs.",
      "Auditing and tagging design template libraries to ensure high-quality standards.",
      "Running user research surveys to gather UI design student feedback."
    ],
    customPainPointFraming: "testing plugin installer flows, auditing design libraries, or running student user research"
  },
  {
    name: "Klaviyo",
    category: "Marketing SaaS",
    website: "https://klaviyo.com",
    targetUsers: "Ecommerce marketers, brands, and agencies",
    linkedin: "https://www.linkedin.com/company/klaviyo",
    hiring: "Yes",
    funding: "IPO",
    description: "An email and SMS marketing automation platform designed specifically for ecommerce brands.",
    domain: "ecommerce email and SMS automation",
    introDetail: "I really like how your flow builder automatically triggers SMS and email sequences based on shopper behavior.",
    painPoints: [
      "Testing web template builder responsiveness on complex mobile displays.",
      "Cleaning customer transaction databases to set up audience cohorts.",
      "Executing market research to map competitor marketing software features."
    ],
    customPainPointFraming: "testing mobile template views, cleaning transaction databases, or executing competitor market research"
  },
  {
    name: "ConvertKit",
    category: "Marketing SaaS",
    website: "https://convertkit.com",
    targetUsers: "Bloggers, podcasters, and online creators",
    linkedin: "https://www.linkedin.com/company/convertkit",
    hiring: "Yes",
    funding: "Series A",
    description: "An email marketing platform built for professional creators with subscription forms and automated funnels.",
    domain: "creator email marketing and subscriber automation",
    introDetail: "I love how your creator network allows writers to recommend other newsletters and grow their subscriber base.",
    painPoints: [
      "Testing user dashboard analytics displays for loading speed and bugs.",
      "Cleaning subscriber databases to flag cold emails and improve bounce rates.",
      "Coordinating creator campus programs to acquire student writers."
    ],
    customPainPointFraming: "testing analytics dashboards, cleaning subscriber lists, or organizing creator campus programs"
  },
  {
    name: "Buffer",
    category: "Marketing SaaS",
    website: "https://buffer.com",
    targetUsers: "Small businesses, creators, and social media managers",
    linkedin: "https://www.linkedin.com/company/buffer-hq",
    hiring: "Yes",
    funding: "Series A",
    description: "A social media scheduler and dashboard that helps teams schedule posts, analyze results, and engage with users.",
    domain: "social media scheduling and curation tools",
    introDetail: "I really like your clean interface and queue composer that make planning social calendars very intuitive.",
    painPoints: [
      "Testing image uploading and scaling across social APIs.",
      "Auditing user analytics databases to clean up integration anomalies.",
      "Outbound marketing to acquire agencies and growing brands."
    ],
    customPainPointFraming: "testing image upload APIs, auditing database records, or scaling agency outbound marketing"
  },
  {
    name: "Unbounce",
    category: "Marketing SaaS",
    website: "https://unbounce.com",
    targetUsers: "Conversion marketers, agencies, and SaaS growth teams",
    linkedin: "https://www.linkedin.com/company/unbounce",
    hiring: "Yes",
    funding: "Series B",
    description: "A drag-and-drop landing page builder that helps companies build, publish, and test high-converting web pages.",
    domain: "landing page builders and conversion optimization",
    introDetail: "I saw how your Smart Builder uses AI to recommend page layouts based on target audience profiles.",
    painPoints: [
      "Testing page builder UI elements for drag-and-drop glitches.",
      "Auditing template layouts to check for mobile page load speed.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing page builder layouts, auditing page load speeds, or building lead databases"
  },
  {
    name: "Leadpages",
    category: "Marketing SaaS",
    website: "https://leadpages.com",
    targetUsers: "Small businesses, coaches, and local service providers",
    linkedin: "https://www.linkedin.com/company/leadpages",
    hiring: "Yes",
    funding: "Series B",
    description: "A landing page and website builder that helps businesses capture leads and drive online sales.",
    domain: "lead generation landing pages and web forms",
    introDetail: "Your pop-up forms and alert bars that easily integrate with any CMS to capture leads are highly effective.",
    painPoints: [
      "Testing form integrations on diverse mobile browsers.",
      "Cleaning and tag-enriching template designs in the builder.",
      "Outbound outreach to acquire small business owners and creators."
    ],
    customPainPointFraming: "testing web form integrations, cleaning templates, or driving outbound creator outreach"
  },

  // ==========================================
  // HR / RECRUITMENT SAAS (31-45)
  // ==========================================
  {
    name: "Ashby",
    category: "HR/Recruitment SaaS",
    website: "https://ashbyhq.com",
    targetUsers: "HR managers, talent acquisition teams, and recruiters",
    linkedin: "https://www.linkedin.com/company/ashbyhq",
    hiring: "Yes",
    funding: "Series B",
    description: "An all-in-one recruiting platform that combines applicant tracking, scheduling, and recruiting analytics.",
    domain: "applicant tracking systems and recruiting analytics",
    introDetail: "I really like how your customizable dashboard compiles deep data on sourcing speed and pipeline bottlenecks.",
    painPoints: [
      "Testing scheduling calendar synchronization across various email client apps.",
      "Data cleaning and tag restructuring of candidate resume files.",
      "Executing market research to verify competitive recruitment software pricing."
    ],
    customPainPointFraming: "testing calendar integrations, cleaning candidate databases, or conducting recruitment market research"
  },
  {
    name: "Greenhouse",
    category: "HR/Recruitment SaaS",
    website: "https://greenhouse.com",
    targetUsers: "Enterprise recruitment teams, HR leads, and talent officers",
    linkedin: "https://www.linkedin.com/company/greenhouse-software",
    hiring: "Yes",
    funding: "Series D",
    description: "An enterprise-grade hiring software that helps companies design structured recruitment processes and track applicants.",
    domain: "structured recruitment and applicant tracking systems",
    introDetail: "Your structured hiring framework that helps interviewers score candidates consistently against predefined criteria is excellent.",
    painPoints: [
      "Testing enterprise API data integrations with third-party software tools.",
      "Auditing candidate databases to clean up duplicates and obsolete profiles.",
      "Running user research interviews to optimize candidate submission dashboards."
    ],
    customPainPointFraming: "testing enterprise API integrations, cleaning candidate records, or conducting candidate UX interviews"
  },
  {
    name: "Lever",
    category: "HR/Recruitment SaaS",
    website: "https://lever.co",
    targetUsers: "Tech companies, scaling startups, and talent partners",
    linkedin: "https://www.linkedin.com/company/lever",
    hiring: "Yes",
    funding: "Series D",
    description: "A collaborative ATS and candidate relationship management platform that helps teams source and build candidate pipelines.",
    domain: "collaborative ATS and candidate relationship management",
    introDetail: "I noticed how your collaborative interface allows recruiters and hiring managers to coordinate candidate evaluations smoothly.",
    painPoints: [
      "Testing extension plugins on different browser configurations.",
      "Cleaning resume files and tagging career records for talent pools.",
      "Outbound outreach to connect with recruitment agencies globally."
    ],
    customPainPointFraming: "testing browser extensions, cleaning talent databases, or driving agency outbound outreach"
  },
  {
    name: "Kula",
    category: "HR/Recruitment SaaS",
    website: "https://kula.ai",
    targetUsers: "Recruitment teams, talent sourcers, and founders",
    linkedin: "https://www.linkedin.com/company/kulaai",
    hiring: "Yes",
    funding: "Seed",
    description: "A talent sourcing automation platform that connects with employee networks to source candidates.",
    domain: "automated talent sourcing and candidate messaging",
    introDetail: "Your network mapping tools that let recruiters request warm referrals from employees are highly innovative.",
    painPoints: [
      "Testing email sequencing APIs for browser compatibility.",
      "Cleaning and validating prospect email lists for accuracy.",
      "Running outbound growth campaigns to source enterprise HR clients."
    ],
    customPainPointFraming: "testing outbound email APIs, cleaning prospect databases, or driving enterprise sales leads"
  },
  {
    name: "Gem",
    category: "HR/Recruitment SaaS",
    website: "https://gem.com",
    targetUsers: "Talent leaders, recruiters, and executive search teams",
    linkedin: "https://www.linkedin.com/company/gemhq",
    hiring: "Yes",
    funding: "Series C",
    description: "A recruiting platform that integrates with email and LinkedIn to automate outreach and track candidate relationships.",
    domain: "candidate pipeline and outreach CRM solutions",
    introDetail: "I love how your browser extension overlays CRM actions directly onto LinkedIn profiles for simple sourcing.",
    painPoints: [
      "Testing browser extension overlays on updated LinkedIn layouts.",
      "Cleaning and enriching email address datasets for sourcing.",
      "Running user research to understand recruiter tool onboarding drop points."
    ],
    customPainPointFraming: "testing browser extensions, enriching candidate databases, or running user onboarding research"
  },
  {
    name: "Deel",
    category: "HR/Recruitment SaaS",
    website: "https://deel.com",
    targetUsers: "Global companies, remote startups, and HR departments",
    linkedin: "https://www.linkedin.com/company/deel",
    hiring: "Yes",
    funding: "Series D",
    description: "A global payroll, compliance, and contractor management platform for hiring remote workers worldwide.",
    domain: "global compliance and contractor payroll services",
    introDetail: "I saw how you simplify compliance by automatically drafting localized contracts for contractors globally.",
    painPoints: [
      "Testing passport/document verification tools on different smartphone cameras.",
      "Cleaning country tax form databases to update legal documents.",
      "Running UX user research surveys with remote contractor teams."
    ],
    customPainPointFraming: "testing document validation tools, cleaning compliance databases, or conducting worker UX research"
  },
  {
    name: "Rippling",
    category: "HR/Recruitment SaaS",
    website: "https://rippling.com",
    targetUsers: "HR managers, IT administrators, and finance leads",
    linkedin: "https://www.linkedin.com/company/rippling",
    hiring: "Yes",
    funding: "Series F",
    description: "A unified workforce platform that manages employee HR, IT, hardware, software, and payroll systems.",
    domain: "payroll, benefits, and device management systems",
    introDetail: "Your ability to automatically provision software licenses and ship laptops to new remote hires is extremely impressive.",
    painPoints: [
      "Testing hardware status indicators on the user dashboard interface.",
      "Auditing and structuring global software license datasets.",
      "Running user feedback surveys with corporate IT managers."
    ],
    customPainPointFraming: "testing dashboard status components, auditing license databases, or running IT user feedback surveys"
  },
  {
    name: "Oyster",
    category: "HR/Recruitment SaaS",
    website: "https://oysterhr.com",
    targetUsers: "Remote companies, HR directors, and startup founders",
    linkedin: "https://www.linkedin.com/company/oysterhr",
    hiring: "Yes",
    funding: "Series C",
    description: "A global employment platform that manages local hiring, payroll, benefits, and compliance for remote workers.",
    domain: "global employment and remote contractor payroll",
    introDetail: "I really like your cost calculator that lets companies estimate global salary costs including local taxes.",
    painPoints: [
      "Testing salary calculator UI scripts for currency display errors.",
      "Cleaning and tag-enriching contract templates for different countries.",
      "Running outbound growth campaigns to source tech startups."
    ],
    customPainPointFraming: "testing cost calculator scripts, cleaning contract templates, or running tech startup outbound campaigns"
  },
  {
    name: "Multiplier",
    category: "HR/Recruitment SaaS",
    website: "https://usemultiplier.com",
    targetUsers: "HR heads, remote founders, and legal teams",
    linkedin: "https://www.linkedin.com/company/usemultiplier",
    hiring: "Yes",
    funding: "Series B",
    description: "An employer of record platform that enables companies to hire international talent legally without setting up entities.",
    domain: "global employment and local entity management",
    introDetail: "Your dashboard that unifies global payroll, benefits, and expense claims into one invoice is incredibly clean.",
    painPoints: [
      "Testing expense claims submission widgets on mobile browsers.",
      "Cleaning global employee data files for billing reports.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing mobile expense widgets, cleaning billing database files, or building custom outreach databases"
  },
  {
    name: "Gusto",
    category: "HR/Recruitment SaaS",
    website: "https://gusto.com",
    targetUsers: "Small business owners, HR managers, and accountants",
    linkedin: "https://www.linkedin.com/company/gusto",
    hiring: "Yes",
    funding: "Series E",
    description: "An HR and payroll platform that handles small business payroll, health benefits, and team management.",
    domain: "small business payroll and employee benefits",
    introDetail: "Your automated tax filing and payroll workflows that make running monthly payroll completely stress-free are wonderful.",
    painPoints: [
      "Testing tax filing PDF export layouts for alignment bugs.",
      "Auditing employee onboarding workflow logs for data mismatches.",
      "Gathering product feedback from small business owners."
    ],
    customPainPointFraming: "testing PDF export alignment, auditing onboarding logs, or gathering SMB user feedback"
  },
  {
    name: "BambooHR",
    category: "HR/Recruitment SaaS",
    website: "https://bamboohr.com",
    targetUsers: "HR departments, office managers, and team leads",
    linkedin: "https://www.linkedin.com/company/bamboohr",
    hiring: "Yes",
    funding: "Series C",
    description: "An HR software platform providing employee databases, time tracking, applicant tracking, and performance reviews.",
    domain: "employee data management and HR analytics",
    introDetail: "I noticed how your employee self-serve portal makes requesting time-off and accessing documents simple for team members.",
    painPoints: [
      "Testing leave calendar widget styling across mobile devices.",
      "Auditing and cleaning customer data import logs.",
      "Outbound outreach to connect with mid-market businesses."
    ],
    customPainPointFraming: "testing mobile calendar widgets, auditing import data logs, or scaling business outbound outreach"
  },
  {
    name: "Remote.com",
    category: "HR/Recruitment SaaS",
    website: "https://remote.com",
    targetUsers: "Fast-growing startups, HR managers, and remote workers",
    linkedin: "https://www.linkedin.com/company/remote-com",
    hiring: "Yes",
    funding: "Series C",
    description: "An employer of record and global contractor platform that handles local payroll, taxes, and compliance.",
    domain: "global Employer of Record and local compliance",
    introDetail: "Your IP guard service which guarantees international IP and patent protection for remote employees is extremely valuable.",
    painPoints: [
      "Testing contractor ID verification tools on mobile layouts.",
      "Cleaning global tax databases to update legal documents.",
      "Running user research with remote developers."
    ],
    customPainPointFraming: "testing mobile ID validation tools, cleaning compliance tax databases, or conducting developer UX research"
  },
  {
    name: "Lattice",
    category: "HR/Recruitment SaaS",
    website: "https://lattice.com",
    targetUsers: "HR leaders, team managers, and executive teams",
    linkedin: "https://www.linkedin.com/company/latticehr",
    hiring: "Yes",
    funding: "Series F",
    description: "A people management platform that helps companies manage performance reviews, OKRs, 1-on-1s, and surveys.",
    domain: "performance reviews and employee goal tracking",
    introDetail: "I saw how your OKR mapping helps team members align their daily tasks with global company objectives.",
    painPoints: [
      "Testing survey builder drag-and-drop components for web bugs.",
      "Cleaning and tag-structuring employee performance log records.",
      "Running outbound growth campaigns to connect with scaling tech startups."
    ],
    customPainPointFraming: "testing survey builder interfaces, structuring performance databases, or driving tech startup leads"
  },
  {
    name: "Culture Amp",
    category: "HR/Recruitment SaaS",
    website: "https://cultureamp.com",
    targetUsers: "People teams, HR executives, and CEO offices",
    linkedin: "https://www.linkedin.com/company/cultureamp",
    hiring: "Yes",
    funding: "Series F",
    description: "An employee experience platform that collects employee feedback, surveys, and performance insights.",
    domain: "employee experience surveys and people analytics",
    introDetail: "Your science-backed employee feedback surveys and dashboard analysis of team sentiment are excellent tools.",
    painPoints: [
      "Testing survey dashboard charts for responsive rendering on tablets.",
      "Cleaning and restructuring survey feedback databases.",
      "Conducting market research on competitor HR analytics features."
    ],
    customPainPointFraming: "testing chart dashboard rendering, cleaning survey databases, or executing competitor market research"
  },
  {
    name: "15Five",
    category: "HR/Recruitment SaaS",
    website: "https://15five.com",
    targetUsers: "Managers, HR directors, and high-performance companies",
    linkedin: "https://www.linkedin.com/company/15five",
    hiring: "Yes",
    funding: "Series C",
    description: "A performance management software platform based on weekly check-ins, employee feedback, and career growth tracks.",
    domain: "manager check-ins and performance management",
    introDetail: "I noticed how your weekly check-ins provide a simple venue for team members to flag blockers for managers.",
    painPoints: [
      "Testing text editor text entry widgets on mobile browsers.",
      "Cleaning database tables of customer review history logs.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing mobile check-in editors, cleaning historical data logs, or building custom lead databases"
  },

  // ==========================================
  // AI SAAS TOOLS (46-60)
  // ==========================================
  {
    name: "HeyGen",
    category: "AI SaaS tools",
    website: "https://heygen.com",
    targetUsers: "Video editors, marketing managers, and sales teams",
    linkedin: "https://www.linkedin.com/company/heygen",
    hiring: "Yes",
    funding: "Series A",
    description: "An AI video generation platform that enables users to create professional videos with talking avatars and voice cloning.",
    domain: "AI video generation and synthetic avatars",
    introDetail: "I really like your talking avatar generation and voice translation capabilities that render natural lip-syncs instantly.",
    painPoints: [
      "Auditing generated voice tracks to check for audio clipping bugs.",
      "Testing video builder UI canvas controls on multiple screen sizes.",
      "Outbound outreach to acquire corporate marketing agencies."
    ],
    customPainPointFraming: "auditing voice track audio quality, testing video builder UI layouts, or scaling agency outbound marketing"
  },
  {
    name: "ElevenLabs",
    category: "AI SaaS tools",
    website: "https://elevenlabs.io",
    targetUsers: "Developers, content creators, and audio publishers",
    linkedin: "https://www.linkedin.com/company/elevenlabsio",
    hiring: "Yes",
    funding: "Series B",
    description: "A research studio developing natural AI voice generators, text-to-speech APIs, and voice cloning software.",
    domain: "AI voice synthesis and text-to-speech APIs",
    introDetail: "I saw how your API generates hyper-realistic speech accents and emotions from raw text prompts.",
    painPoints: [
      "Testing audio file player widgets for playback errors on mobile Safari.",
      "Structuring and cleaning speech dataset files for training regional voice models.",
      "Sourcing developer signups and running developer acquisition hackathons."
    ],
    customPainPointFraming: "testing audio player widgets, structuring voice datasets, or driving developer hackathon signups"
  },
  {
    name: "Runway",
    category: "AI SaaS tools",
    website: "https://runwayml.com",
    targetUsers: "Video editors, visual designers, and creative agencies",
    linkedin: "https://www.linkedin.com/company/runwayml",
    hiring: "Yes",
    funding: "Series C",
    description: "A creative suite offering generative AI video models, background removals, and image generation tools.",
    domain: "generative video creation and model editing",
    introDetail: "Your Gen-2 and Gen-3 text-to-video capabilities that create high-fidelity video outputs from prompts are outstanding.",
    painPoints: [
      "Testing video editing canvas tools on mobile browser environments.",
      "Auditing generated video outputs for artifact and rendering bugs.",
      "Sourcing creative designers and driving community ambassador campaigns."
    ],
    customPainPointFraming: "testing mobile editor controls, auditing video rendering outputs, or scaling creator community programs"
  },
  {
    name: "Tavus",
    category: "AI SaaS tools",
    website: "https://tavus.io",
    targetUsers: "GTM teams, marketing agencies, and product leads",
    linkedin: "https://www.linkedin.com/company/tavus",
    hiring: "Yes",
    funding: "Series A",
    description: "A video personalization platform that generates tailored video clips of a founder/avatar for lead generation.",
    domain: "custom video cloning and personalization APIs",
    introDetail: "I saw how your API clones a speaker's face and voice to generate thousands of personalized video pitches automatically.",
    painPoints: [
      "Testing API response parameters for video rendering speeds.",
      "Auditing generated audio scripts for lip-sync and pronunciation bugs.",
      "Outbound marketing to connect with high-volume sales agencies."
    ],
    customPainPointFraming: "testing API video rendering, auditing speaker lip-sync accuracy, or scaling outbound agency pipeline"
  },
  {
    name: "Synthesia",
    category: "AI SaaS tools",
    website: "https://synthesia.io",
    targetUsers: "Enterprise L&D teams, corporate trainers, and marketers",
    linkedin: "https://www.linkedin.com/company/synthesia",
    hiring: "Yes",
    funding: "Series C",
    description: "An AI video generation platform that turns text scripts into video presentations featuring lifelike avatars.",
    domain: "synthetic video generation for training and marketing",
    introDetail: "Your AI avatar video generator that helps corporate L&D teams create training videos without cameras is super practical.",
    painPoints: [
      "Testing video rendering queues under high concurrent platform traffic.",
      "Auditing pronunciation maps on lesser-used international languages.",
      "Sourcing business development leads to target HR teams."
    ],
    customPainPointFraming: "testing video rendering queues, auditing multi-language pronunciations, or scaling business development leads"
  },
  {
    name: "Perplexity",
    category: "AI SaaS tools",
    website: "https://perplexity.ai",
    targetUsers: "Researchers, writers, students, and professionals",
    linkedin: "https://www.linkedin.com/company/perplexity-ai",
    hiring: "Yes",
    funding: "Series B",
    description: "An AI conversational search engine that provides cited natural language answers to user queries.",
    domain: "conversational search and LLM context indexing",
    introDetail: "I really like how your conversational search lists precise source citations alongside natural text answers.",
    painPoints: [
      "Testing web dashboard results formatting across mobile browser types.",
      "Auditing search query summaries to flag citation link mismatches.",
      "Campus outreach programs to acquire student search users."
    ],
    customPainPointFraming: "testing mobile search formatting, auditing query citation links, or scaling campus ambassador signups"
  },
  {
    name: "DeepL",
    category: "AI SaaS tools",
    website: "https://deepl.com",
    targetUsers: "Translation teams, global businesses, and developers",
    linkedin: "https://www.linkedin.com/company/deepl",
    hiring: "Yes",
    funding: "Series C",
    description: "A high-fidelity machine translation platform utilizing deep neural networks for accurate text and document translations.",
    domain: "AI translation for documents and texts",
    introDetail: "Your translation platform's ability to preserve original document formatting during translations is very useful.",
    painPoints: [
      "Testing document translator converters for layout bugs on complex files.",
      "Auditing translation outputs for nuances in regional languages.",
      "Outbound prospecting to target international business leads."
    ],
    customPainPointFraming: "testing file translator layouts, auditing translation dialects, or scaling business outbound outreach"
  },
  {
    name: "Pika",
    category: "AI SaaS tools",
    website: "https://pika.art",
    targetUsers: "Content creators, filmmakers, and digital artists",
    linkedin: "https://www.linkedin.com/company/pika-labs",
    hiring: "Yes",
    funding: "Series A",
    description: "An AI video generation platform that enables users to create, edit, and animate cinematic videos from text/images.",
    domain: "AI-powered video synthesis and rendering",
    introDetail: "I saw how your editor lets users control camera movements and modify specific video frames using AI.",
    painPoints: [
      "Testing editor UI control sliders for browser responsiveness.",
      "Auditing video clip generations for image rendering errors.",
      "Acquiring student users and managing creator ambassador channels."
    ],
    customPainPointFraming: "testing editor interface sliders, auditing video clip rendering, or scaling student creator outreach"
  },
  {
    name: "Suno",
    category: "AI SaaS tools",
    website: "https://suno.com",
    targetUsers: "Musicians, creators, and consumer app users",
    linkedin: "https://www.linkedin.com/company/suno-ai",
    hiring: "Yes",
    funding: "Series B",
    description: "A generative music platform that compiles full audio songs including instrumentation and lyrics from text descriptions.",
    domain: "generative music creation platforms",
    introDetail: "Your generative music system's ability to write full instrumental tracks and vocal melodies from text prompts is amazing.",
    painPoints: [
      "Testing mobile audio player components for buffering bugs.",
      "Auditing compiled tracks to catch vocal artifacts and audio clipping.",
      "Outbound campaigns to acquire consumer creators on social channels."
    ],
    customPainPointFraming: "testing mobile audio widgets, auditing audio track artifacts, or running consumer outreach campaigns"
  },
  {
    name: "Harvey",
    category: "AI SaaS tools",
    website: "https://harvey.ai",
    targetUsers: "Law firms, corporate legal teams, and compliance officers",
    linkedin: "https://www.linkedin.com/company/harveyai",
    hiring: "Yes",
    funding: "Series B",
    description: "An AI-powered legal co-pilot that assists lawyers with research, contract analysis, and due diligence.",
    domain: "AI-powered legal workspace and analysis software",
    introDetail: "I saw how you assist law firms in parsing hundreds of complex contracts to find compliance discrepancies.",
    painPoints: [
      "Testing dashboard text highlighter components for lag on large documents.",
      "Data cleaning and tagging legal databases of court case histories.",
      "Running customer research surveys to map lawyer onboarding blockers."
    ],
    customPainPointFraming: "testing document interface components, cleaning legal history databases, or running user research surveys"
  },
  {
    name: "Bland.ai",
    category: "AI SaaS tools",
    website: "https://bland.ai",
    targetUsers: "Developers, call centers, and customer support teams",
    linkedin: "https://www.linkedin.com/company/bland-ai",
    hiring: "Yes",
    funding: "Seed",
    description: "An API platform that enables developers to build and deploy conversational AI voice agents for phone calls.",
    domain: "conversational voice calling and developer APIs",
    introDetail: "Your developer API that lets teams customize voice agent responses and orchestrate phone calls in real time is very cool.",
    painPoints: [
      "Testing voice agents for latency during peak call volumes.",
      "Auditing transcripts to evaluate translation accuracy on regional accents.",
      "Writing technical developer setup tutorials for webhook configurations."
    ],
    customPainPointFraming: "testing phone call latency, auditing conversation transcript databases, or writing developer tutorials"
  },
  {
    name: "Vapi",
    category: "AI SaaS tools",
    website: "https://vapi.com",
    targetUsers: "SaaS developers, voice engineers, and product teams",
    linkedin: "https://www.linkedin.com/company/vapi",
    hiring: "Yes",
    funding: "Seed",
    description: "A developer platform offering APIs and SDKs to build real-time voice assistants and widgets for web apps.",
    domain: "real-time voice applications and APIs",
    introDetail: "I saw how your developer SDKs allow teams to launch voice widgets directly into web browsers within minutes.",
    painPoints: [
      "Testing widget rendering and audio connection speeds on legacy browsers.",
      "Sourcing developer feedback on API setup and quick-start docs.",
      "Sourcing developer signups via outreach campaigns."
    ],
    customPainPointFraming: "testing browser audio widgets, auditing API setup documentation, or scaling developer signups"
  },
  {
    name: "Athina AI",
    category: "AI SaaS tools",
    website: "https://athina.ai",
    targetUsers: "AI developers, SaaS builders, and prompt engineers",
    linkedin: "https://www.linkedin.com/company/athina-ai",
    hiring: "Yes",
    funding: "Seed",
    description: "An LLM monitoring and evaluation dashboard that detects hallucinations, tracing prompt errors in real-time.",
    domain: "LLM evaluation and monitoring dashboards",
    introDetail: "I really like your real-time playground for tracing API calls and evaluating prompts against hallucinations.",
    painPoints: [
      "Testing data exporter scripts for exporting evaluations.",
      "Auditing chart visualization layouts to verify correct data representation.",
      "Outbound outreach to connect with software development agencies."
    ],
    customPainPointFraming: "testing dataset exporter modules, auditing dashboard chart widgets, or scaling developer outreach"
  },
  {
    name: "Composio",
    category: "AI SaaS tools",
    website: "https://composio.dev",
    targetUsers: "AI researchers, developer teams, and agent builders",
    linkedin: "https://www.linkedin.com/company/composio",
    hiring: "Yes",
    funding: "Seed",
    description: "Provides pre-built toolsets and integrations (Github, Slack, Jira) to connect LLM agents with third-party APIs.",
    domain: "tool integration suites for LLM agents",
    introDetail: "I saw how you enable LLM agents to connect with tools like Github, Slack, and Jira using your integration framework.",
    painPoints: [
      "Testing API auth handshakes for edge cases in third-party services.",
      "Writing step-by-step developer documentation for custom app integrations.",
      "Sourcing developer feedback via GitHub community channels."
    ],
    customPainPointFraming: "testing API authentication handshakes, writing developer integration guides, or driving GitHub stars"
  },
  {
    name: "Defog AI",
    category: "AI SaaS tools",
    website: "https://defog.ai",
    targetUsers: "Database administrators, business analysts, and developers",
    linkedin: "https://www.linkedin.com/company/defog-ai",
    hiring: "Yes",
    funding: "Seed",
    description: "A natural language interface for databases that lets non-technical users query data using custom SQL models.",
    domain: "SQL database natural language queries",
    introDetail: "I noticed how your custom language models let team members query SQL databases in natural language safely.",
    painPoints: [
      "Testing model query generation against complex database schemas.",
      "Cleaning and labeling database metadata for custom SQL models.",
      "Outbound prospecting to reach data analytics teams."
    ],
    customPainPointFraming: "testing model SQL generation, cleaning database metadata schemas, or scaling outbound outreach"
  },

  // ==========================================
  // PRODUCTIVITY SAAS (61-75)
  // ==========================================
  {
    name: "Notion",
    category: "Productivity SaaS",
    website: "https://notion.so",
    targetUsers: "Students, startup teams, and enterprise businesses",
    linkedin: "https://www.linkedin.com/company/notionhq",
    hiring: "Yes",
    funding: "Series C",
    description: "A connected workspace for wikis, notes, tasks, databases, and project management with AI features.",
    domain: "flexible workspace wikis and AI notes",
    introDetail: "Your database relations and rollup properties that let teams connect different wikis and tasks together are highly powerful.",
    painPoints: [
      "Testing database migration tools under heavy data sizes.",
      "Auditing and organizing community templates for format consistency.",
      "Campus programs to acquire student users and brand ambassadors."
    ],
    customPainPointFraming: "testing database migration modules, auditing template formats, or driving student campus programs"
  },
  {
    name: "Coda",
    category: "Productivity SaaS",
    website: "https://coda.io",
    targetUsers: "Product managers, teams, and operations specialists",
    linkedin: "https://www.linkedin.com/company/coda-hq",
    hiring: "Yes",
    funding: "Series D",
    description: "A collaborative document platform that combines text, spreadsheets, and database applications into a unified file.",
    domain: "collaborative document workspaces and databases",
    introDetail: "I like how your integration packs connect documents to live tools like Slack and Jira directly.",
    painPoints: [
      "Testing custom integration pack plugins for UI glitches.",
      "Auditing and tagging formula templates to ensure zero errors.",
      "Outbound marketing to acquire corporate teams and managers."
    ],
    customPainPointFraming: "testing integration pack widgets, auditing template formulas, or scaling business outbound outreach"
  },
  {
    name: "Linear",
    category: "Productivity SaaS",
    website: "https://linear.app",
    targetUsers: "Product managers, developers, and designers",
    linkedin: "https://www.linkedin.com/company/linear-app",
    hiring: "Yes",
    funding: "Series A",
    description: "A high-performance project management tool designed for software engineering teams.",
    domain: "high-performance project management tools",
    introDetail: "I saw how your keyboard shortcuts and offline sync make tracking tickets incredibly fast for developers.",
    painPoints: [
      "Testing offline state synchronization logic on mobile layouts.",
      "Writing onboarding manuals for migrating tickets from legacy platforms.",
      "Sourcing product user reviews from early-stage developers."
    ],
    customPainPointFraming: "testing mobile offline sync actions, compiling ticket migration guides, or gathering developer product reviews"
  },
  {
    name: "ClickUp",
    category: "Productivity SaaS",
    website: "https://clickup.com",
    targetUsers: "Remote teams, project managers, and agencies",
    linkedin: "https://www.linkedin.com/company/clickup",
    hiring: "Yes",
    funding: "Series C",
    description: "An all-in-one productivity platform for tasks, docs, goals, chat, and project tracking.",
    domain: "project management workspaces and task tracking",
    introDetail: "Your flexible custom fields and multiple task views that fit different team workflows are highly versatile.",
    painPoints: [
      "Testing CSV task import tools for layout errors.",
      "Gathering user onboarding feedback to identify dashboard friction.",
      "Designing ad creatives for digital marketing campaigns."
    ],
    customPainPointFraming: "testing CSV import modules, conducting onboarding feedback surveys, or designing ad creatives"
  },
  {
    name: "Todoist",
    category: "Productivity SaaS",
    website: "https://todoist.com",
    targetUsers: "Individuals, managers, and small teams",
    linkedin: "https://www.linkedin.com/company/doist",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A simple yet powerful to-do list and task manager for organizing personal and team projects.",
    domain: "daily task lists and team project management",
    introDetail: "I noticed how your natural language input allows users to write dates to schedule tasks instantly.",
    painPoints: [
      "Testing calendar synchronization on Android and iOS widgets.",
      "Auditing and tagging custom task templates in the library.",
      "Outbound outreach to acquire teams for your business tier."
    ],
    customPainPointFraming: "testing mobile sync widgets, auditing task templates, or scaling business outbound outreach"
  },
  {
    name: "Slite",
    category: "Productivity SaaS",
    website: "https://slite.com",
    targetUsers: "Remote companies, product teams, and startups",
    linkedin: "https://www.linkedin.com/company/slite",
    hiring: "Yes",
    funding: "Series A",
    description: "A collaborative team wiki and document editor built specifically for remote organizations.",
    domain: "remote team collaboration and documentation wikis",
    introDetail: "Your clean editor interface and document version histories are perfect for building company handbooks.",
    painPoints: [
      "Testing markdown parser widgets on diverse browser builds.",
      "Sourcing customer feedback on dashboard editor layouts.",
      "Sourcing sales leads and executing outbound campaigns."
    ],
    customPainPointFraming: "testing markdown editor widgets, conducting dashboard UX research, or scaling outbound outreach"
  },
  {
    name: "Raycast",
    category: "Productivity SaaS",
    website: "https://raycast.com",
    targetUsers: "Developers, power users, and system administrators",
    linkedin: "https://www.linkedin.com/company/raycast",
    hiring: "Yes",
    funding: "Series A",
    description: "A keyboard-first launcher for Mac that lets developers access files, code snippets, and API integrations instantly.",
    domain: "keyboard shortcuts and developer extensions",
    introDetail: "I really like your API developer kit which lets developers build custom launcher extensions using React.",
    painPoints: [
      "Testing extension store submissions to ensure they load properly.",
      "Writing setup guides for custom extension packages.",
      "Sourcing developer feedback on the extension API."
    ],
    customPainPointFraming: "testing extension store builds, writing API integration guides, or gathering developer extension feedback"
  },
  {
    name: "Loom",
    category: "Productivity SaaS",
    website: "https://loom.com",
    targetUsers: "Remote workers, design teams, and product managers",
    linkedin: "https://www.linkedin.com/company/loom-app",
    hiring: "Yes",
    funding: "Acquired (Series C)",
    description: "An asynchronous video messaging platform for recording screen, camera, and microphone clips.",
    domain: "asynchronous video messaging and screen recorders",
    introDetail: "I saw how your screen recorder and instant link generation make communicating asynchronously so efficient.",
    painPoints: [
      "Testing desktop browser extension record buttons.",
      "Auditing auto-generated video transcript files for mistakes.",
      "Executing market research to verify competitive business pricing."
    ],
    customPainPointFraming: "testing desktop recorder components, auditing auto-transcription files, or executing market research studies"
  },
  {
    name: "Superhuman",
    category: "Productivity SaaS",
    website: "https://superhuman.com",
    targetUsers: "Busy professionals, founders, and sales teams",
    linkedin: "https://www.linkedin.com/company/superhuman-co",
    hiring: "Yes",
    funding: "Series C",
    description: "A high-speed email client dashboard optimized for keyboard shortcuts and inbox zero.",
    domain: "high-speed email software and productivity suites",
    introDetail: "Your split inbox and keyboard shortcut capabilities that help users fly through their messages are incredible.",
    painPoints: [
      "Testing mobile app versions on older iOS operating systems.",
      "Gathering user feedback on email schedule controls.",
      "Outbound outreach to target corporate executive teams."
    ],
    customPainPointFraming: "testing mobile app updates, gathering user schedule feedback, or scaling corporate outbound campaigns"
  },
  {
    name: "Miro",
    category: "Productivity SaaS",
    website: "https://miro.com",
    targetUsers: "Product designers, PMs, and engineering leads",
    linkedin: "https://www.linkedin.com/company/mirohq",
    hiring: "Yes",
    funding: "Series C",
    description: "A visual collaboration platform providing digital whiteboards, mind maps, and sticky notes for remote teams.",
    domain: "visual whiteboarding and team collaboration",
    introDetail: "Your collaborative canvas that lets hundreds of remote participants brainstorm using sticky notes in real-time is excellent.",
    painPoints: [
      "Testing component rendering and canvas dragging speeds on low-performance devices.",
      "Auditing and styling template collections for user setups.",
      "Campus programs to recruit university design ambassadors."
    ],
    customPainPointFraming: "testing canvas rendering performance, auditing design templates, or launching campus ambassador programs"
  },
  {
    name: "Mural",
    category: "Productivity SaaS",
    website: "https://mural.co",
    targetUsers: "Enterprise design squads, workshop facilitators",
    linkedin: "https://www.linkedin.com/company/mural",
    hiring: "Yes",
    funding: "Series C",
    description: "A digital workspace for visual collaboration and facilitation that helps teams brainstorm ideas and run workshops.",
    domain: "digital whiteboarding and remote team alignment",
    introDetail: "I saw how your facilitator controls help team leaders guide participants during online brainstorming sessions.",
    painPoints: [
      "Testing whiteboard item drag-and-drops on tablets.",
      "Cleaning and organizing visual template databases.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing tablet drag-and-drop actions, cleaning template library databases, or building lead outreach databases"
  },
  {
    name: "Asana",
    category: "Productivity SaaS",
    website: "https://asana.com",
    targetUsers: "Project managers, operations teams, and marketing leads",
    linkedin: "https://www.linkedin.com/company/asana",
    hiring: "Yes",
    funding: "IPO",
    description: "A collaborative task and project management platform that tracks team workflows, dependencies, and objectives.",
    domain: "team project and program tracking dashboards",
    introDetail: "Your project timeline view that lets teams map dependencies and adjust deadlines visually is extremely helpful.",
    painPoints: [
      "Testing task status indicator displays on mobile layouts.",
      "Auditing customer dashboard database logs for data import anomalies.",
      "Outbound outreach to connect with mid-market marketing agencies."
    ],
    customPainPointFraming: "testing mobile project dashboards, auditing database import logs, or scaling agency outreach"
  },
  {
    name: "Monday.com",
    category: "Productivity SaaS",
    website: "https://monday.com",
    targetUsers: "Operations leads, team managers, and project leaders",
    linkedin: "https://www.linkedin.com/company/monday.com",
    hiring: "Yes",
    funding: "IPO",
    description: "A customizable work operating system that allows organizations to build custom workflow and project management apps.",
    domain: "workflow and project management customization",
    introDetail: "I saw how your customizable column types and automated workflows let teams adapt dashboards for any project.",
    painPoints: [
      "Testing dashboard loading speeds under complex formula columns.",
      "Auditing and tagging custom integration layouts.",
      "Running user research interviews to find setup hurdles."
    ],
    customPainPointFraming: "testing custom formula widgets, auditing integration layouts, or conducting setup UX surveys"
  },
  {
    name: "Fellow.app",
    category: "Productivity SaaS",
    website: "https://fellow.app",
    targetUsers: "Managers, team leaders, and HR coordinators",
    linkedin: "https://www.linkedin.com/company/fellowapp",
    hiring: "Yes",
    funding: "Series A",
    description: "A meeting productivity software platform for collaborative agendas, action items, and feedback loops.",
    domain: "meeting agendas and manager action items",
    introDetail: "Your integration that links meeting notes with calendar invites to keep teams aligned is highly efficient.",
    painPoints: [
      "Testing editor checklist elements for browser bugs.",
      "Cleaning database tables of client meeting template files.",
      "Outbound prospecting to reach startup founders."
    ],
    customPainPointFraming: "testing editor note widgets, cleaning template databases, or driving founder outbound prospecting"
  },
  {
    name: "Grain",
    category: "Productivity SaaS",
    website: "https://grain.com",
    targetUsers: "Product managers, researchers, and sales teams",
    linkedin: "https://www.linkedin.com/company/grainvideo",
    hiring: "Yes",
    funding: "Series A",
    description: "A meeting recording and clip sharing tool that records video calls and extracts key transcript highlights.",
    domain: "meeting recordings and customer insight clips",
    introDetail: "Your ability to clip video transcripts and share customer quotes directly with product teams is incredibly practical.",
    painPoints: [
      "Testing video clipper UI tools on mobile screen layouts.",
      "Auditing auto-transcripts for spelling mistakes on technical terms.",
      "Outbound marketing to acquire user research teams."
    ],
    customPainPointFraming: "testing video clipper mobile views, auditing transcript terminology, or driving researcher outbound leads"
  },

  // ==========================================
  // SALES / CRM TOOLS (76-90)
  // ==========================================
  {
    name: "Folk",
    category: "Sales/CRM tools",
    website: "https://folk.app",
    targetUsers: "Startups, small business owners, and sales teams",
    linkedin: "https://www.linkedin.com/company/folk-hq",
    hiring: "Yes",
    funding: "Series A",
    description: "A modern, collaborative CRM database that helps teams customize contact pipelines and send mail merges.",
    domain: "collaborative CRM and contact management",
    introDetail: "I love how your browser extension lets users import contacts directly from LinkedIn profiles in one click.",
    painPoints: [
      "Testing email sync integrations for rate limit errors.",
      "Data cleaning and deduplicating of contact export sheets.",
      "Outbound marketing to acquire high-growth startups."
    ],
    customPainPointFraming: "testing email integration syncs, deduplicating contact databases, or scaling startup outbound outreach"
  },
  {
    name: "Attio",
    category: "Sales/CRM tools",
    website: "https://attio.com",
    targetUsers: "Sales ops, growth teams, and startup founders",
    linkedin: "https://www.linkedin.com/company/attio",
    hiring: "Yes",
    funding: "Series A",
    description: "A fully customizable modern CRM platform that updates contact data and tracks pipelines automatically.",
    domain: "customizable CRM and sales data pipelines",
    introDetail: "Your database schema flexibility and real-time activity histories for team collaboration are highly advanced.",
    painPoints: [
      "Testing custom field update modules for database sync lags.",
      "Cleaning and enriching startup directory data assets.",
      "Running user onboarding research to map dashboard configuration drops."
    ],
    customPainPointFraming: "testing CRM field update modules, cleaning directory database lists, or conducting user onboarding surveys"
  },
  {
    name: "Clay",
    category: "Sales/CRM tools",
    website: "https://clay.com",
    targetUsers: "Growth marketers, sales development leads, and founders",
    linkedin: "https://www.linkedin.com/company/clayrun",
    hiring: "Yes",
    funding: "Series B",
    description: "An outbound data enrichment platform that merges multiple databases to compile personalized leads list.",
    domain: "data enrichment and outbound lead databases",
    introDetail: "I noticed how your integration table connects data points from diverse APIs (LinkedIn, GitHub) into one database.",
    painPoints: [
      "Testing api handshake rate limits under concurrent high data volumes.",
      "Cleaning and structuring spreadsheet datasets for customer imports.",
      "Writing step-by-step developer guides for writing custom scripts."
    ],
    customPainPointFraming: "testing API integration limits, cleaning import spreadsheet datasets, or writing script setup guides"
  },
  {
    name: "Apollo.io",
    category: "Sales/CRM tools",
    website: "https://apollo.io",
    targetUsers: "Sales reps, founders, and recruiters",
    linkedin: "https://www.linkedin.com/company/apolloio",
    hiring: "Yes",
    funding: "Series D",
    description: "A sales intelligence platform providing database contacts, email outreach sequences, and lead enrichment.",
    domain: "sales intelligence and outbound outreach platforms",
    introDetail: "Your contact database and email tracking metrics that help outbound teams scale campaigns are highly effective.",
    painPoints: [
      "Testing browser extensions for rendering issues on updated sites.",
      "Auditing contact databases to clean up inactive email records.",
      "Running user research interviews with sales team users."
    ],
    customPainPointFraming: "testing browser extensions, cleaning contact databases, or conducting sales UX interviews"
  },
  {
    name: "Close",
    category: "Sales/CRM tools",
    website: "https://close.com",
    targetUsers: "SMB sales leads, startup founders, and account executives",
    linkedin: "https://www.linkedin.com/company/closecrm",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "An inside sales CRM built with built-in calling, SMS messaging, and email outreach sequencing tools.",
    domain: "inside sales pipeline and outreach CRMs",
    introDetail: "I really like how your dialer and email sequences allow sales reps to run campaigns from a single dashboard.",
    painPoints: [
      "Testing desktop calling widgets for audio connection bugs.",
      "Auditing customer database profiles to clean up phone record logs.",
      "Outbound outreach to target early-stage startup leads."
    ],
    customPainPointFraming: "testing call widget audio actions, auditing phone log databases, or scaling startup outbound outreach"
  },
  {
    name: "Pipedrive",
    category: "Sales/CRM tools",
    website: "https://pipedrive.com",
    targetUsers: "Small business sales teams, sales agents",
    linkedin: "https://www.linkedin.com/company/pipedrive",
    hiring: "Yes",
    funding: "Series C",
    description: "A web-based pipeline CRM that visualizes sales deals, tasks, and follow-up activities.",
    domain: "sales pipeline tracking and task management",
    introDetail: "Your drag-and-drop deal board that makes tracking sales pipeline stages completely visual is very intuitive.",
    painPoints: [
      "Testing pipeline deal-dragging animations on mobile browser views.",
      "Cleaning database tables of customer migration data sheets.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing mobile dashboard animations, cleaning migration database tables, or building outbound lead lists"
  },
  {
    name: "Salesloft",
    category: "Sales/CRM tools",
    website: "https://salesloft.com",
    targetUsers: "Enterprise sales reps, sales ops leaders",
    linkedin: "https://www.linkedin.com/company/salesloft",
    hiring: "Yes",
    funding: "Series E",
    description: "An enterprise sales engagement platform that schedules outbound email, phone, and social actions.",
    domain: "sales engagement and outreach pipelines",
    introDetail: "I saw how your sales playbooks guide reps step-by-step through email, phone, and LinkedIn outreach actions.",
    painPoints: [
      "Testing email client integrations for inbox connection sync bugs.",
      "Auditing contact lists to clean up inactive lead profiles.",
      "Running user research studies with enterprise sales ops managers."
    ],
    customPainPointFraming: "testing email integration syncs, cleaning contact database profiles, or running sales ops surveys"
  },
  {
    name: "Outreach",
    category: "Sales/CRM tools",
    website: "https://outreach.io",
    targetUsers: "Enterprise sales development teams, sales leaders",
    linkedin: "https://www.linkedin.com/company/outreach-io",
    hiring: "Yes",
    funding: "Series G",
    description: "A sales execution platform providing automated sequencing, pipeline management, and conversation insights.",
    domain: "sales execution and pipeline tracking software",
    introDetail: "Your pipeline dashboard that forecasts sales closures using machine learning metrics is extremely powerful.",
    painPoints: [
      "Testing CRM data synchronization APIs for timeout errors.",
      "Auditing call recording database tables for audio playback issues.",
      "Outbound campaigns to target mid-market sales executives."
    ],
    customPainPointFraming: "testing CRM sync API handshakes, auditing recording databases, or running corporate outreach campaigns"
  },
  {
    name: "Gong",
    category: "Sales/CRM tools",
    website: "https://gong.io",
    targetUsers: "Sales managers, account executives, and revenue officers",
    linkedin: "https://www.linkedin.com/company/gong-io",
    hiring: "Yes",
    funding: "Series F",
    description: "A revenue intelligence platform that records sales calls to analyze speaker talk ratios and deal progress.",
    domain: "revenue intelligence and sales conversational analytics",
    introDetail: "Your speaker call analysis that identifies which talk tracks and competitor mentions drive sales closures is incredible.",
    painPoints: [
      "Testing transcription parser engines for lag under heavy call queues.",
      "Structuring and tagging call transcript datasets to refine analytics.",
      "Outbound campaigns to target enterprise sales organizations."
    ],
    customPainPointFraming: "testing transcription parser queues, structuring transcript databases, or driving enterprise sales leads"
  },
  {
    name: "Clari",
    category: "Sales/CRM tools",
    website: "https://clari.com",
    targetUsers: "Revenue operations managers, CFOs, and sales leaders",
    linkedin: "https://www.linkedin.com/company/clari",
    hiring: "Yes",
    funding: "Series F",
    description: "A revenue collaboration and forecasting platform that aggregates CRM and sales activity data.",
    domain: "revenue operations and pipeline forecasting",
    introDetail: "I saw how your platform tracks all customer interactions to predict quarterly sales performance accurately.",
    painPoints: [
      "Testing pipeline forecasting charts for mobile browser responsiveness.",
      "Cleaning historical sales database files for model training.",
      "Outbound outreach to connect with enterprise RevOps leads."
    ],
    customPainPointFraming: "testing mobile forecasting charts, cleaning historical sales files, or scaling enterprise outbound outreach"
  },
  {
    name: "Scratchpad",
    category: "Sales/CRM tools",
    website: "https://scratchpad.com",
    targetUsers: "Account executives, sales development reps",
    linkedin: "https://www.linkedin.com/company/scratchpad",
    hiring: "Yes",
    funding: "Series B",
    description: "A workspace for Salesforce users that syncs notes, tasks, and deal fields instantly without slow loading page steps.",
    domain: "Salesforce workspace and productivity interfaces",
    introDetail: "I noticed how your note-taking editor syncs updates to Salesforce fields instantly, saving reps hours of admin time.",
    painPoints: [
      "Testing note editor text sync logic on offline browser states.",
      "Gathering customer feedback on layout panel configuration drops.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing offline editor syncs, conducting layout UX research, or building lead outreach databases"
  },
  {
    name: "Lusha",
    category: "Sales/CRM tools",
    website: "https://lusha.com",
    targetUsers: "Sales development reps, sourcers, and recruiters",
    linkedin: "https://www.linkedin.com/company/lusha",
    hiring: "Yes",
    funding: "Series B",
    description: "A B2B lead enrichment tool providing contact details and company phone numbers via a browser extension.",
    domain: "B2B contact details and data enrichment APIs",
    introDetail: "Your browser extension that locates direct dial numbers and business emails on LinkedIn profiles is very handy.",
    painPoints: [
      "Testing browser extension UI overlays on updated browser builds.",
      "Cleaning contact number databases to remove inactive listings.",
      "Sourcing sales leads and executing outbound campaigns."
    ],
    customPainPointFraming: "testing browser extensions, cleaning phone record databases, or scaling outbound outreach campaigns"
  },
  {
    name: "Hunter.io",
    category: "Sales/CRM tools",
    website: "https://hunter.io",
    targetUsers: "Marketers, sales reps, and outreach professionals",
    linkedin: "https://www.linkedin.com/company/hunter.io",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A web scraper tool that locates professional email addresses by domain name and verifies deliverability.",
    domain: "email domain search and address verification",
    introDetail: "I love how your domain search compiles pattern structures and verifier logs to locate company email formats.",
    painPoints: [
      "Testing email verifier script responses against bounce-catch mail systems.",
      "Cleaning customer domain database files for verification updates.",
      "Outbound campaigns to target marketing and sales agency heads."
    ],
    customPainPointFraming: "testing email verifier scripts, cleaning domain databases, or scaling outbound agency marketing"
  },
  {
    name: "Cognism",
    category: "Sales/CRM tools",
    website: "https://cognism.com",
    targetUsers: "Enterprise sales development reps, marketing leads",
    linkedin: "https://www.linkedin.com/company/cognism",
    hiring: "Yes",
    funding: "Series C",
    description: "A compliant B2B intelligence platform providing mobile contact phone numbers and email addresses globally.",
    domain: "compliant B2B intelligence and mobile contact data",
    introDetail: "Your focus on GDPR compliance and verified mobile contact details for outbound calling is highly valuable.",
    painPoints: [
      "Testing mobile contact details verifier scripts for loading speeds.",
      "Auditing contact phone databases to remove inactive entries.",
      "Outbound outreach to target technology sales leaders."
    ],
    customPainPointFraming: "testing contact verifier APIs, auditing telephone number databases, or scaling sales outbound outreach"
  },
  {
    name: "Lemlist",
    category: "Sales/CRM tools",
    website: "https://lemlist.com",
    targetUsers: "Growth marketers, sales reps, and agency teams",
    linkedin: "https://www.linkedin.com/company/lemlist",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A cold outreach automation platform that allows users to send emails with personalized images and videos.",
    domain: "cold email outreach and lead personalization",
    introDetail: "Your automated email image overlays and custom landing pages that make cold pitches feel highly customized are great.",
    painPoints: [
      "Testing image overlay generation engines for loading speed bugs.",
      "Cleaning and enriching prospecting database files for deliverability.",
      "Campus programs to recruit digital marketing student ambassadors."
    ],
    customPainPointFraming: "testing image generator engines, cleaning email database files, or setting up campus ambassador programs"
  },

  // ==========================================
  // ANALYTICS PLATFORMS (91-100)
  // ==========================================
  {
    name: "Mixpanel",
    category: "Analytics platforms",
    website: "https://mixpanel.com",
    targetUsers: "Product managers, growth marketers, and analytics teams",
    linkedin: "https://www.linkedin.com/company/mixpanel",
    hiring: "Yes",
    funding: "Series C",
    description: "A product analytics platform that tracks user events, conversion funnels, and retention rates in real time.",
    domain: "product event analytics and retention tracking",
    introDetail: "Your interactive funnel builders and cohort tracking tools that map out user retention paths are extremely useful.",
    painPoints: [
      "Testing SDK library imports on older browser builds.",
      "Auditing database export logs to identify tracking discrepancies.",
      "Outbound outreach to acquire software development agencies."
    ],
    customPainPointFraming: "testing analytics SDK versions, auditing data export logs, or driving agency outbound outreach"
  },
  {
    name: "Amplitude",
    category: "Analytics platforms",
    website: "https://amplitude.com",
    targetUsers: "Product managers, SaaS growth teams, and enterprise leads",
    linkedin: "https://www.linkedin.com/company/amplitude",
    hiring: "Yes",
    funding: "IPO",
    description: "A digital optimization system that helps teams run product experiments and track user behavior pathways.",
    domain: "product optimization and user event analytics",
    introDetail: "I saw how your user behavior pathways help teams discover why users drop off during onboarding flows.",
    painPoints: [
      "Testing data exporter modules for chart loading lags.",
      "Auditing customer dashboard database logs to clean up data anomalies.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing dashboard exporter modules, auditing database log records, or building lead outreach databases"
  },
  {
    name: "Heap",
    category: "Analytics platforms",
    website: "https://heap.io",
    targetUsers: "Product designers, digital marketers, and PMs",
    linkedin: "https://www.linkedin.com/company/heap",
    hiring: "Yes",
    funding: "Acquired (Series D)",
    description: "A digital insights tool that captures user actions (clicks, form fills) on websites automatically without coding.",
    domain: "user autocapture web analytics systems",
    introDetail: "Your autocapture script that tracks click actions automatically without manual tagging saves teams massive tracking setups.",
    painPoints: [
      "Testing autocapture script loaders on mobile web views.",
      "Cleaning database tables of customer session tracking logs.",
      "Outbound outreach to reach growing SaaS startups."
    ],
    customPainPointFraming: "testing autocapture script loaders, cleaning session log databases, or scaling startup outbound outreach"
  },
  {
    name: "Plausible",
    category: "Analytics platforms",
    website: "https://plausible.io",
    targetUsers: "Website owners, indie hackers, and privacy teams",
    linkedin: "https://www.linkedin.com/company/plausible-analytics",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "An open-source, privacy-focused lightweight web analytics tool that does not use cookies.",
    domain: "privacy-compliant web analytics dashboards",
    introDetail: "I really like your lightweight tracking script that measures page views without tracking user personal data.",
    painPoints: [
      "Testing script loading speed under heavy browser caching configurations.",
      "Writing step-by-step developer guides for setting up domain goals.",
      "Outbound outreach to acquire digital design agencies."
    ],
    customPainPointFraming: "testing script loader caching, writing goal tracking guides, or scaling agency outbound outreach"
  },
  {
    name: "Fathom",
    category: "Analytics platforms",
    website: "https://usefathom.com",
    targetUsers: "Content creators, web designers, and business owners",
    linkedin: "https://www.linkedin.com/company/fathom-analytics",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A lightweight, cookie-less privacy-first web analytics platform that complies with GDPR and CCPA.",
    domain: "lightweight privacy web trackers",
    introDetail: "Your simple dashboard interface that details page traffic without cookie consent pop-ups is very clean.",
    painPoints: [
      "Testing dashboard charts for responsiveness on mobile Safari.",
      "Auditing database logs to verify correct script loading stats.",
      "Sourcing marketing leads and building custom outreach databases."
    ],
    customPainPointFraming: "testing mobile dashboard charts, auditing script load logs, or building outbound lead databases"
  },
  {
    name: "Simple Analytics",
    category: "Analytics platforms",
    website: "https://simpleanalytics.com",
    targetUsers: "Product managers, web owners, and SaaS builders",
    linkedin: "https://www.linkedin.com/company/simple-analytics",
    hiring: "Yes",
    funding: "Bootstrapped",
    description: "A privacy-friendly analytics dashboard that tracks page visitors without using cookies or storing IP addresses.",
    domain: "cookie-free website analytics dashboards",
    introDetail: "Your simple dashboard and automated email traffic reports that prioritize privacy are fantastic.",
    painPoints: [
      "Testing layout dashboard graphics for browser bugs.",
      "Writing documentation tutorials on setting up event tracking.",
      "Outbound outreach to target privacy-focused startups."
    ],
    customPainPointFraming: "testing dashboard UI graphics, writing setup tracking documentation, or scaling startup outreach"
  },
  {
    name: "Hotjar",
    category: "Analytics platforms",
    website: "https://hotjar.com",
    targetUsers: "UX designers, product managers, and marketers",
    linkedin: "https://www.linkedin.com/company/hotjar",
    hiring: "Yes",
    funding: "Acquired (Series B)",
    description: "A product experience platform providing visual heatmaps, visitor session recordings, and feedback surveys.",
    domain: "visual heatmaps and visitor session recordings",
    introDetail: "I love how your visual heatmaps show exactly where users click, scroll, and spend time on landing pages.",
    painPoints: [
      "Testing canvas rendering of heatmaps on dynamic web pages.",
      "Auditing and tagging session recordings databases.",
      "Running user research interviews with corporate design leads."
    ],
    customPainPointFraming: "testing canvas heatmap rendering, auditing session record databases, or conducting UX design surveys"
  },
  {
    name: "Smartlook",
    category: "Analytics platforms",
    website: "https://smartlook.com",
    targetUsers: "Mobile developers, UX researchers, and product teams",
    linkedin: "https://www.linkedin.com/company/smartlook",
    hiring: "Yes",
    funding: "Acquired (Series A)",
    description: "A qualitative analytics tool that tracks user sessions and events on both web and mobile app interfaces.",
    domain: "mobile app session recording and funnel tracking",
    introDetail: "Your mobile SDK session recording capabilities that capture user interactions on smartphone layouts are great.",
    painPoints: [
      "Testing mobile SDK integration stability across old Android versions.",
      "Cleaning database tables of customer session tracking records.",
      "Outbound prospecting to acquire mobile app development teams."
    ],
    customPainPointFraming: "testing mobile app SDK builds, cleaning session database logs, or driving mobile dev prospecting"
  },
  {
    name: "HockeyStack",
    category: "Analytics platforms",
    website: "https://hockeystack.com",
    targetUsers: "RevOps managers, growth marketers, and SaaS builders",
    linkedin: "https://www.linkedin.com/company/hockeystack",
    hiring: "Yes",
    funding: "Seed",
    description: "An attribution and analytics platform that connects CRM, marketing, and product data to track customer journeys.",
    domain: "B2B revenue attribution and multi-touch tracking",
    introDetail: "I noticed how you compile customer touchpoints across ads, site visits, and CRM tickets into one unified timeline.",
    painPoints: [
      "Testing API database handshakes for sync lag during peak hours.",
      "Cleaning lead attribution records to ensure zero double-counting.",
      "Outbound outreach to target enterprise RevOps leaders."
    ],
    customPainPointFraming: "testing API database connections, cleaning attribution logs, or scaling enterprise RevOps outreach"
  },
  {
    name: "June.so",
    category: "Analytics platforms",
    website: "https://june.so",
    targetUsers: "SaaS founders, product managers, and developers",
    linkedin: "https://www.linkedin.com/company/juneso",
    hiring: "Yes",
    funding: "Seed",
    description: "A product analytics tool built on Segment that provides ready-made templates for SaaS retention and onboarding.",
    domain: "product analytics dashboards for SaaS",
    introDetail: "Your pre-built reports for SaaS metrics like user activation, retention, and churn are incredibly clean.",
    painPoints: [
      "Testing dashboard template views on mobile safari configurations.",
      "Sourcing customer feedback on dashboard UI setup configurations.",
      "Outbound marketing to acquire early-stage SaaS founders."
    ],
    customPainPointFraming: "testing dashboard template layouts, gathering UI setup feedback, or scaling founder outbound marketing"
  }
];

function generateEmail(startup) {
  const company = startup.name;
  const domain = startup.domain;
  const introDetail = startup.introDetail;
  const customPainPointFraming = startup.customPainPointFraming;

  // Exact email structure requested by user with personalized values
  return `Hi ${company} Team,

I recently came across ${company} and really liked what you're building in the SaaS space, especially around ${domain}. ${introDetail}

As SaaS products scale, the real challenge is not just development — but continuously managing user feedback, onboarding optimization, data workflows, growth experiments, and creative + content execution.

I’m Swatantra Shukla, Founder of NextGenGrowth.

NextGenGrowth is a student-powered execution and creator platform where brands and startups can directly access trained student talent for real, outcome-driven work — all managed through a structured, secure workflow.

We help SaaS teams with:

• Product testing & QA (web apps, SaaS tools, mobile apps)
• User feedback collection & UX research
• Data cleaning, tagging & structuring
• Growth experiments & market research
• Lead generation & outbound support
• Content & creative execution for marketing campaigns
• Community & user acquisition via campus ambassador programs
• Competitor tracking & positioning insights
• Ongoing execution via student creators on real projects

Instead of hiring and managing scattered interns or freelancers, startups can plug into a single structured system where student creators apply, work, submit, and get paid through a secure project flow.

If ${company} is currently focusing on ${customPainPointFraming}, I’d love to explore whether this system can support your team.

Would you be open to a quick 15-minute call this week?

Looking forward to your thoughts.

Best regards,
Swatantra Shukla
Founder, NextGenGrowth
📧 swatantra@nextgengrowth.in
📱 +91 9532792303
🌐 https://nextgengrowth.in
🔗 https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/`;
}

async function run() {
  console.log(`🚀 Processing ${saasStartups.length} B2B SaaS startups...`);
  
  if (saasStartups.length !== 100) {
    console.error(`⚠️ Error: Expected exactly 100 startups, but found ${saasStartups.length}.`);
    process.exit(1);
  }

  const markdownRows = [];
  markdownRows.push(`# 100 B2B SaaS Startups Cold Outreach Copy\n`);
  markdownRows.push(`This document contains 100 real, active B2B SaaS startups globally across 7 categories (Developer Tools, Marketing, HR, AI SaaS, Productivity, Sales/CRM, and Analytics). It includes their website, target users, LinkedIn profile, hiring status, funding stage, what they do, inferred pain points, and a highly personalized cold outreach email using the NextGenGrowth template.\n`);
  markdownRows.push(`---\n`);

  const processedData = saasStartups.map((startup, index) => {
    const email = generateEmail(startup);
    const id = index + 1;

    markdownRows.push(`## ${id}. ${startup.name}`);
    markdownRows.push(`- **Category:** ${startup.category}`);
    markdownRows.push(`- **Website:** ${startup.website}`);
    markdownRows.push(`- **Target Users:** ${startup.targetUsers}`);
    markdownRows.push(`- **Founder/Company LinkedIn:** ${startup.linkedin}`);
    markdownRows.push(`- **Hiring Status:** ${startup.hiring}`);
    markdownRows.push(`- **Funding Stage:** ${startup.funding}`);
    markdownRows.push(`- **What they do:** ${startup.description}`);
    markdownRows.push(`- **Pain Points:**`);
    startup.painPoints.forEach(p => {
      markdownRows.push(`  - ${p}`);
    });
    markdownRows.push(`- **Personalized Email:**\n\`\`\`text\n${email}\n\`\`\`\n`);
    markdownRows.push(`---\n`);

    return {
      id: id,
      company: startup.name,
      category: startup.category,
      website: startup.website,
      targetUsers: startup.targetUsers,
      linkedin: startup.linkedin,
      hiring: startup.hiring,
      funding: startup.funding,
      description: startup.description,
      domain: startup.domain,
      painPoints: startup.painPoints,
      emailBody: email
    };
  });

  // Write MD File in current directory
  const mdPath = path.resolve(__dirname, '100_saas_startups_outreach.md');
  fs.writeFileSync(mdPath, markdownRows.join('\n'), 'utf8');
  console.log(`✅ Markdown file successfully written to: ${mdPath}`);

  // Write JSON backup in current directory
  const jsonPath = path.resolve(__dirname, '100_saas_startups_outreach.json');
  fs.writeFileSync(jsonPath, JSON.stringify(processedData, null, 2), 'utf8');
  console.log(`✅ Backup JSON file successfully written to: ${jsonPath}`);

  // Write CSV File
  const csvPath = path.resolve(__dirname, '100_saas_startups_outreach.csv');
  const headers = [
    'ID', 'Company Name', 'Category', 'Website', 'Target Users', 'Founder/Company LinkedIn',
    'Hiring Status', 'Funding Stage', 'Description', 'Domain', 'Pain Point 1', 'Pain Point 2', 'Pain Point 3', 'Email Body'
  ];
  
  const csvRows = [headers.join(',')];
  processedData.forEach(row => {
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val).trim();
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    const fields = [
      row.id,
      escapeCsv(row.company),
      escapeCsv(row.category),
      escapeCsv(row.website),
      escapeCsv(row.targetUsers),
      escapeCsv(row.linkedin),
      escapeCsv(row.hiring),
      escapeCsv(row.funding),
      escapeCsv(row.description),
      escapeCsv(row.domain),
      escapeCsv(row.painPoints[0] || ''),
      escapeCsv(row.painPoints[1] || ''),
      escapeCsv(row.painPoints[2] || ''),
      escapeCsv(row.emailBody)
    ];
    csvRows.push(fields.join(','));
  });
  fs.writeFileSync(csvPath, csvRows.join('\n') + '\n', 'utf8');
  console.log(`✅ CSV file successfully written to: ${csvPath}`);

  // Write Excel File
  const ExcelJS = require('exceljs');
  const excelPath = path.resolve(__dirname, '100_saas_startups_outreach.xlsx');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('SaaS Outreach');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 6 },
    { header: 'Company Name', key: 'company', width: 20 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Website', key: 'website', width: 28 },
    { header: 'Target Users', key: 'targetUsers', width: 35 },
    { header: 'Founder/Company LinkedIn', key: 'linkedin', width: 35 },
    { header: 'Hiring Status', key: 'hiring', width: 12 },
    { header: 'Funding Stage', key: 'funding', width: 15 },
    { header: 'Description', key: 'description', width: 45 },
    { header: 'Domain', key: 'domain', width: 30 },
    { header: 'Pain Point 1', key: 'painPoint1', width: 40 },
    { header: 'Pain Point 2', key: 'painPoint2', width: 40 },
    { header: 'Pain Point 3', key: 'painPoint3', width: 40 },
    { header: 'Email Body', key: 'emailBody', width: 60 }
  ];

  processedData.forEach(row => {
    sheet.addRow({
      id: row.id,
      company: row.company,
      category: row.category,
      website: row.website,
      targetUsers: row.targetUsers,
      linkedin: row.linkedin,
      hiring: row.hiring,
      funding: row.funding,
      description: row.description,
      domain: row.domain,
      painPoint1: row.painPoints[0] || '',
      painPoint2: row.painPoints[1] || '',
      painPoint3: row.painPoints[2] || '',
      emailBody: row.emailBody
    });
  });

  // Apply nice formatting
  sheet.getRow(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } }; // Dark blue header
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'left' };
  
  sheet.views = [{ state: 'frozen', ySplit: 1 }]; // Freeze top header row

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.height = rowNumber === 1 ? 26 : 22;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
      };
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'top', wrapText: true };
      }
    });
  });

  await workbook.xlsx.writeFile(excelPath);
  console.log(`✅ Excel file successfully written to: ${excelPath}`);
  
  console.log('=======================================');
  console.log('🏁 Sourcing and outreach copy generation completed successfully!');
  console.log('=======================================');
}

run().catch(err => {
  console.error('❌ Critical error during generation:', err);
});
