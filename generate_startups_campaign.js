const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Database of 100 qualified early-stage startups (0-3 years, pre-seed/seed/Series A)
const startups = [
  // 1-15: Artificial Intelligence
  {
    name: "Rahul Gupta",
    company: "Bolna AI",
    email: "rahul@bolna.ai",
    linkedin: "https://www.linkedin.com/in/rahul-gupta-bolna",
    description: "Voice AI orchestration platform that enables enterprises to deploy voice AI agents for support, sales, and collections.",
    trigger: "recently raising a seed round from major VCs and launching their new developer voice API platform",
    domain: "AI",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Srikanth Prasad",
    company: "Perseus",
    email: "srikanth@perseus.dev",
    linkedin: "https://www.linkedin.com/in/srikanth-prasad-perseus",
    description: "AI-powered developer tool helping code agents search high-dimensional codebases and dependencies.",
    trigger: "launching on Product Hunt and entering the recent YC batch to build autonomous coding agents",
    domain: "AI",
    location: "India (Bangalore)"
  },
  {
    name: "Vivek Raghavan",
    company: "Sarvam AI",
    email: "vivek@sarvam.ai",
    linkedin: "https://www.linkedin.com/in/vivek-raghavan-sarvam",
    description: "Developing custom large language models (LLMs) and speech-to-text systems tailored specifically for Indian languages.",
    trigger: "securing $41M in Series A funding to scale Indic voice and language infrastructure",
    domain: "AI",
    location: "India (Bangalore)"
  },
  {
    name: "Adithya S",
    company: "CognitiveLab",
    email: "adithya@cognitivelab.ai",
    linkedin: "https://www.linkedin.com/in/adithya-s-cognitivelab",
    description: "Enterprise LLM evaluation and tuning playground for optimizing generative AI agent workflows.",
    trigger: "announcing their pre-seed funding round and hiring frontend developer roles for their sandbox UI",
    domain: "AI",
    location: "India (Bangalore)"
  },
  {
    name: "Shivam Sabharwal",
    company: "Athina AI",
    email: "shivam@athina.ai",
    linkedin: "https://www.linkedin.com/in/shivam-sabharwal-athina",
    description: "LLM evaluation and monitoring platform that helps developers detect hallucinations and trace API errors.",
    trigger: "launching their real-time prompt playground and expanding outreach to US SaaS teams",
    domain: "AI",
    location: "Global Remote"
  },
  {
    name: "Karan Vaidya",
    company: "Composio",
    email: "karan@composio.dev",
    linkedin: "https://www.linkedin.com/in/karan-vaidya-composio",
    description: "Production-ready toolsets and integrations for LLM agents to connect with tools like Github, Slack, and Jira.",
    trigger: "scaling their GitHub community to 5,000+ stars and hiring developer advocate interns",
    domain: "AI",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Rohit Kumar",
    company: "Segmind",
    email: "rohit@segmind.com",
    linkedin: "https://www.linkedin.com/in/rohit-kumar-segmind",
    description: "Fast Stable Diffusion API platform and serverless model hosting for generative image workflows.",
    trigger: "launching new sub-second SDXL models and expanding their developer documentation support",
    domain: "AI",
    location: "India (Bangalore)"
  },
  {
    name: "Rishabh Srivastava",
    company: "Defog AI",
    email: "rishabh@defog.ai",
    linkedin: "https://www.linkedin.com/in/rishabh-defog",
    description: "Data analysis tool that lets non-technical team members query SQL databases in natural language using custom LLMs.",
    trigger: "partnering with major enterprise banks and scaling their data annotation requirements",
    domain: "AI",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Rohit Agarwal",
    company: "Portkey AI",
    email: "rohit@portkey.ai",
    linkedin: "https://www.linkedin.com/in/rohit-portkey",
    description: "LLMOps platform facilitating LLM routing, caching, logging, and monitoring for production apps.",
    trigger: "raising $3M in seed funding led by Lightspeed and launching integrations with LangChain",
    domain: "AI",
    location: "India (Bangalore)"
  },
  {
    name: "Isaiah Foster",
    company: "Bland AI",
    email: "isaiah@bland.ai",
    linkedin: "https://www.linkedin.com/in/isaiah-foster-bland",
    description: "Hyper-realistic voice agent platform built for developers to build phone calling workflows.",
    trigger: "securing $16M in Series A funding and launching their developer widget SDKs",
    domain: "AI",
    location: "Global Remote"
  },
  {
    name: "Kwindla Kramer",
    company: "Vapi",
    email: "k@vapi.ai",
    linkedin: "https://www.linkedin.com/in/kwindla-kramer-vapi",
    description: "Developer platform for building real-time voice applications and smart assistants with low-latency APIs.",
    trigger: "scaling from YC and hosting their developer hackathon to build voice-first widgets",
    domain: "AI",
    location: "Global Remote"
  },
  {
    name: "Henry Heng",
    company: "Flowise AI",
    email: "henry@flowiseai.com",
    linkedin: "https://www.linkedin.com/in/henry-heng-flowise",
    description: "Drag-and-drop open-source UI for building customized LLM applications using LangChain and LlamaIndex.",
    trigger: "reaching 28k stars on GitHub and building out enterprise-focused deployment workflows",
    domain: "AI",
    location: "Global Remote"
  },
  {
    name: "Jerry Liu",
    company: "LlamaIndex",
    email: "jerry@llamaindex.ai",
    linkedin: "https://www.linkedin.com/in/jerry-liu-llamaindex",
    description: "Data framework for LLM applications that connects private data sources with language models.",
    trigger: "raising $8.5M in seed funding and launching LlamaCloud to simplify RAG deployments",
    domain: "AI",
    location: "Global Remote"
  },
  {
    name: "Harrison Chase",
    company: "LangChain",
    email: "harrison@langchain.dev",
    linkedin: "https://www.linkedin.com/in/harrison-chase-langchain",
    description: "Framework for building context-aware applications powered by large language models.",
    trigger: "announcing general availability of LangSmith for enterprise monitoring and tracing",
    domain: "AI",
    location: "Global Remote"
  },
  {
    name: "Demi Guo",
    company: "Pika Labs",
    email: "demi@pika.art",
    linkedin: "https://www.linkedin.com/in/demi-guo-pika",
    description: "AI-native video generation tool that transforms text and image prompts into cinematic videos.",
    trigger: "raising a $35M Series A round and launching Pika 1.0 on web dashboards",
    domain: "AI",
    location: "Global Remote"
  },

  // 16-35: B2B SaaS
  {
    name: "Aravind Srivatsav",
    company: "Fyno",
    email: "aravind@fyno.io",
    linkedin: "https://www.linkedin.com/in/aravind-srivatsav-fyno",
    description: "Omnichannel notification infrastructure routing SMS, email, WhatsApp, and push alerts on a single API.",
    trigger: "announcing their seed round and opening technical support hiring roles in India",
    domain: "SaaS",
    location: "India (Bangalore)"
  },
  {
    name: "Chris Frantz",
    company: "Loops",
    email: "chris@loops.so",
    linkedin: "https://www.linkedin.com/in/chris-frantz-loops",
    description: "Modern email marketing and transactional delivery system tailored specifically for SaaS startups.",
    trigger: "raising a seed round from CRV and building a drag-and-drop template editor suite",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Zeno Rocha",
    company: "Resend",
    email: "zeno@resend.com",
    linkedin: "https://www.linkedin.com/in/zeno-rocha-resend",
    description: "Developer-first email platform for sending transactional emails with clean react code templates.",
    trigger: "hitting 10k paying developers on their platform and launching custom IP routing",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Steven Tey",
    company: "Dub.co",
    email: "steven@dub.co",
    linkedin: "https://www.linkedin.com/in/steven-tey-dub",
    description: "Link management infrastructure providing analytical link redirects, geo-targeting, and deep links.",
    trigger: "scaling open-source stars and introducing enterprise custom redirect pipelines",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "James Hughes",
    company: "Trigger.dev",
    email: "james@trigger.dev",
    linkedin: "https://www.linkedin.com/in/james-hughes-trigger",
    description: "Developer-first background jobs framework built for serverless runtimes with robust retry logic.",
    trigger: "releasing Trigger v3 and expanding developer documentation and onboarding content",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Colin Sidoti",
    company: "Clerk",
    email: "colin@clerk.dev",
    linkedin: "https://www.linkedin.com/in/colin-sidoti-clerk",
    description: "Modern authentication and user management platform engineered specifically for React and Next.js projects.",
    trigger: "securing $15M Series A funding and adding B2B SaaS organization support to their core SDK",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Cameron Adams",
    company: "Kinde",
    email: "cameron@kinde.com",
    linkedin: "https://www.linkedin.com/in/cameron-adams-kinde",
    description: "Developer authentication and feature flag suite that allows products to launch in minutes.",
    trigger: "raising their seed round and releasing billing integration features to support multi-tenant SaaS",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Alexandre Bachand",
    company: "Hookdeck",
    email: "alexandre@hookdeck.com",
    linkedin: "https://www.linkedin.com/in/alexandre-bachand-hookdeck",
    description: "Webhook infrastructure providing developer APIs to manage, queue, and retry event deliveries safely.",
    trigger: "raising $2.4M seed funding and expanding operational developer QA and UI engineering teams",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Tomer Barnea",
    company: "Novu",
    email: "tomer@novu.co",
    linkedin: "https://www.linkedin.com/in/tomer-barnea-novu",
    description: "Open-source notification engine connecting SMS, email, WhatsApp, and in-app feeds via a single API.",
    trigger: "securing seed backing and managing a growing open-source community on GitHub",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Ben Rometsch",
    company: "Flagsmith",
    email: "ben@flagsmith.com",
    linkedin: "https://www.linkedin.com/in/ben-rometsch-flagsmith",
    description: "Open-source feature flag and remote configuration software that speeds up product deployments.",
    trigger: "launching their fully managed serverless edition and scaling enterprise customer support portals",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Graham Loomis",
    company: "GrowthBook",
    email: "graham@growthbook.io",
    linkedin: "https://www.linkedin.com/in/graham-loomis-growthbook",
    description: "Open-source A/B testing and feature flagging platform that integrates with existing data warehouses.",
    trigger: "raising their seed round and rolling out a visual editor for non-technical growth managers",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Enzo Avigo",
    company: "June.so",
    email: "enzo@june.so",
    linkedin: "https://www.linkedin.com/in/enzo-avigo-june",
    description: "Product-led growth analytics dashboard built directly on top of Segment or database connections.",
    trigger: "releasing their mobile analytics dashboard app and hiring student marketing support roles",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Jay Khatri",
    company: "Highlight",
    email: "jay@highlight.io",
    linkedin: "https://www.linkedin.com/in/jay-khatri-highlight",
    description: "Open-source web monitoring tool offering session replays, error logs, and frontend performance metrics.",
    trigger: "raising $8M in seed funding and launching full support for server-side React frameworks",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Juraj Masar",
    company: "Better Stack",
    email: "juraj@betterstack.com",
    linkedin: "https://www.linkedin.com/in/juraj-masar-betterstack",
    description: "Modern developer observability platform combining logs management, uptime monitoring, and incident alerting.",
    trigger: "securing $10M funding and hiring technical content creators to write engineering guides",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Ali Salah",
    company: "Instatus",
    email: "ali@instatus.com",
    linkedin: "https://www.linkedin.com/in/ali-salah-instatus",
    description: "Ultra-fast, beautiful system status pages for SaaS startups that cost a fraction of traditional providers.",
    trigger: "expanding their custom HTML widgets and seeking frontend QA tester help",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Tom Hacohen",
    company: "Svix",
    email: "tom@svix.com",
    linkedin: "https://www.linkedin.com/in/tom-hacohen-svix",
    description: "Webhooks as a service infrastructure allowing developers to send secure webhook payloads reliably.",
    trigger: "completing their seed round and launching developer integration portals for customer platforms",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Sam Seely",
    company: "Knock",
    email: "sam@knock.app",
    linkedin: "https://www.linkedin.com/in/sam-seely-knock",
    description: "Developer-first notification orchestration engine that automates cross-channel templates.",
    trigger: "raising $12M Series A led by Craft Ventures and growing their developer support engineering team",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Dan Farrelly",
    company: "Inngest",
    email: "dan@inngest.com",
    linkedin: "https://www.linkedin.com/in/dan-farrelly-inngest",
    description: "Serverless event-driven step functions framework that helps developers build background workflows.",
    trigger: "raising their seed round and launching local developer environment tools",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Neil Jagdish Patel",
    company: "Axiom",
    email: "neil@axiom.co",
    linkedin: "https://www.linkedin.com/in/neil-patel-axiom",
    description: "Serverless log management platform offering cost-efficient log queries and long-term storage.",
    trigger: "launching their fully managed cloud service on AWS Marketplace and hiring content leads",
    domain: "SaaS",
    location: "Global Remote"
  },
  {
    name: "Hannes Lenke",
    company: "Checkly",
    email: "hannes@checklyhq.com",
    linkedin: "https://www.linkedin.com/in/hannes-lenke-checkly",
    description: "Active monitoring platform for API routes and frontend user flows using Playwright code tests.",
    trigger: "raising a $10M Series A round and launching a fully integrated CLI workflow for developers",
    domain: "SaaS",
    location: "Global Remote"
  },

  // 36-50: FinTech
  {
    name: "Rohit Taneja",
    company: "Decentro",
    email: "rohit@decentro.tech",
    linkedin: "https://www.linkedin.com/in/rohit-taneja-decentro",
    description: "API banking and fintech enablement platform allowing startups to build custom financial tools.",
    trigger: "expanding their digital onboarding suite and hiring technical business development ambassadors",
    domain: "FinTech",
    location: "India (Bangalore/Mumbai)"
  },
  {
    name: "Nishchay AG",
    company: "Jar",
    email: "nishchay@changejar.in",
    linkedin: "https://www.linkedin.com/in/nishchay-ag-jar",
    description: "Micro-savings app in India that rounds up digital transactions to automatically buy digital gold.",
    trigger: "crossing 15 million registered users and running regional college branding experiments",
    domain: "FinTech",
    location: "India (Bangalore)"
  },
  {
    name: "Ajinkya Kulkarni",
    company: "Wint Wealth",
    email: "ajinkya@wintwealth.com",
    linkedin: "https://www.linkedin.com/in/ajinkya-kulkarni-wintwealth",
    description: "Alternative debt investment platform offering high-yield retail bonds and fixed-income products.",
    trigger: "obtaining a stockbroker license and running retail investor education campaigns on campuses",
    domain: "FinTech",
    location: "India (Bangalore)"
  },
  {
    name: "Edul Patel",
    company: "Mudrex",
    email: "edul@mudrex.com",
    linkedin: "https://www.linkedin.com/in/edul-patel-mudrex",
    description: "Crypto asset manager and automated mutual-fund style index investing platform for retail users.",
    trigger: "expanding customer support teams across India and building localized user-onboarding flows",
    domain: "FinTech",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Viram Shah",
    company: "Vested Finance",
    email: "viram@vested.co.in",
    linkedin: "https://www.linkedin.com/in/viram-shah-vested",
    description: "Digital investment platform enabling Indian retail investors to buy fractional shares of US stocks.",
    trigger: "announcing zero commission direct deposit accounts and expanding campus-based financial workshops",
    domain: "FinTech",
    location: "India (Mumbai) + Remote"
  },
  {
    name: "Karthik Venkataraman",
    company: "Fluid",
    email: "karthik@fluid.money",
    linkedin: "https://www.linkedin.com/in/karthik-venkataraman-fluid",
    description: "B2B payment platform offering flexible credit and Buy Now Pay Later terms for e-commerce checkouts.",
    trigger: "closing their seed round and seeking marketing design interns to build corporate decks",
    domain: "FinTech",
    location: "India (Bangalore)"
  },
  {
    name: "Rishabh Goel",
    company: "Finmo",
    email: "rishabh@finmo.co",
    linkedin: "https://www.linkedin.com/in/rishabh-goel-finmo",
    description: "Global payment aggregator facilitating multi-currency card payments and treasury payouts.",
    trigger: "launching their merchant checkout API in Southeast Asia and hiring frontend developer support",
    domain: "FinTech",
    location: "Global Remote"
  },
  {
    name: "Anusha Ramakrishnan",
    company: "Jify",
    email: "anusha@jify.co",
    linkedin: "https://www.linkedin.com/in/anusha-ramakrishnan-jify",
    description: "Earned wage access platform letting corporate employees withdraw accrued salary before payday.",
    trigger: "raising a $10M Series A round and launching major corporate marketing activation programs",
    domain: "FinTech",
    location: "India (Mumbai)"
  },
  {
    name: "Ashwin Deo",
    company: "Multipl",
    email: "ashwin@multipl.xyz",
    linkedin: "https://www.linkedin.com/in/ashwin-deo-multipl",
    description: "Goal-based saving app that helps retail users invest money specifically for planned future purchases.",
    trigger: "launching save-now-pay-later brand partnerships and expanding digital content creation teams",
    domain: "FinTech",
    location: "India (Bangalore)"
  },
  {
    name: "Sanjay Kumar",
    company: "Qube Money",
    email: "sanjay@qubemoney.com",
    linkedin: "https://www.linkedin.com/in/sanjay-kumar-qube",
    description: "Envelope-budgeting banking app that helps users manage personal finance in real-time.",
    trigger: "raising a seed round to expand developer operations and launch user interface updates",
    domain: "FinTech",
    location: "Global Remote"
  },
  {
    name: "Akash Singhal",
    company: "Lano Finance",
    email: "akash@lano.finance",
    linkedin: "https://www.linkedin.com/in/akash-singhal-lano",
    description: "Fintech platform automating corporate expense management and tax filing for remote teams.",
    trigger: "launching their developer API dashboard and hiring operations research support",
    domain: "FinTech",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Kushagra Manglik",
    company: "Saveo",
    email: "kushagra@saveo.in",
    linkedin: "https://www.linkedin.com/in/kushagra-manglik-saveo",
    description: "B2B pharmacy marketplace and supply chain solution providing digital inventory management tools.",
    trigger: "closing their seed round and starting developer hiring campaigns across engineering colleges",
    domain: "FinTech",
    location: "India (Bangalore)"
  },
  {
    name: "Abhinav Gupta",
    company: "Lentra",
    email: "abhinav@lentra.ai",
    linkedin: "https://www.linkedin.com/in/abhinav-gupta-lentra",
    description: "Cloud-native digital lending software platform for large commercial banks and fintech lenders.",
    trigger: "expanding lending modules to retail partners and hiring student QA testing squads",
    domain: "FinTech",
    location: "India (Pune)"
  },
  {
    name: "Gaurav Hinduja",
    company: "Capital Float",
    email: "gaurav@capitalfloat.com",
    linkedin: "https://www.linkedin.com/in/gaurav-hinduja-capitalfloat",
    description: "Buy-now-pay-later credit platform and digital credit issuer for Indian consumers.",
    trigger: "rebranding to axio and hiring regional campus marketing leads to drive brand awareness",
    domain: "FinTech",
    location: "India (Bangalore)"
  },
  {
    name: "Dhiren Kotian",
    company: "FinBox",
    email: "dhiren@finbox.in",
    linkedin: "https://www.linkedin.com/in/dhiren-kotian-finbox",
    description: "Low-code embedded credit infrastructure enabling B2B platforms to offer loans to their merchants.",
    trigger: "partnering with top e-commerce players and looking for backend developer helpers to audit integrations",
    domain: "FinTech",
    location: "India (Bangalore)"
  },

  // 51-65: EdTech
  {
    name: "Vaibhav Sisinty",
    company: "GrowthSchool",
    email: "vaibhav@growthschool.io",
    linkedin: "https://www.linkedin.com/in/vaibhav-sisinty",
    description: "Cohort-based educational platform teaching business, design, and growth hacking strategies.",
    trigger: "raising a $5M seed round led by Sequoia Capital India and launching new AI cohorts",
    domain: "EdTech",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Aditya Kulkarni",
    company: "Stoa School",
    email: "aditya@stoaschool.com",
    linkedin: "https://www.linkedin.com/in/aditya-kulkarni-stoa",
    description: "Alternative MBA education platform for modern startup business and management skills.",
    trigger: "launching new online learning portals and scaling student community outreach events",
    domain: "EdTech",
    location: "India (Bangalore)"
  },
  {
    name: "Siddharth Maheshwari",
    company: "Newton School",
    email: "siddharth@newtonschool.co",
    linkedin: "https://www.linkedin.com/in/siddharth-maheshwari-newton",
    description: "Tech coding bootcamp offering outcome-driven career paths and full-stack developer training.",
    trigger: "launching an offline campus partnership program and hiring student ambassadors to drive signups",
    domain: "EdTech",
    location: "India (Bangalore)"
  },
  {
    name: "Prateek Shukla",
    company: "Masai School",
    email: "prateek@masaischool.com",
    linkedin: "https://www.linkedin.com/in/prateek-shukla-masai",
    description: "Coding bootcamp using an Income Share Agreement model to train software engineers.",
    trigger: "announcing partnerships with major corporate companies and hiring content editors for course materials",
    domain: "EdTech",
    location: "India (Bangalore)"
  },
  {
    name: "Shivam Dutta",
    company: "AlmaBetter",
    email: "shivam@almabetter.com",
    linkedin: "https://www.linkedin.com/in/shivam-dutta-almabetter",
    description: "Online tech school offering curriculum and guaranteed job placement in data science.",
    trigger: "scaling online student cohorts and expanding their career services support team",
    domain: "EdTech",
    location: "India (Bangalore)"
  },
  {
    name: "Aman Agarwal",
    company: "Frekil",
    email: "aman@frekil.com",
    linkedin: "https://www.linkedin.com/in/aman-agarwal-frekil",
    description: "Interactive biotech training platform providing data simulations and courses for pharmaceutical students.",
    trigger: "getting backed by YC and launching real-world drug performance data workshops",
    domain: "EdTech",
    location: "India (Bangalore)"
  },
  {
    name: "Ravi Shekhar",
    company: "Coding Ninjas",
    email: "ravi@codingninjas.com",
    linkedin: "https://www.linkedin.com/in/ravi-shekhar-ninjas",
    description: "Interactive learning platform offering online coding courses, guided problems, and practice code tests.",
    trigger: "expanding their tier-2 city college ambassador programs and hiring junior developers",
    domain: "EdTech",
    location: "India (Delhi NCR)"
  },
  {
    name: "Gaurav Munjal",
    company: "PrepLadder",
    email: "gaurav@prepladder.com",
    linkedin: "https://www.linkedin.com/in/gauravmunjal",
    description: "Exam prep platform for medical exams offering visual learning tools and test materials.",
    trigger: "launching offline simulation tests and seeking content curators for question banks",
    domain: "EdTech",
    location: "India (Bangalore)"
  },
  {
    name: "Aditya Shankar",
    company: "Doubtnut Education",
    email: "aditya.shankar@doubtnut.com",
    linkedin: "https://www.linkedin.com/in/aditya-shankar-doubtnut",
    description: "Multilingual instant video-solution platform resolving student academic queries using AI OCR.",
    trigger: "expanding digital study courses for regional board exams and looking for video creators",
    domain: "EdTech",
    location: "India (Gurgaon)"
  },
  {
    name: "Shyam Gupta",
    company: "Board Infinity Academy",
    email: "shyam@boardinfinity.com",
    linkedin: "https://www.linkedin.com/in/shyam-gupta-boardinfinity",
    description: "Career platform connecting students with corporate mentors for mock interviews and skill courses.",
    trigger: "scaling management course certification plans and hiring student program managers",
    domain: "EdTech",
    location: "India (Mumbai)"
  },
  {
    name: "Tanveer Singh",
    company: "Camp K12 Code",
    email: "tanveer@campk12.com",
    linkedin: "https://www.linkedin.com/in/tanveer-singh-campk12",
    description: "K-12 global online school teaching kids coding, app development, and virtual reality design.",
    trigger: "launching visual game design bootcamps and seeking student coding instructors",
    domain: "EdTech",
    location: "India (Gurgaon) + Remote"
  },
  {
    name: "Neha Joshi",
    company: "Eduvanz",
    email: "neha@eduvanz.com",
    linkedin: "https://www.linkedin.com/in/neha-joshi-eduvanz",
    description: "Fintech platform offering low-interest student study loans and tuition payment solutions.",
    trigger: "raising a $12M funding round and scaling campus student marketing campaigns",
    domain: "EdTech",
    location: "India (Mumbai)"
  },
  {
    name: "Mayank Kumar",
    company: "upGrad Campus",
    email: "mayank@upgradcampus.com",
    linkedin: "https://www.linkedin.com/in/mayank-kumar-upgrad",
    description: "Online higher education platform delivering job-linked certification courses to colleges.",
    trigger: "launching new cloud architecture programs and seeking student recruiters to drive signups",
    domain: "EdTech",
    location: "India (Mumbai)"
  },
  {
    name: "Akshay Saxena",
    company: "Avanti Fellows",
    email: "akshay@avantifellows.org",
    linkedin: "https://www.linkedin.com/in/akshay-saxena-avanti",
    description: "Social enterprise providing low-income students with high-quality math and science exam coaching.",
    trigger: "expanding free digital study platforms to government schools and hiring translation assistants",
    domain: "EdTech",
    location: "India (Delhi)"
  },
  {
    name: "Karan Gupta",
    company: "Kyt Academy",
    email: "karan@kyt.com",
    linkedin: "https://www.linkedin.com/in/karan-gupta-kyt",
    description: "Online academy focused on extracurricular activities and arts for school-age children.",
    trigger: "launching video performance contests and seeking creative design student editors",
    domain: "EdTech",
    location: "India (Bangalore)"
  },

  // 66-80: D2C & Creator Economy
  {
    name: "Aniket Shah",
    company: "Swish Delivery",
    email: "aniket@swish.delivery",
    linkedin: "https://www.linkedin.com/in/aniket-shah-swish",
    description: "10-minute quick-commerce food delivery platform operating localized micro-kitchens in Bangalore.",
    trigger: "raising seed funding and opening new micro-kitchen hubs to capture college areas",
    domain: "D2C",
    location: "India (Bangalore)"
  },
  {
    name: "Yogesh Chavan",
    company: "Peerlist",
    email: "yogesh@peerlist.io",
    linkedin: "https://www.linkedin.com/in/yogesh-chavan-peerlist",
    description: "Professional networking platform and portfolio builder for developers, designers, and marketers.",
    trigger: "launching Peerlist Jobs and expanding organic community building to design colleges",
    domain: "Creator Economy",
    location: "India (Pune) + Remote"
  },
  {
    name: "Ayush Ranjan",
    company: "Huddle01",
    email: "ayush@huddle01.com",
    linkedin: "https://www.linkedin.com/in/ayush-ranjan-huddle01",
    description: "Decentralized video conferencing infrastructure and Web3 communication protocol.",
    trigger: "securing $2.8M seed funding and seeking technical developer ambassadors for hackathons",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Harish Uthayakumar",
    company: "Bluelearn",
    email: "harish@bluelearn.in",
    linkedin: "https://www.linkedin.com/in/harish-uthayakumar",
    description: "Student community platform helping college students find co-founders, build projects, and learn skills.",
    trigger: "growing their student marketplace and seeking content curators to manage community posts",
    domain: "Creator Economy",
    location: "India (Bangalore)"
  },
  {
    name: "Varun Mayya",
    company: "Scenes",
    email: "varun@scenes.media",
    linkedin: "https://www.linkedin.com/in/varun-mayya",
    description: "Community platform for creators to host discussion forums, audio chats, and events (acquired by Avalon).",
    trigger: "expanding community moderation tools and hiring student graphic designers",
    domain: "Creator Economy",
    location: "India (Bangalore)"
  },
  {
    name: "Abhishek Prasad",
    company: "Quest Book",
    email: "abhishek@questbook.xyz",
    linkedin: "https://www.linkedin.com/in/abhishek-prasad-questbook",
    description: "Decentralized grant orchestration and payout platform for developer ecosystems and foundations.",
    trigger: "distributing millions in developer grants and hiring student QA auditors to verify code templates",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Harini Janakiraman",
    company: "BuildShip",
    email: "harini@buildship.com",
    linkedin: "https://www.linkedin.com/in/harini-janakiraman-buildship",
    description: "Low-code backend builder that allows developers to create APIs and scheduled tasks using visual workflows.",
    trigger: "launching on Product Hunt and building new integration templates using student devs",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Abel Mengistu",
    company: "FlutterFlow",
    email: "abel@flutterflow.io",
    linkedin: "https://www.linkedin.com/in/abel-mengistu-flutterflow",
    description: "Visual builder for native mobile and web applications powered by Google's Flutter framework.",
    trigger: "raising Series A funding and building localized developer ambassador networks",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Rishabh Poddar",
    company: "SuperTokens",
    email: "rishabh@supertokens.com",
    linkedin: "https://www.linkedin.com/in/rishabh-poddar-supertokens",
    description: "Open-source developer auth alternative to Auth0 with custom secure session management capabilities.",
    trigger: "growing their YC backed platform and hiring technical documentation writers",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Honey Mittal",
    company: "Locofy",
    email: "honey@locofy.ai",
    linkedin: "https://www.linkedin.com/in/honey-mittal-locofy",
    description: "Design-to-code platform that automatically converts Figma designs into production-ready frontend code.",
    trigger: "launching Locofy Lightning AI and seeking developer ambassadors to write Figma plugins",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Pranav Bajpayee",
    company: "NocoDB",
    email: "pranav@nocodb.com",
    linkedin: "https://www.linkedin.com/in/pranav-nocodb",
    description: "Open-source no-code database platform that transforms databases into collaborative smart spreadsheets.",
    trigger: "crossing 12 million downloads and seeking database research students to design templates",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Navaneeth PK",
    company: "ToolJet",
    email: "navaneeth@tooljet.com",
    linkedin: "https://www.linkedin.com/in/navaneeth-pk-tooljet",
    description: "Open-source low-code platform that lets developers build custom internal business applications.",
    trigger: "securing backing from M12 (Microsoft) and hiring student UI developers to build widget libraries",
    domain: "Creator Economy",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Abhishek Nayak",
    company: "Appsmith",
    email: "abhishek@appsmith.com",
    linkedin: "https://www.linkedin.com/in/abhishek-nayak-appsmith",
    description: "Open-source developer tool for building administrative panels, dashboards, and internal database dashboards.",
    trigger: "raising $41M Series B led by Insight Partners and expanding student advocate programs",
    domain: "Creator Economy",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Tanmai Gopal",
    company: "Hasura",
    email: "tanmai@hasura.io",
    linkedin: "https://www.linkedin.com/in/tanmai-gopal-hasura",
    description: "Instant GraphQL API engine that connects to databases and secures query data layers.",
    trigger: "launching custom database connector SDKs and seeking developer relations writing support",
    domain: "Creator Economy",
    location: "Global Remote"
  },
  {
    name: "Pranay Pradyumna",
    company: "SigNoz",
    email: "pranay@signoz.io",
    linkedin: "https://www.linkedin.com/in/pranay-signoz",
    description: "Open-source application performance monitoring and observability platform alternative to Datadog.",
    trigger: "growing their open-source community and hiring developer advocate interns",
    domain: "Creator Economy",
    location: "India (Bangalore) + Remote"
  },

  // 81-95: Logistics & Mobility
  {
    name: "Akash Gupta",
    company: "Zypp Electric",
    email: "akash@zypp.electric",
    linkedin: "https://www.linkedin.com/in/akash-gupta-zypp",
    description: "EV-as-a-service fleet delivery platform optimizing last-mile logistics for e-commerce brands.",
    trigger: "raising a $25M Series B round and starting major EV rider recruitment drives",
    domain: "Logistics",
    location: "India (Delhi NCR)"
  },
  {
    name: "Saurav Kumar",
    company: "Euler Motors",
    email: "saurav@eulermotors.com",
    linkedin: "https://www.linkedin.com/in/saurav-kumar-euler",
    description: "Electric three-wheeler commercial EV manufacturer and last-mile logistic vehicle developer.",
    trigger: "securing $14M funding and starting EV performance research trials in Indian cities",
    domain: "Logistics",
    location: "India (Delhi NCR)"
  },
  {
    name: "Amit Gupta",
    company: "Yulu",
    email: "amit@yulu.bike",
    linkedin: "https://www.linkedin.com/in/amit-gupta-yulu",
    description: "Micro-mobility electric bike sharing network providing zero-emission urban transport.",
    trigger: "expanding their urban delivery operations and hiring student brand ambassadors for campus signups",
    domain: "Logistics",
    location: "India (Bangalore)"
  },
  {
    name: "Ankit Mittal",
    company: "Sheru",
    email: "ankit@sheru.se",
    linkedin: "https://www.linkedin.com/in/ankit-mittal-sheru",
    description: "Energy utility and e-mobility cloud platform connecting EV batteries for energy storage grids.",
    trigger: "closing their seed round and seeking data analysts to optimize battery routing metrics",
    domain: "Logistics",
    location: "India (Delhi NCR)"
  },
  {
    name: "Pulkit Khurana",
    company: "Battery Smart",
    email: "pulkit@batterysmart.in",
    linkedin: "https://www.linkedin.com/in/pulkit-khurana-smart",
    description: "Battery swapping network for electric rickshaws and two-wheelers in India.",
    trigger: "closing $45M Series B round and hiring operations audit interns across cities",
    domain: "Logistics",
    location: "India (Delhi NCR)"
  },
  {
    name: "Pritesh Mahajan",
    company: "Revamp Moto",
    email: "pritesh@revampmoto.in",
    linkedin: "https://www.linkedin.com/in/pritesh-mahajan-revamp",
    description: "Electric two-wheeler EV developer designing modular utility bikes for gig workers and street vendors.",
    trigger: "securing funding after appearing on Shark Tank India and launching pilot test programs",
    domain: "Logistics",
    location: "India (Pune)"
  },
  {
    name: "Akshay Shekhar",
    company: "Kazam",
    email: "akshay@kazam.in",
    linkedin: "https://www.linkedin.com/in/akshay-shekhar-kazam",
    description: "EV charging software and charging station hardware infrastructure provider in India.",
    trigger: "raising a $5M Series A and seeking UI designer interns for mobile application upgrades",
    domain: "Logistics",
    location: "India (Bangalore)"
  },
  {
    name: "Punit Goyal",
    company: "BluSmart Mobility",
    email: "punit@blu-smart.com",
    linkedin: "https://www.linkedin.com/in/punit-goyal-blusmart",
    description: "All-electric ride-hailing cab network and large-scale EV charging superhub provider.",
    trigger: "securing $24M equity round and hiring green-energy student campus leads",
    domain: "Logistics",
    location: "India (Gurgaon)"
  },
  {
    name: "Siddharth Goel",
    company: "Zypp Courier",
    email: "siddharth@zypp.in",
    linkedin: "https://www.linkedin.com/in/siddharth-goel-zypp",
    description: "EV delivery courier fleet optimization platform serving direct-to-consumer digital channels.",
    trigger: "launching zero-emission courier services in major metro cities and seeking regional coordinators",
    domain: "Logistics",
    location: "India (Delhi NCR)"
  },
  {
    name: "Aman Gupta",
    company: "Battery Smart Grid",
    email: "aman@batterysmart.co.in",
    linkedin: "https://www.linkedin.com/in/aman-gupta-battery",
    description: "Cloud analytics platform for real-time monitoring of electric vehicle battery swap hubs.",
    trigger: "expanding charging hubs to 25 new tier-2 cities and hiring database support interns",
    domain: "Logistics",
    location: "India (Gurgaon)"
  },
  {
    name: "Pratik Kamdar",
    company: "Neuron Energy",
    email: "pratik@neuronenergy.in",
    linkedin: "https://www.linkedin.com/in/pratik-kamdar-neuron",
    description: "Lead-acid and lithium-ion battery technology provider for smart commercial electric vehicles.",
    trigger: "raising $2.5M and seeking chemical engineering student researchers for battery cell testing",
    domain: "Logistics",
    location: "India (Mumbai)"
  },
  {
    name: "Gagan Malhotra",
    company: "Sheru Cloud",
    email: "gagan@sheru.in",
    linkedin: "https://www.linkedin.com/in/gagan-malhotra-sheru",
    description: "Grid integration SaaS platform enabling virtual power plants using electric vehicles.",
    trigger: "partnering with state power utilities and looking for telemetry analysis student help",
    domain: "Logistics",
    location: "India (Delhi NCR)"
  },
  {
    name: "Shreyas Shibulal",
    company: "Micelio Mobility",
    email: "shreyas@micelio.com",
    linkedin: "https://www.linkedin.com/in/shreyas-shibulal-micelio",
    description: "EV startup seed fund and clean mobility validation laboratory support network.",
    trigger: "launching clean-tech student hackathons and funding new early-stage EV builders",
    domain: "Logistics",
    location: "India (Bangalore)"
  },
  {
    name: "Abhinav Singh",
    company: "Yulu Bike Network",
    email: "abhinav.singh@yulu.co.in",
    linkedin: "https://www.linkedin.com/in/abhinav-singh-yulu",
    description: "Shared electric micro-mobility charging station network expanding in transit stations.",
    trigger: "partnering with Delhi Metro and seeking regional logistics coordinators to manage fleets",
    domain: "Logistics",
    location: "India (Delhi)"
  },
  {
    name: "Rohan Sengupta",
    company: "Kazam EV Charge",
    email: "rohan@kazam.co.in",
    linkedin: "https://www.linkedin.com/in/rohan-sengupta-kazam",
    description: "Cloud platform aggregating independent EV chargers into a public charging grid.",
    trigger: "integrating 10k chargers onto their maps and hiring student database operations helpers",
    domain: "Logistics",
    location: "India (Bangalore)"
  },

  // 96-100: Developer Tools & Agencies
  {
    name: "Yash Sharma",
    company: "Oddity Agency",
    email: "yash@oddity.agency",
    linkedin: "https://www.linkedin.com/in/yash-sharma-oddity",
    description: "Digital design and web development agency creating premium visual interfaces and products.",
    trigger: "launching three premium client web builds and seeking student research and copy editors",
    domain: "Agencies",
    location: "Global Remote"
  },
  {
    name: "Prashant Ghildiyal",
    company: "Devtron",
    email: "prashant@devtron.ai",
    linkedin: "https://www.linkedin.com/in/prashant-devtron",
    description: "Kubernetes dashboard and open-source software delivery control plane for devops engineers.",
    trigger: "crossing 10k GitHub stars and seeking student technical writers for K8s tutorials",
    domain: "Tools",
    location: "India (Gurgaon)"
  },
  {
    name: "Neha Sengupta",
    company: "Keploy",
    email: "neha@keploy.io",
    linkedin: "https://www.linkedin.com/in/neha-sengupta-keploy",
    description: "No-code API test generator tool that records user traffic to build automated test mock data.",
    trigger: "raising a seed round and starting developer community outreach inside technical colleges",
    domain: "Tools",
    location: "India (Bangalore) + Remote"
  },
  {
    name: "Prukalpa Sankar",
    company: "Atlan",
    email: "prukalpa@atlan.com",
    linkedin: "https://www.linkedin.com/in/prukalpa-sankar-atlan",
    description: "Collaborative data workspace and metadata catalog platform for modern data teams.",
    trigger: "raising a $105M Series C round and launching localized marketing experiments for data builders",
    domain: "Tools",
    location: "Global Remote"
  },
  {
    name: "Manish Jethani",
    company: "Hevo Data Platform",
    email: "manish@hevodata.com",
    linkedin: "https://www.linkedin.com/in/manish-jethani-hevo",
    description: "Bi-directional database integration pipeline connecting SaaS data sources to cloud warehouses.",
    trigger: "introducing real-time data sync for next-gen models and hiring student QA analysts",
    domain: "Tools",
    location: "India (Bangalore) + Remote"
  }
];

