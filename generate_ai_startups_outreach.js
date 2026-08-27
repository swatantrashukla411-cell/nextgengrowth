const fs = require('fs');
const path = require('path');

// Curated database of 100 real, active AI startups globally (early-stage to Series B)
const aiStartups = [
  {
    name: "Bolna AI",
    domain: "voice AI agents and call orchestration",
    introDetail: "Your platform's ability to seamlessly run low-latency voice agents for customer calls is super impressive.",
    painPoints: [
      "Testing voice agents for latency under peak traffic conditions.",
      "Gathering human feedback on speech synthesis naturalness and agent tone.",
      "Cleaning and structuring voice dataset recordings for regional accent variations."
    ],
    customPainPointFraming: "improving voice agent latency, gathering human-in-the-loop validation, or scaling early user adoption"
  },
  {
    name: "Perseus",
    domain: "high-dimensional developer code search",
    introDetail: "I noticed your tool helping autonomous coding agents search and navigate complex codebases and dependencies.",
    painPoints: [
      "Running developer tool test suites and QA testing on code search outputs.",
      "Acquiring early developer users to build a feedback loop.",
      "Benchmarking search query prompts against multi-file repositories."
    ],
    customPainPointFraming: "improving search accuracy, acquiring early developer users, or optimizing context retrieval"
  },
  {
    name: "Composio",
    domain: "AI agent tool integration frameworks",
    introDetail: "I saw how you're enabling LLM agents to connect with tools like Github, Slack, and Jira.",
    painPoints: [
      "Testing agent workflow integrations across various third-party APIs.",
      "Writing developer guides, documentation, and tutorials for new integrations.",
      "Running QA testing for edge cases in agent action execution."
    ],
    customPainPointFraming: "validating tool integrations, writing developer documentation, or testing complex agent workflows"
  },
  {
    name: "Athina AI",
    domain: "LLM evaluation and monitoring",
    introDetail: "I really like your real-time prompt playground and dashboard for monitoring hallucinations and API tracing.",
    painPoints: [
      "Running human-in-the-loop evaluations on prompt datasets.",
      "Benchmarking prompt outputs across different models.",
      "Acquiring early SaaS developers to build initial feedback loops."
    ],
    customPainPointFraming: "improving evaluation accuracy, managing human feedback loops, or scaling developer signups"
  },
  {
    name: "Sarvam AI",
    domain: "Indic language LLMs and speech infrastructure",
    introDetail: "Your development of custom language models and speech-to-text systems tailored specifically for Indian languages is groundbreaking.",
    painPoints: [
      "Data labeling and cleaning for diverse Indic speech datasets.",
      "Model response benchmarking across multiple regional dialects.",
      "User research to validate dialect translation accuracy."
    ],
    customPainPointFraming: "cleaning Indic voice datasets, benchmarking regional language models, or scaling user validation studies"
  },
  {
    name: "Defog AI",
    domain: "SQL database natural language queries",
    introDetail: "I saw how your custom LLMs let non-technical team members query SQL databases in natural language.",
    painPoints: [
      "Running structured SQL query evaluations to catch syntax errors.",
      "Labeling and cleaning database metadata for custom SQL models.",
      "Benchmarking query prompt responses against complex schema configurations."
    ],
    customPainPointFraming: "optimizing SQL generation accuracy, labeling metadata datasets, or benchmarking complex schema prompts"
  },
  {
    name: "Portkey AI",
    domain: "LLMOps and AI gateway monitoring",
    introDetail: "Your platform facilitating routing, caching, and prompt tracing for production applications is essential for developers.",
    painPoints: [
      "Testing gateway routing logic across multiple model provider endpoints.",
      "Writing technical documentation and comparison blogs for developers.",
      "Running synthetic testing on prompt caching behaviors."
    ],
    customPainPointFraming: "testing gateway endpoints, writing technical dev content, or benchmarking cache latency"
  },
  {
    name: "Bland AI",
    domain: "conversational voice agents for phone calls",
    introDetail: "I saw how you're helping developers build voice calling workflows with hyper-realistic agent responses.",
    painPoints: [
      "Testing voice latency and call interruption handling.",
      "Structuring voice datasets to train models on conversational pauses.",
      "Managing human-in-the-loop audits for call transcript accuracy."
    ],
    customPainPointFraming: "improving conversational voice quality, auditing call transcripts, or testing call workflows"
  },
  {
    name: "Vapi",
    domain: "real-time voice applications and APIs",
    introDetail: "I saw how you're scaling developer APIs to build low-latency voice assistants and smart widgets.",
    painPoints: [
      "Testing smart widgets on different browsers and devices.",
      "Gathering user feedback on widget interaction flows.",
      "Acquiring developers to participate in voice hackathons."
    ],
    customPainPointFraming: "reducing voice application latency, collecting browser widget feedback, or driving developer acquisition"
  },
  {
    name: "Flowise",
    domain: "visual interfaces for LLM applications",
    introDetail: "Your drag-and-drop open-source UI for building customized LLM applications using LangChain and LlamaIndex is highly popular.",
    painPoints: [
      "Testing visual canvas workflow layouts on diverse screen sizes.",
      "Writing step-by-step developer guides for deploying complex agent templates.",
      "Acquiring early SaaS users for your managed cloud hosting platform."
    ],
    customPainPointFraming: "testing visual canvas layouts, writing step-by-step templates, or scaling cloud users"
  },
  {
    name: "LlamaIndex",
    domain: "context data injection frameworks for RAG",
    introDetail: "I really like your work on connecting private data sources with language models, especially your new LlamaCloud solution.",
    painPoints: [
      "Labeling and cleaning private data files for RAG search testing.",
      "Benchmarking document parsing prompts against complex PDF files.",
      "Testing data connector pipelines on edge case file types."
    ],
    customPainPointFraming: "improving RAG parsing quality, labeling unstructured files, or testing data connectors"
  },
  {
    name: "LangSmith",
    domain: "LLM application monitoring and prompt tracing",
    introDetail: "Your dashboard for enterprise prompt monitoring, dataset logging, and playground testing is a developer favorite.",
    painPoints: [
      "Running manual testing on dataset exports and integration scripts.",
      "Acquiring developers to test early beta features.",
      "Writing tutorials for prompt tracing configurations."
    ],
    customPainPointFraming: "monitoring prompt tracing accuracy, auditing export formats, or writing integration guides"
  },
  {
    name: "Pika Labs",
    domain: "generative AI video creation platforms",
    introDetail: "I saw how you're enabling users to transform text and image prompts into cinematic videos.",
    painPoints: [
      "Auditing generated video clips to check for visual rendering issues.",
      "Structuring prompt-to-video datasets for model training.",
      "Running creative ad campaigns to drive consumer app downloads."
    ],
    customPainPointFraming: "improving video generation quality, labeling video datasets, or running consumer acquisition campaigns"
  },
  {
    name: "CognitiveLab",
    domain: "LLM evaluation and tuning dashboards",
    introDetail: "I saw how you're helping developers evaluate and tune open-source LLMs inside your playground interface.",
    painPoints: [
      "Running developer UI testing on your model comparison pages.",
      "Acquiring early developer signups for pre-release tools.",
      "Structuring evaluation prompts across benchmark datasets."
    ],
    customPainPointFraming: "tuning model evaluation logic, testing sandbox UI pages, or acquiring early developer signups"
  },
  {
    name: "Segmind",
    domain: "serverless Stable Diffusion and image hosting APIs",
    introDetail: "Your sub-second Stable Diffusion API endpoints and serverless model hosting are incredibly fast.",
    painPoints: [
      "Testing image generation API outputs across client apps.",
      "Writing developer documentation for quick model deployments.",
      "Designing visual graphics and marketing banners to showcase API speeds."
    ],
    customPainPointFraming: "verifying generated image quality, writing deployment documentation, or designing ad graphics"
  },
  {
    name: "ElevenLabs",
    domain: "text-to-speech AI and voice synthesis",
    introDetail: "Your hyper-realistic text-to-speech engine and voice cloning technology are leading the industry.",
    painPoints: [
      "Auditing generated audio clips for accent and naturalness discrepancies.",
      "Acquiring mobile app users for your Reader app.",
      "Running localized marketing drives across university campuses."
    ],
    customPainPointFraming: "improving voice synthesis quality, acquiring mobile app users, or driving campus marketing campaigns"
  },
  {
    name: "Perplexity AI",
    domain: "conversational search and document analysis",
    introDetail: "Your search engine's ability to synthesize real-time web citations into direct, readable answers is game-changing.",
    painPoints: [
      "Auditing search response sources for citation accuracy.",
      "Testing mobile app updates across multiple devices and operating systems.",
      "Running community ambassador campaigns to drive student usage."
    ],
    customPainPointFraming: "improving search citation quality, auditing mobile application builds, or scaling student acquisition"
  },
  {
    name: "Anyscale",
    domain: "distributed AI training infrastructure",
    introDetail: "I really like how your platform based on Ray enables developers to scale model training workloads with ease.",
    painPoints: [
      "Writing enterprise deployment guides and setup guides.",
      "Running manual testing on cluster integration scripts.",
      "Designing graphics for developer reports and presentations."
    ],
    customPainPointFraming: "scaling distributed training workflows, testing integration scripts, or writing deployment guides"
  },
  {
    name: "Fireworks AI",
    domain: "serverless model inference and APIs",
    introDetail: "Your ultra-low-latency model inference endpoints and serverless hosting APIs are impressive.",
    painPoints: [
      "Benchmarking API latency across multiple global regions.",
      "Writing developer comparison blogs against alternative providers.",
      "Running testing on model fine-tuning APIs."
    ],
    customPainPointFraming: "improving inference latency, writing technical comparison blogs, or testing model tuning APIs"
  },
  {
    name: "Together AI",
    domain: "cloud training and inference platforms",
    introDetail: "Your cloud platform's capacity for high-throughput model training and custom fine-tuning is world-class.",
    painPoints: [
      "Testing cloud database connections and client console layouts.",
      "Auditing developer integration documentation.",
      "Designing marketing materials and slides for enterprise outreach."
    ],
    customPainPointFraming: "verifying cloud connection scripts, testing console layouts, or creating sales materials"
  },
  {
    name: "Fal.ai",
    domain: "generative media hosting and APIs",
    introDetail: "Your real-time SDXL model endpoints and media generation APIs are opening up incredible creative workflows.",
    painPoints: [
      "Testing real-time image rendering queues under high concurrent loads.",
      "Acquiring early creator developers for image API integrations.",
      "Writing step-by-step tutorial guides for building generative art apps."
    ],
    customPainPointFraming: "reducing media rendering latency, acquiring creator developers, or writing tutorial guides"
  },
  {
    name: "RunPod",
    domain: "GPU cloud computing rentals",
    introDetail: "Your serverless GPU cloud computing platform and node rentals are highly popular among ML developers.",
    painPoints: [
      "Testing user dashboard layouts and billing scripts.",
      "Acquiring developers to try your serverless GPU offerings.",
      "Writing technical documentation on GPU node deployments."
    ],
    customPainPointFraming: "testing user console layouts, acquiring GPU developers, or writing technical guides"
  },
  {
    name: "Vast.ai",
    domain: "peer-to-peer GPU rental marketplaces",
    introDetail: "Your marketplace facilitating peer-to-peer GPU hosting and rentals makes hardware access incredibly cheap.",
    painPoints: [
      "Auditing third-party GPU host reliability and connection scripts.",
      "Testing client console updates on multiple operating systems.",
      "Acquiring ML engineering students to rent GPUs."
    ],
    customPainPointFraming: "auditing host connection scripts, testing marketplace console builds, or acquiring ML students"
  },
  {
    name: "Cognition AI",
    domain: "autonomous AI software engineers",
    introDetail: "I saw how Devin is revolutionizing how developers handle complex, end-to-end coding tasks autonomously.",
    painPoints: [
      "Running extensive QA tests on Devin's generated codebase modifications.",
      "Gathering human feedback on Devin's problem-solving steps.",
      "Creating video walkthroughs and documentation for Devin's integrations."
    ],
    customPainPointFraming: "testing generated code accuracy, collecting user feedback on agent steps, or creating video walkthroughs"
  },
  {
    name: "Midjourney",
    domain: "generative image bot platforms",
    introDetail: "Your Discord-based generative image model's capability for rendering detailed artwork is legendary.",
    painPoints: [
      "Auditing generated images to flag rendering bugs (like text or hands).",
      "Testing prompt-to-image dataset labeling.",
      "Acquiring beta users for your web dashboard platform."
    ],
    customPainPointFraming: "improving image rendering quality, labeling prompt datasets, or scaling web beta users"
  },
  {
    name: "Runway",
    domain: "generative video editing software",
    introDetail: "Your video-to-video generation and AI-native editing tools are redefining modern creative video workflows.",
    painPoints: [
      "Auditing generated video clips to check for visual rendering issues.",
      "Testing mobile app interfaces on diverse smartphone screen layouts.",
      "Designing creative social media reels to promote new tools."
    ],
    customPainPointFraming: "improving video rendering quality, testing mobile app screens, or creating social promo content"
  },
  {
    name: "Synthesia",
    domain: "AI video avatar creation SaaS",
    introDetail: "Your video avatar generator for transforming script text into human-like video presentations is incredible.",
    painPoints: [
      "Auditing generated videos for lip-sync and audio naturalness issues.",
      "Gathering customer feedback on avatar naturalness.",
      "Designing localized presentation templates for customer onboarding."
    ],
    customPainPointFraming: "improving lip-sync rendering quality, gathering customer feedback, or designing localized templates"
  },
  {
    name: "Jasper AI",
    domain: "generative writing assistants for enterprise",
    introDetail: "Your generative writing assistant helping teams automate product copy and SEO blogs is highly effective.",
    painPoints: [
      "Testing output text generation to flag repetitive phrases.",
      "Writing template case studies to showcase Jasper's business impact.",
      "Running testing on extensions and add-ons."
    ],
    customPainPointFraming: "improving output copy quality, auditing integrations, or creating template case studies"
  },
  {
    name: "Copy.ai",
    domain: "automated copywriting and marketing workflows",
    introDetail: "Your platform's focus on automating marketing and copywriting workflows with pre-built templates is very practical.",
    painPoints: [
      "Testing template outputs for style and tone inconsistencies.",
      "Running user research to understand writing workflows.",
      "Designing social media ad creative assets to drive signups."
    ],
    customPainPointFraming: "improving copy tone consistency, running workflow user research, or designing ad creatives"
  },
  {
    name: "Writer.com",
    domain: "enterprise writing models and guidelines",
    introDetail: "I saw how you're helping enterprise companies maintain consistent brand voices using custom writing LLMs.",
    painPoints: [
      "Testing writing guideline check extensions on various browsers.",
      "Labeling and cleaning corporate style guide documents.",
      "Benchmarking model outputs against company guidelines."
    ],
    customPainPointFraming: "validating brand voice compliance, labeling style guide documents, or testing browser extensions"
  },
  {
    name: "Cohere",
    domain: "enterprise LLMs and semantic search APIs",
    introDetail: "Your enterprise-grade embeddings and language models are helping teams build powerful search tools.",
    painPoints: [
      "Labeling and cleaning datasets for model fine-tuning.",
      "Benchmarking enterprise search results across dialects.",
      "Writing developer documentation for building semantic search."
    ],
    customPainPointFraming: "cleaning fine-tuning datasets, benchmarking semantic search queries, or writing developer guides"
  },
  {
    name: "Anthropic",
    domain: "AI safety research and Claude models",
    introDetail: "Your focus on building helpful, harmless, and honest Claude models is setting new safety standards.",
    painPoints: [
      "Running human evaluations to check model response safety and helpfulness.",
      "Benchmarking prompt outputs across different versions.",
      "Acquiring early developers to test new api updates."
    ],
    customPainPointFraming: "assessing response helpfulness, managing human evaluation logs, or driving developer signups"
  },
  {
    name: "Hugging Face",
    domain: "AI model repositories and open-source hubs",
    introDetail: "Your community hub hosting hundreds of thousands of open-source models is the heart of the AI ecosystem.",
    painPoints: [
      "Testing model hosting interfaces on web and mobile screens.",
      "Writing tutorial guides for running models locally.",
      "Moderate community forum discussions."
    ],
    customPainPointFraming: "testing platform UI screens, writing local model tutorials, or moderating developer forums"
  },
  {
    name: "Replicate",
    domain: "serverless model deployment infrastructure",
    introDetail: "I saw how you're letting developers deploy machine learning models with a single line of code.",
    painPoints: [
      "Testing model container startup times on edge regions.",
      "Writing developer onboarding documentation.",
      "Creating ad banners to promote popular open-source models."
    ],
    customPainPointFraming: "testing container latency, writing developer guides, or designing visual ad banners"
  },
  {
    name: "Pinecone",
    domain: "serverless vector databases",
    introDetail: "Your serverless vector database providing fast vector search for RAG applications is essential for developers.",
    painPoints: [
      "Testing client library integrations on multiple language runtimes.",
      "Writing developer guides on setting up semantic search.",
      "Acquiring early developer signups for serverless trials."
    ],
    customPainPointFraming: "verifying client library integrations, writing setup documentation, or scaling developer signups"
  },
  {
    name: "Weaviate",
    domain: "open-source vector databases",
    introDetail: "Your vector database's ability to store objects and vectors seamlessly for multi-modal search is impressive.",
    painPoints: [
      "Testing data import scripts for database migrations.",
      "Writing developer blogs comparing vector search configurations.",
      "Acquiring early SaaS developers to build demo apps."
    ],
    customPainPointFraming: "testing database import scripts, writing technical blogs, or acquiring demo developers"
  },
  {
    name: "Milvus",
    domain: "enterprise vector search engines",
    introDetail: "Your vector database's capability to process trillions of vectors with high throughput is world-class.",
    painPoints: [
      "Testing cluster deployment configurations.",
      "Writing technical documentation on vector indexes.",
      "Designing graphics for developer reports."
    ],
    customPainPointFraming: "verifying cluster deployments, writing indexing documentation, or designing graphic reports"
  },
  {
    name: "Qdrant",
    domain: "Rust-based vector databases",
    introDetail: "I saw how your Rust-based vector search engine is providing developers with high performance and low memory footprints.",
    painPoints: [
      "Testing client library integrations (Python, JS, Rust).",
      "Writing benchmark comparison guides.",
      "Designing clean visual diagrams to explain index matching."
    ],
    customPainPointFraming: "testing multi-language client SDKs, writing indexing benchmarks, or designing visual diagrams"
  },
  {
    name: "Chroma DB",
    domain: "developer-first embeddable vector databases",
    introDetail: "Your focus on providing an embeddable, developer-friendly vector store to build LLM apps in seconds is highly appreciated.",
    painPoints: [
      "Testing SQLite database connection script setups.",
      "Writing developer onboarding quickstart guides.",
      "Acquiring early developer users."
    ],
    customPainPointFraming: "testing SQLite connection scripts, writing quickstart guides, or scaling developer users"
  },
  {
    name: "Langflow",
    domain: "visual editors for LangChain networks",
    introDetail: "Your visual workspace for building and prototyping LangChain components is extremely intuitive.",
    painPoints: [
      "Testing flow canvas drag-and-drop actions.",
      "Writing tutorials for building custom RAG flows.",
      "Acquiring developers to try managed cloud deployments."
    ],
    customPainPointFraming: "testing canvas drag-and-drop actions, writing RAG flow tutorials, or driving cloud signups"
  },
  {
    name: "AgentOps",
    domain: "monitoring and testing suites for AI agents",
    introDetail: "I saw how you're helping developers track agent session costs, replays, and function calls.",
    painPoints: [
      "Testing SDK integrations on React and Python frameworks.",
      "Writing developer blogs on monitoring agent hallucinations.",
      "Acquiring early developer users to build initial logs."
    ],
    customPainPointFraming: "testing SDK integrations, writing agent monitoring blogs, or acquiring developer signups"
  },
  {
    name: "Superagent",
    domain: "open-source frameworks for building agents",
    introDetail: "Your open-source framework for building production-ready AI assistants and agents is very powerful.",
    painPoints: [
      "Testing agent workflow APIs.",
      "Writing quickstart documentation.",
      "Acquiring developers to build custom assistants."
    ],
    customPainPointFraming: "testing workflow APIs, writing quickstart documentation, or acquiring custom developers"
  },
  {
    name: "AutoGPT",
    domain: "autonomous agent ecosystem tools",
    introDetail: "Your pioneering work on autonomous agents that run multi-step tasks in loop structures is inspiring.",
    painPoints: [
      "Testing agent action execution loops for infinite loop bugs.",
      "Writing developer tutorials for configuring agent plugins.",
      "Moderate community forum posts."
    ],
    customPainPointFraming: "testing action loops, writing agent plugin tutorials, or moderating developer forums"
  },
  {
    name: "Deepgram",
    domain: "speech-to-text and audio translation APIs",
    introDetail: "Your low-latency transcription APIs and speech-to-text engines are incredibly accurate.",
    painPoints: [
      "Auditing transcribed audio files for word error rates.",
      "Writing developer integration guides for node.js.",
      "Designing graphics for developer campaigns."
    ],
    customPainPointFraming: "auditing transcription accuracy, writing integration guides, or designing campaign graphics"
  },
  {
    name: "AssemblyAI",
    domain: "speech-to-text and audio intelligence APIs",
    introDetail: "I really like how your platform extracts speaker labels, sentiment, and summaries from phone calls.",
    painPoints: [
      "Auditing sentiment classification accuracy on customer call transcripts.",
      "Writing developer guides on analyzing phone calls.",
      "Acquiring early developer users."
    ],
    customPainPointFraming: "auditing sentiment classifications, writing call analytics guides, or scaling developer signups"
  },
  {
    name: "Gladia",
    domain: "audio translation and transcription engines",
    introDetail: "Your real-time transcription engine that processes audio feeds in under 100ms is highly impressive.",
    painPoints: [
      "Testing audio stream connections across networks.",
      "Auditing transcription accuracy on multilingual audios.",
      "Writing developer guides for call center integrations."
    ],
    customPainPointFraming: "testing audio streaming connections, auditing translation accuracy, or writing integration guides"
  },
  {
    name: "Braintrust",
    domain: "enterprise LLM evaluation and logging",
    introDetail: "Your platform's ability to help enterprise teams track model metrics, run tests, and manage playgrounds is valuable.",
    painPoints: [
      "Running manual testing on dataset integrations.",
      "Benchmarking response prompts across model updates.",
      "Writing customer success integration guides."
    ],
    customPainPointFraming: "testing dataset integrations, benchmarking prompt outputs, or writing integration guides"
  },
  {
    name: "Arize AI",
    domain: "machine learning observability and evaluation",
    introDetail: "I saw how you're helping teams detect model drift, analyze embeddings, and trace prompt errors in production.",
    painPoints: [
      "Running testing on embedding cluster visualization pages.",
      "Writing technical guides on diagnosing model drift.",
      "Acquiring early ML engineers to try your open-source tools."
    ],
    customPainPointFraming: "testing visualization pages, writing model drift guides, or acquiring early engineers"
  },
  {
    name: "Phoenix",
    domain: "observability and evaluation frameworks",
    introDetail: "Your open-source workspace for tracing RAG workflows and logging prompt outputs is extremely helpful.",
    painPoints: [
      "Testing data logging integration libraries.",
      "Writing quickstart guides for React integrations.",
      "Moderate GitHub issues and questions."
    ],
    customPainPointFraming: "testing data logging libraries, writing quickstart guides, or moderating developer forums"
  },
  {
    name: "Fiddler AI",
    domain: "model explainability and monitoring",
    introDetail: "Your platform's focus on explaining model predictions and monitoring data drift is critical for enterprise trust.",
    painPoints: [
      "Testing prediction explanation widgets.",
      "Labeling and cleaning validation datasets.",
      "Writing whitepapers on explainable AI."
    ],
    customPainPointFraming: "testing explanation widgets, labeling validation datasets, or writing whitepapers"
  },
  {
    name: "WhyLabs",
    domain: "AI data monitoring and drift detection",
    introDetail: "Your platform's focus on tracking data quality profiles and detecting model input changes is highly valuable.",
    painPoints: [
      "Testing data profile logging APIs.",
      "Writing developer blogs on tracking data quality.",
      "Acquiring early SaaS developers."
    ],
    customPainPointFraming: "testing profile logging APIs, writing data quality blogs, or scaling developer signups"
  },
  {
    name: "Arthur AI",
    domain: "model monitoring and governance dashboards",
    introDetail: "I saw how you're helping companies manage model performance, detect bias, and control LLM inputs.",
    painPoints: [
      "Testing bias detection dashboards.",
      "Labeling and cleaning test validation datasets.",
      "Writing regulatory compliance guides."
    ],
    customPainPointFraming: "testing dashboard UI widgets, labeling validation datasets, or writing compliance guides"
  },
  {
    name: "Giskard",
    domain: "testing and QA frameworks for LLMs",
    introDetail: "Your focus on automatically scanning LLM models to detect hallucinations, biases, and prompt injections is outstanding.",
    painPoints: [
      "Running QA testing on your automated model scan scripts.",
      "Benchmarking safety scan prompts.",
      "Writing tutorial guides on secure prompt design."
    ],
    customPainPointFraming: "verifying model scan scripts, benchmarking safety prompts, or writing prompt tutorials"
  },
  {
    name: "Ragas",
    domain: "evaluation frameworks for RAG systems",
    introDetail: "Your framework's capability to measure faithfulness, answer relevance, and context recall is highly useful.",
    painPoints: [
      "Testing evaluation data import pipelines.",
      "Writing tutorials on measuring RAG context recall.",
      "Moderate community forum discussions."
    ],
    customPainPointFraming: "testing data import pipelines, writing context recall tutorials, or moderating community forums"
  },
  {
    name: "TruLens",
    domain: "evaluation tools for neural networks and LLMs",
    introDetail: "Your focus on using feedback functions to measure prompt toxicity and hallucination rates is very practical.",
    painPoints: [
      "Testing feedback function integration libraries.",
      "Writing documentation on setting up prompt evaluations.",
      "Acquiring early developer users."
    ],
    customPainPointFraming: "testing evaluation libraries, writing setup documentation, or scaling developer users"
  },
  {
    name: "Cleanlab",
    domain: "automatic data labeling and cleaning",
    introDetail: "Your tool's ability to automatically find label errors and outliers in datasets is highly valuable.",
    painPoints: [
      "Testing dataset upload pipelines for file conversion errors.",
      "Writing user guides on correcting dataset labels.",
      "Acquiring early data science students."
    ],
    customPainPointFraming: "testing dataset upload pipelines, writing label correction guides, or acquiring data science students"
  },
  {
    name: "Snorkel AI",
    domain: "programmatic data labeling platforms",
    introDetail: "Your programmatic data labeling and fine-tuning annotation system is very efficient.",
    painPoints: [
      "Testing label function writing interfaces.",
      "Labeling validation datasets for customer models.",
      "Writing case studies on training data."
    ],
    customPainPointFraming: "testing label interfaces, labeling validation datasets, or writing training case studies"
  },
  {
    name: "Scale AI",
    domain: "data labeling and fine-tuning annotations",
    introDetail: "Your high-quality training datasets and fine-tuning annotation platforms are the benchmark for major models.",
    painPoints: [
      "Auditing labeled image datasets for annotation errors.",
      "Testing data annotation tools on different screens.",
      "Designing onboarding templates for annotators."
    ],
    customPainPointFraming: "auditing image annotations, testing annotation screens, or designing onboarding templates"
  },
  {
    name: "Labelbox",
    domain: "training data platforms and image annotations",
    introDetail: "I saw how you're helping teams manage labeling projects, query unstructured data, and train models.",
    painPoints: [
      "Testing image labeling tools for browser lag.",
      "Writing guides on setting up labeling projects.",
      "Acquiring early developer signups."
    ],
    customPainPointFraming: "testing labeling tool rendering, writing setup guides, or driving developer signups"
  },
  {
    name: "V7 Labs",
    domain: "computer vision training data platforms",
    introDetail: "Your focus on providing pixel-perfect image annotation tools and dataset managers is impressive.",
    painPoints: [
      "Testing video labeling tools for playback latency.",
      "Auditing medical image annotations for precision errors.",
      "Writing guides on training computer vision models."
    ],
    customPainPointFraming: "testing video labeling playback, auditing image annotations, or writing CV model guides"
  },
  {
    name: "Roboflow",
    domain: "computer vision datasets and deployment",
    introDetail: "Your platform's focus on helping developers organize images, label datasets, and train models in clicks is amazing.",
    painPoints: [
      "Testing image upload pipelines.",
      "Writing quickstart guides for React applications.",
      "Acquiring early developer users."
    ],
    customPainPointFraming: "testing image upload lines, writing quickstart guides, or scaling developer users"
  },
  {
    name: "Dify.ai",
    domain: "open-source LLM app building engines",
    introDetail: "Your open-source platform's ability to orchestrate workflows, host databases, and compile agents is great.",
    painPoints: [
      "Testing workspace console layouts.",
      "Writing onboarding tutorials for complex agents.",
      "Moderate community forum discussions."
    ],
    customPainPointFraming: "testing console UI layouts, writing onboarding tutorials, or moderating developer forums"
  },
  {
    name: "Flowith",
    domain: "interactive canvases for multiple AI agents",
    introDetail: "Your visual workspace for running multiple AI agents in parallel on a single canvas is extremely neat.",
    painPoints: [
      "Testing canvas rendering performance under high agent activity.",
      "Gathering user feedback on canvas layouts.",
      "Acquiring consumer users."
    ],
    customPainPointFraming: "testing canvas rendering limits, collecting layout user feedback, or driving consumer signups"
  },
  {
    name: "Phind",
    domain: "search engines tailored for coding help",
    introDetail: "Your developer search engine's capacity for generating working code snippets with citations is excellent.",
    painPoints: [
      "Auditing generated code outputs for syntax errors.",
      "Testing search query latency under peak loads.",
      "Acquiring developer users."
    ],
    customPainPointFraming: "auditing generated code syntax, testing query latency, or scaling developer signups"
  },
  {
    name: "Tabnine",
    domain: "AI assistant tools for developer autocompletion",
    introDetail: "Your code autocomplete plugins and private models are helping developers code faster.",
    painPoints: [
      "Testing editor plugin builds (VS Code, JetBrains).",
      "Writing developer comparison blogs.",
      "Acquiring developer users."
    ],
    customPainPointFraming: "testing editor plugin builds, writing developer blogs, or scaling developer users"
  },
  {
    name: "Double.bot",
    domain: "AI coding assistant plugins",
    introDetail: "I saw how your coding assistant plugin is helping developers build and refactor applications inside VS Code.",
    painPoints: [
      "Testing plugin builds for memory leak issues.",
      "Writing guides on prompt engineering for code builders.",
      "Acquiring early developer signups."
    ],
    customPainPointFraming: "testing plugin memory profiles, writing coding guides, or scaling developer users"
  },
  {
    name: "CodiumAI",
    domain: "automated code generation and test writing",
    introDetail: "Your developer tools for automatically generating tests and explaining code steps are highly useful.",
    painPoints: [
      "Testing generated test script outputs for compiler errors.",
      "Writing developer tutorials on writing unit tests.",
      "Acquiring developer signups."
    ],
    customPainPointFraming: "verifying generated test scripts, writing unit test tutorials, or driving developer signups"
  },
  {
    name: "Bito",
    domain: "code reviewers and developer assistants",
    introDetail: "I really like your tool's ability to explain complex code lines, review commits, and write test files.",
    painPoints: [
      "Testing code review plugins on browser portals (GitHub/GitLab).",
      "Writing developer quickstart guides.",
      "Acquiring developer signups."
    ],
    customPainPointFraming: "testing review plugin extensions, writing quickstart guides, or driving developer signups"
  },
  {
    name: "Sourcegraph Cody",
    domain: "AI code search and autocomplete assistants",
    introDetail: "Your tool's capacity to read whole codebases to generate context-aware code autocomplete is world-class.",
    painPoints: [
      "Testing IDE plugin versions under offline modes.",
      "Writing developer tutorials on codebase search.",
      "Acquiring early developer users."
    ],
    customPainPointFraming: "testing IDE plugin offline modes, writing codebase search tutorials, or scaling developer users"
  },
  {
    name: "Sweep AI",
    domain: "autonomous developer agents",
    introDetail: "Your junior developer agent's capacity to fix code issues by reading Github issues is a great workflow helper.",
    painPoints: [
      "Testing agent codebase refactoring outputs for syntax errors.",
      "Gathering developer feedback on agent pull requests.",
      "Writing developer quickstart guides."
    ],
    customPainPointFraming: "testing agent refactoring scripts, gathering developer PR feedback, or writing quickstart guides"
  },
  {
    name: "Mutable AI",
    domain: "automated documentation and test suites",
    introDetail: "Your tool's focus on converting code repositories into readable documentation files is highly valuable.",
    painPoints: [
      "Testing doc generator pipelines for formatting errors.",
      "Writing developer tutorials on codebase mapping.",
      "Acquiring early developer signups."
    ],
    customPainPointFraming: "testing doc formatting pipelines, writing codebase mapping tutorials, or scaling developer users"
  },
  {
    name: "Codeium",
    domain: "free coding assistants and developer extensions",
    introDetail: "Your free code autocomplete extension and fast search tools are helping thousands of developers.",
    painPoints: [
      "Testing browser plugin extensions.",
      "Writing developer guides on code search.",
      "Acquiring developer signups."
    ],
    customPainPointFraming: "testing browser plugin builds, writing developer guides, or driving developer signups"
  },
  {
    name: "Anysphere",
    domain: "AI developer editors and Cursor platforms",
    introDetail: "Your work on the Cursor editor, enabling inline code edits and context-aware chat, is setting new standards.",
    painPoints: [
      "Testing custom editor versions on multiple systems.",
      "Writing user guides on codebase features.",
      "Acquiring developer users."
    ],
    customPainPointFraming: "testing custom editor versions, writing codebase user guides, or scaling developer users"
  },
  {
    name: "Superwhisper",
    domain: "voice-to-text dictation tools",
    introDetail: "Your system-wide voice typing utility that runs models locally on macOS is incredibly smooth.",
    painPoints: [
      "Testing local voice typing widgets for audio input lag.",
      "Gathering user feedback on voice typing shortcuts.",
      "Acquiring consumer users."
    ],
    customPainPointFraming: "testing audio typing widgets, collecting shortcut user feedback, or scaling consumer users"
  },
  {
    name: "AudioPen",
    domain: "voice recordings to formatted summaries",
    introDetail: "I really like how your tool takes messy audio notes and formats them into clean, structured summaries.",
    painPoints: [
      "Testing audio recording pipelines on mobile browsers.",
      "Gathering user feedback on summary formats.",
      "Designing creative social ad templates."
    ],
    customPainPointFraming: "testing mobile recording pipelines, collecting summary user feedback, or designing social templates"
  },
  {
    name: "Limitless AI",
    domain: "smart meeting assistants and wearables",
    introDetail: "Your smart meeting transcriber app and wearable audio pendant tools are opening up new ways to log life events.",
    painPoints: [
      "Testing bluetooth audio recording sync pipelines.",
      "Auditing meeting transcripts for speaker recognition errors.",
      "Acquiring mobile app users."
    ],
    customPainPointFraming: "testing bluetooth recording sync, auditing speaker recognition profiles, or scaling app users"
  },
  {
    name: "Otter.ai",
    domain: "automated meeting note taking and transcription bots",
    introDetail: "Your assistant bot that joins calls to auto-transcribe conversation lines is extremely helpful.",
    painPoints: [
      "Testing call bot integration scripts on virtual conference sites.",
      "Auditing speaker labels in transcripts.",
      "Acquiring student users."
    ],
    customPainPointFraming: "testing video bot integrations, auditing speaker labels, or scaling student users"
  },
  {
    name: "Fireflies.ai",
    domain: "meeting recorders and summary search",
    introDetail: "Your meeting recorder's ability to search transcripts, filter topics, and generate action items is powerful.",
    painPoints: [
      "Testing integrations with calendar provider API keys.",
      "Auditing call summaries for action item accuracy.",
      "Acquiring corporate users."
    ],
    customPainPointFraming: "testing calendar integration scripts, auditing action item summaries, or scaling corporate users"
  },
  {
    name: "Read AI",
    domain: "meeting analytics and smart summaries",
    introDetail: "I saw how you're analyzing attendee sentiment and engagement to generate intelligent meeting metrics.",
    painPoints: [
      "Testing dashboard sentiment metrics pages.",
      "Auditing call transcripts for transcription errors.",
      "Acquiring early SaaS developers."
    ],
    customPainPointFraming: "testing metrics dashboard pages, auditing transcription errors, or scaling developer signups"
  },
  {
    name: "Fathom",
    domain: "free Zoom transcribers and call notes",
    introDetail: "Your free Zoom assistant bot that auto-transcribes call audio is a must-have tool for remote teams.",
    painPoints: [
      "Testing Zoom SDK integrations for layout bugs.",
      "Auditing speaker recognition labels.",
      "Acquiring corporate users."
    ],
    customPainPointFraming: "testing Zoom SDK integrations, auditing speaker labels, or driving corporate signups"
  },
  {
    name: "Gong.io",
    domain: "revenue intelligence and sales analytics",
    introDetail: "Your conversation intelligence platform that analyzes sales calls to deliver coaching insights is industry-leading.",
    painPoints: [
      "Testing phone system integration plugins.",
      "Auditing call transcripts for product keyword extraction accuracy.",
      "Designing graphics for sales reports."
    ],
    customPainPointFraming: "testing telephony integration plugins, auditing keyword classifications, or designing sales graphics"
  },
  {
    name: "Chorus.ai",
    domain: "conversation intelligence for sales",
    introDetail: "I really like how your system transcribes calls and identifies key coaching moments for sales reps.",
    painPoints: [
      "Testing dialer integration scripts.",
      "Auditing call summaries for deal risk analysis.",
      "Designing graphics for customer reports."
    ],
    customPainPointFraming: "testing dialer integration scripts, auditing deal risk metrics, or designing customer reports"
  },
  {
    name: "Humata AI",
    domain: "PDF document chat assistants",
    introDetail: "I saw how your chat tool lets users query long scientific publications and legal papers in seconds.",
    painPoints: [
      "Testing document uploading pipelines for file format errors.",
      "Auditing answer citations for document page accuracy.",
      "Acquiring student users."
    ],
    customPainPointFraming: "testing doc upload pipelines, auditing answer citation pages, or scaling student users"
  },
  {
    name: "ChatPDF",
    domain: "interactive document chat engines",
    introDetail: "Your tool's ability to help students and researchers chat with PDF files instantly is incredibly popular.",
    painPoints: [
      "Testing file upload pipelines on mobile viewports.",
      "Auditing model answers to detect document hallucinations.",
      "Acquiring consumer users."
    ],
    customPainPointFraming: "testing mobile upload layouts, auditing source document citations, or driving consumer signups"
  },
  {
    name: "Julius AI",
    domain: "AI data scientists and spreadsheet tools",
    introDetail: "I saw how you're helping users analyze spreadsheets, run code, and generate graphs in natural language.",
    painPoints: [
      "Testing python environment script execution speeds.",
      "Auditing generated graphs for formatting issues.",
      "Acquiring student users."
    ],
    customPainPointFraming: "testing code execution modules, auditing visual chart formatting, or scaling student users"
  },
  {
    name: "Rose.com",
    domain: "financial data platforms and AI queries",
    introDetail: "Your database's ability to pull and clean global financial datasets with AI commands is very neat.",
    painPoints: [
      "Testing database query integrations.",
      "Labeling and cleaning historical dataset tables.",
      "Acquiring financial analyst users."
    ],
    customPainPointFraming: "testing database query setups, cleaning historical dataset tables, or driving analyst signups"
  },
  {
    name: "Hebbia",
    domain: "semantic search and finance document intelligence",
    introDetail: "Your semantic search platform helping analyst teams cross-reference thousands of documents is impressive.",
    painPoints: [
      "Testing document parsing pipelines.",
      "Auditing semantic search citations.",
      "Writing whitepapers on secure RAG."
    ],
    customPainPointFraming: "testing document parsing systems, auditing search citation indexes, or writing security guides"
  },
  {
    name: "AlphaSense",
    domain: "market intelligence search with AI summaries",
    introDetail: "I saw how your search engine compiles financial reports, broker research, and transcripts with AI extraction.",
    painPoints: [
      "Testing search index scaling latency.",
      "Auditing extracted company metrics.",
      "Designing graphics for sales decks."
    ],
    customPainPointFraming: "testing search index latency, auditing company metrics charts, or designing sales decks"
  },
  {
    name: "Elicit",
    domain: "AI research assistants for scientific literature",
    introDetail: "I really like how your tool automates literature reviews by extracting queries across peer-reviewed papers.",
    painPoints: [
      "Auditing paper extraction summaries.",
      "Testing query search latency under peak loads.",
      "Acquiring student users."
    ],
    customPainPointFraming: "auditing literature summaries, testing search query latency, or scaling student users"
  },
  {
    name: "Consensus",
    domain: "AI search engines for peer-reviewed papers",
    introDetail: "Your search engine's ability to synthesize scientific consensus directly from studies is extremely helpful.",
    painPoints: [
      "Auditing paper citation metadata.",
      "Testing search widget screens on mobile.",
      "Acquiring university student users."
    ],
    customPainPointFraming: "auditing search consensus metadata, testing mobile search layouts, or scaling student users"
  },
  {
    name: "SciSpace",
    domain: "AI copilots for reading research papers",
    introDetail: "Your interactive reading copilot helping students explain complex charts and text blocks is very neat.",
    painPoints: [
      "Testing canvas rendering actions for PDF files.",
      "Auditing model answers to catch chart hallucinations.",
      "Acquiring student users."
    ],
    customPainPointFraming: "testing interactive PDF rendering, auditing model chart citations, or scaling student users"
  },
  {
    name: "QuillBot",
    domain: "AI paraphrasing and summarizing tools",
    introDetail: "Your paraphrasing editor and summarizer helping millions of writers edit content is highly popular.",
    painPoints: [
      "Testing editor UI plugins (Word, Chrome extensions).",
      "Auditing paraphrased text for grammar mistakes.",
      "Acquiring student users."
    ],
    customPainPointFraming: "testing editor plugin extensions, auditing text grammar patterns, or scaling student users"
  },
  {
    name: "Grammarly",
    domain: "writing assistants and generative rewrites",
    introDetail: "Your generative writing dashboard helping teams polish drafts is an essential writing companion.",
    painPoints: [
      "Testing browser plug extensions for compatibility.",
      "Auditing grammar correction suggestions.",
      "Designing ad creatives."
    ],
    customPainPointFraming: "testing browser plugin versions, auditing grammar correction logs, or designing ad creatives"
  },
  {
    name: "DeepL",
    domain: "AI translation for documents and texts",
    introDetail: "Your translator's capability to preserve document layouts during translation is highly impressive.",
    painPoints: [
      "Testing document layout preservation during PDF conversions.",
      "Auditing translation accuracy on regional languages.",
      "Acquiring developer users."
    ],
    customPainPointFraming: "testing PDF conversion layouts, auditing regional translation accuracy, or driving developer signups"
  },
  {
    name: "HeyGen",
    domain: "AI video generators and translation avatars",
    introDetail: "Your instant video avatar generator and multi-language video translation tools are leading the market.",
    painPoints: [
      "Auditing translated video voice tracks for naturalness.",
      "Testing video rendering queues under concurrent load.",
      "Acquiring corporate users."
    ],
    customPainPointFraming: "auditing voice track audio quality, testing video rendering queues, or driving corporate signups"
  },
  {
    name: "D-ID",
    domain: "photo-to-video talking avatar generators",
    introDetail: "I saw how your avatar tool lets developers transform static profile images into talking videos in clicks.",
    painPoints: [
      "Auditing generated video clips for lip-sync errors.",
      "Testing API endpoints for video rendering speeds.",
      "Acquiring developer users."
    ],
    customPainPointFraming: "auditing avatar lip-sync naturalness, testing video rendering speeds, or scaling developer signups"
  },
  {
    name: "ElevenLabs Reader",
    domain: "text-to-speech mobile reading apps",
    introDetail: "Your mobile reading app that auto-reads articles in high-quality celebrity voices is a fantastic tool.",
    painPoints: [
      "Testing mobile app versions on different smartphone screens.",
      "Auditing voice audio files for playback bugs.",
      "Acquiring consumer app users."
    ],
    customPainPointFraming: "testing mobile app device screens, auditing voice playback scripts, or driving mobile signups"
  },
  {
    name: "Suno AI",
    domain: "generative music creation platforms",
    introDetail: "Your platform's capacity for compiling high-fidelity full songs from brief text prompts is extraordinary.",
    painPoints: [
      "Auditing generated music tracks for audio clipping issues.",
      "Testing mobile browser audio player widgets.",
      "Acquiring consumer users."
    ],
    customPainPointFraming: "auditing audio track clip outputs, testing browser playback widgets, or driving consumer signups"
  },
  {
    name: "Owkin",
    domain: "AI-driven drug discovery and clinical trials optimization",
    introDetail: "I really like how you're using machine learning to find target therapies and accelerate oncology research.",
    painPoints: [
      "Auditing model predictions against laboratory study findings.",
      "Labeling and cleaning multi-modal clinical trial datasets.",
      "Testing user dashboard widgets for clinical research teams."
    ],
    customPainPointFraming: "improving clinical model prediction accuracy, labeling multi-modal datasets, or testing researcher dashboard widgets"
  },
  {
    name: "Shield AI",
    domain: "autonomous AI piloting software and defense systems",
    introDetail: "Your development of Hivemind to pilot unmanned aircraft autonomously without GPS is revolutionary.",
    painPoints: [
      "Testing autonomous control simulation loops for execution errors.",
      "Structuring high-dimensional telemetry log datasets for model training.",
      "Writing technical documentation and manuals for hardware operator testing."
    ],
    customPainPointFraming: "verifying autonomous simulation loops, structuring telemetry datasets, or writing technical operator documentation"
  }
];