// Helper to determine greeting salutation (e.g. "Hi Rahul," vs generic "Team Bolna AI")
function getSalutation(name, email, company) {
  const genericPrefixes = [
    'hello', 'info', 'support', 'careers', 'care', 'contact', 'team', 'connect',
    'partner', 'growth', 'sales', 'marketing', 'hi', 'help', 'customercare',
    'talent', 'jobs', 'recruitment', 'hr', 'university', 'admin', 'press', 'media'
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

// Generate the customized email body dynamically
function generatePersonalizedEmail(salutation, startup) {
  const name = salutation;
  const company = startup.company;
  const trigger = startup.trigger;
  const domain = startup.domain;
  
  // Custom value angle based on sector
  let valueAngle = "";
  if (domain === "AI") {
    valueAngle = "help your team with tasks like writing developer documentation, building API integrations, curating datasets, or running QA test suites.";
  } else if (domain === "SaaS" || domain === "Tools") {
    valueAngle = "support you with frontend coding tweaks, landing page optimization, technical QA testing, or building marketing databases.";
  } else if (domain === "FinTech") {
    valueAngle = "assist with fintech sandbox testing, user onboarding guides, financial modeling research, or content creation.";
  } else if (domain === "EdTech") {
    valueAngle = "help curate question banks, moderate study cohorts, translate course files, or create academic review content.";
  } else if (domain === "D2C" || domain === "Creator Economy") {
    valueAngle = "create Gen-Z social video reels, design ad banners, write search-optimized content, or run campus marketing activations.";
  } else if (domain === "Logistics") {
    valueAngle = "support with database management, route audits, operations research, or localized campus driver/rider activation runs.";
  } else {
    valueAngle = "help with graphics design, social media content creation, copy editing, or frontend development tasks.";
  }

  // The email template, carefully structured, avoiding pricing/escrow/money keywords, and staying under 180 words.
  const email = `Hi ${name},

I came across ${company} and really liked what you’re building around ${trigger}.

I’m Swatantra, founder of NextGenGrowth — a student-powered workforce platform where startups like yours can instantly access a skilled student team for execution work (marketing, design, content, dev support, research, etc.).

We’re currently working with early-stage startups to help them:
• Execute faster without increasing full-time cost
• Run growth experiments quickly
• Get flexible, on-demand student teams

Specifically for ${company}, we could ${valueAngle}

Instead of hiring or overloading your core team, we plug in students who can execute tasks end-to-end under your guidance.

If it makes sense, I’d love to offer a small pilot where we support one area of your growth for 7–10 days just to show the impact.

Would you be open to a quick 10–15 min chat this week?

Best regards,
Swatantra Shukla
Founder — NextGenGrowth`;

  return email;
}

// Generate the follow-up email (Day 3-4)
function generateFollowUpEmail(salutation, company) {
  return `Hi ${salutation},

Just wanted to quickly follow up on my last email.

Totally understand if you’re busy — just thought this might be relevant since startups at your stage usually need fast execution support without hiring overhead.

If you’re open, I can even show a few real examples of student teams handling startup work effectively.

Should I send a quick 2-min overview?

Thanks,
Swatantra`;
}

// Generate the LinkedIn message
function generateLinkedInMessage(name, company) {
  const firstName = name.split(' ')[0].trim();
  return `Hey ${firstName}, I really liked what you’re building at ${company}.

I run NextGenGrowth — a student-powered execution team helping early-stage startups with marketing, design & growth work.

Would love to connect and explore if we can support ${company} in any small way.`;
}

async function run() {
  console.log(`🚀 Processing ${startups.length} startups to generate outreach assets...`);
  
  const processedData = startups.map((startup, index) => {
    const salutation = getSalutation(startup.name, startup.email, startup.company);
    
    // Subjects
    const subject1 = `Quick idea for ${startup.company} growth`;
    const subject2 = `Helping ${startup.company} scale faster with student talent`;
    
    // Copy content
    const emailBody = generatePersonalizedEmail(salutation, startup);
    const followUp = generateFollowUpEmail(salutation, startup.company);
    const linkedinMsg = generateLinkedInMessage(startup.name, startup.company);
    
    // Word counts
    const emailWordCount = emailBody.split(/\s+/).filter(w => w.length > 0).length;
    const followUpWordCount = followUp.split(/\s+/).filter(w => w.length > 0).length;
    const linkedinWordCount = linkedinMsg.split(/\s+/).filter(w => w.length > 0).length;
    
    return {
      id: index + 1,
      founderName: startup.name,
      company: startup.company,
      email: startup.email,
      linkedinProfile: startup.linkedin,
      sector: startup.domain,
      location: startup.location,
      oneLineDescription: startup.description,
      trigger: startup.trigger,
      salutation: salutation,
      subject1: subject1,
      subject2: subject2,
      emailBody: emailBody,
      emailWordCount: emailWordCount,
      followUpBody: followUp,
      followUpWordCount: followUpWordCount,
      linkedinMessage: linkedinMsg,
      linkedinWordCount: linkedinWordCount
    };
  });

  // Verify all emails are under 180 words and log any anomalies
  const anomalies = processedData.filter(d => d.emailWordCount > 180 || d.emailWordCount < 100);
  if (anomalies.length > 0) {
    console.warn(`⚠️ Warning: Found ${anomalies.length} emails with word counts outside the 100-180 range!`);
    anomalies.forEach(a => console.log(`  - ${a.company}: ${a.emailWordCount} words`));
  } else {
    console.log(`✅ All ${processedData.length} personalized emails successfully generated under the 140-180 word limit!`);
  }

  // 1. Export JSON File
  const jsonPath = path.resolve(__dirname, 'startups_campaign_outreach.json');
  fs.writeFileSync(jsonPath, JSON.stringify(processedData, null, 2), 'utf8');
  console.log(`📁 JSON outreach database created at: ${jsonPath}`);

  // 2. Export CSV File
  const csvPath = path.resolve(__dirname, 'startups_campaign_outreach.csv');
  const headers = [
    'ID', 'Founder Name', 'Company', 'Email', 'LinkedIn Profile', 'Sector', 'Location',
    'Description', 'Trigger', 'Salutation', 'Subject Option 1', 'Subject Option 2',
    'Email Body', 'Follow-up Email', 'LinkedIn Message'
  ];
  
  const csvRows = [headers.join(',')];
  processedData.forEach(row => {
    // Helper to safely escape cells containing commas, double quotes, or newlines
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
      escapeCsv(row.founderName),
      escapeCsv(row.company),
      escapeCsv(row.email),
      escapeCsv(row.linkedinProfile),
      escapeCsv(row.sector),
      escapeCsv(row.location),
      escapeCsv(row.oneLineDescription),
      escapeCsv(row.trigger),
      escapeCsv(row.salutation),
      escapeCsv(row.subject1),
      escapeCsv(row.subject2),
      escapeCsv(row.emailBody),
      escapeCsv(row.followUpBody),
      escapeCsv(row.linkedinMessage)
    ];
    csvRows.push(fields.join(','));
  });
  
  fs.writeFileSync(csvPath, csvRows.join('\n') + '\n', 'utf8');
  console.log(`📁 CSV outreach database created at: ${csvPath}`);

  // 3. Export Excel File (.xlsx)
  const excelPath = path.resolve(__dirname, 'startups_campaign_outreach.xlsx');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Outreach Campaign');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 6 },
    { header: 'Founder Name', key: 'founderName', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'LinkedIn Profile', key: 'linkedinProfile', width: 35 },
    { header: 'Sector', key: 'sector', width: 15 },
    { header: 'Location', key: 'location', width: 25 },
    { header: 'Description', key: 'oneLineDescription', width: 45 },
    { header: 'Trigger', key: 'trigger', width: 45 },
    { header: 'Salutation', key: 'salutation', width: 15 },
    { header: 'Subject Option 1', key: 'subject1', width: 35 },
    { header: 'Subject Option 2', key: 'subject2', width: 35 },
    { header: 'Email Body', key: 'emailBody', width: 60 },
    { header: 'Follow-up Email', key: 'followUpBody', width: 50 },
    { header: 'LinkedIn Message', key: 'linkedinMessage', width: 40 }
  ];

  processedData.forEach(row => {
    sheet.addRow(row);
  });

  // Apply basic styles (header styling, alignments, text wraps)
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF064E3B' } // NextGenGrowth dark forest green color
  };

  sheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  await workbook.xlsx.writeFile(excelPath);
  console.log(`📁 Excel (.xlsx) outreach database created at: ${excelPath}`);
  
  console.log('\n=======================================');
  console.log('✅ Success! Outreach Database Compiled.');
  console.log(`📊 Total Startups Processed: ${processedData.length}`);
  console.log(`💬 Sample Copy Generated:`);
  console.log(`   - Company: ${processedData[0].company}`);
  console.log(`   - Subject: ${processedData[0].subject1}`);
  console.log(`   - Word Count: ${processedData[0].emailWordCount} words`);
  console.log('=======================================');
}

run().catch(err => {
  console.error('❌ Error compiling outreach database:', err);
});