function generateEmail(startup) {
  const company = startup.name;
  const domain = startup.domain;
  const introDetail = startup.introDetail;
  const customPainPointFraming = startup.customPainPointFraming;

  // Exact email structure requested by user
  return `Hi ${company} Team,

I recently came across ${company} and really liked what you're building in the AI space, especially around ${domain}. ${introDetail}

As AI products scale, the real challenge is not just development — but continuously managing testing, human feedback, data workflows, prompt evaluation, and also creative + content execution for growth.

I’m Swatantra Shukla, Founder of NextGenGrowth.

NextGenGrowth is a student-powered execution and creator platform where brands and startups can directly access trained student talent for real, outcome-driven work — all managed through a structured, secure workflow.

We help AI teams with:

• AI product testing (chatbots, agents, voice AI, workflows)
• Human feedback collection & model evaluation
• Data labeling, cleaning & structured dataset creation
• Prompt testing & response benchmarking
• User research & real-world validation
• Early user acquisition & outreach campaigns
• Campus ambassador & community-led growth programs
• Creative execution (ads, social media creatives, content assets, branding support)
• Market research & competitor tracking
• Ongoing digital execution via student creators on real projects

Instead of hiring and managing scattered interns or freelancers, startups can plug into a single structured system where student creators apply, work, submit, and get paid through a secure project flow.

If ${company} is currently focusing on ${customPainPointFraming}, I’d love to explore whether this system can support your team.

Would you be open to a quick 15-minute call this week?

Looking forward to your thoughts.

Best regards,
Swatantra Shukla
Founder, NextGenGrowth
📧 swatantra@nextgengrowth.in
📱 +91 9532792303
🌐 https://nextgengrowth.in/for-brands
🔗 https://www.linkedin.com/in/swatantra-shukla-aaa2a82bb/`;
}

async function run() {
  console.log(`🚀 Processing ${aiStartups.length} AI startups...`);
  
  const markdownRows = [];
  markdownRows.push(`# 100 AI Startups Cold Outreach Copy\n`);
  markdownRows.push(`This document contains 100 active AI startups globally with their domain, inferred pain points, and a highly personalized cold outreach email using the NextGenGrowth template.\n`);
  markdownRows.push(`---\n`);

  const processedData = aiStartups.map((startup, index) => {
    const email = generateEmail(startup);
    const id = index + 1;

    markdownRows.push(`## ${id}. ${startup.name}`);
    markdownRows.push(`- **Domain:** ${startup.domain}`);
    markdownRows.push(`- **Pain Points:**`);
    startup.painPoints.forEach(p => {
      markdownRows.push(`  - ${p}`);
    });
    markdownRows.push(`- **Personalized Email:**\n\`\`\`text\n${email}\n\`\`\`\n`);
    markdownRows.push(`---\n`);

    return {
      id: id,
      company: startup.name,
      domain: startup.domain,
      painPoints: startup.painPoints,
      emailBody: email
    };
  });

  // Write MD File
  const mdPath = path.resolve(__dirname, '100_ai_startups_outreach.md');
  fs.writeFileSync(mdPath, markdownRows.join('\n'), 'utf8');
  console.log(`✅ Markdown file successfully written to: ${mdPath}`);

  // Write JSON backup
  const jsonPath = path.resolve(__dirname, '100_ai_startups_outreach.json');
  fs.writeFileSync(jsonPath, JSON.stringify(processedData, null, 2), 'utf8');
  console.log(`✅ Backup JSON file successfully written to: ${jsonPath}`);
  
  console.log('=======================================');
  console.log('🏁 Outreach copy generation completed!');
  console.log('=======================================');
}

run().catch(err => {
  console.error('❌ Critical error during AI startups generation:', err);
});
