// All profile content in one place. Facts follow Paul's live portfolio (the source of truth).
export const EMAIL = "paulluiser@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/paul-luiser-vasquez/";
export const RESUME = "./Paul-Luiser-Vasquez-Resume.pdf";

export const NAV = [["teams", "Teams"], ["delivery", "Delivery"], ["ai", "AI"], ["work", "Work"], ["experience", "Experience"], ["contact", "Contact"]];

export const STRENGTHS = ["Leadership", "Communication", "Strategic thinking", "Empathy", "Collaboration", "Adaptability", "Prioritization", "AI fluency", "Quality mindset"];

export const TEAMS = [
  { team: "Business", title: "I turn complexity into clarity.", text: "I translate discovery conversations into business requirements and system specifications." },
  { team: "Design", title: "I give ideas a shared shape.", text: "I coordinate prototypes and walkthroughs so teams can discuss, test, and refine ideas." },
  { team: "Engineering", title: "I align teams around delivery.", text: "I align engineering around agreed requirements, scope, and delivery priorities." },
  { team: "QA", title: "I build confidence in delivery.", text: "I coordinate feature reviews and user acceptance testing against defined requirements." },
  { team: "Stakeholders", title: "I keep people at the center.", text: "I connect stakeholders and delivery teams through discovery, walkthroughs, and clear decisions." },
];

export const AI_MODES = [
  { id: "understand", tab: "Understand", icon: "scan", title: "Requirements intelligence",
    text: "I use AI to find gaps in discovery notes and turn business processes into clear requirements, then validate the business rules with stakeholders.",
    steps: ["Discovery insights", "AI-assisted analysis", "Stakeholder alignment"],
    facts: [["Delivered", "Signed BRD & SRS"], ["Project", "Inventory & accounting"]] },
  { id: "prototype", tab: "Prototype", icon: "layers", title: "Rapid prototyping",
    text: "I use generative and agentic tools to make ideas tangible before committing delivery effort, then let stakeholder feedback decide what moves forward.",
    steps: ["Workflow discovery", "Prototype exploration", "Stakeholder walkthrough"],
    facts: [["Delivered", "High-fidelity prototype"], ["Project", "Operations & tour tracking"]] },
  { id: "automate", tab: "Automate", icon: "zap", title: "Workflow automation",
    text: "I use generative and agentic AI for documentation, research, prototyping, and repetitive project work, which frees my time for decisions and the team.",
    steps: ["Recurring inputs", "AI-assisted drafting", "Human review"],
    facts: [["Output", "Project drafts & structured notes"], ["My review", "Accuracy & sensitivity"]] },
  { id: "research", tab: "Research", icon: "search", title: "Research synthesis",
    text: "I use AI to organize research and surface gaps, then check the original sources before a finding shapes a project decision.",
    steps: ["Gather sources", "Compare findings", "Summarize evidence"],
    facts: [["Output", "Structured findings"], ["My review", "Source checks"]] },
  { id: "validate", tab: "Validate", icon: "checkCircle", title: "Human-led validation",
    text: "",
    steps: ["Set the criteria", "Check the output", "Confirm decisions"],
    facts: [["Reference", "Agreed requirements"], ["Decision", "Stakeholder agreement"]] },
];

export const PROJECTS = [
  { id: "inventory", name: "Enterprise Inventory & Accounting Platform", role: "IT Project Manager · Agile (Scrum)", when: "May – Nov 2026", outcome: "Ready for UAT",
    blurb: "Turned fragmented stock, sales, and procurement records into one signed BRD and SRS, structured with AI-assisted analysis. Passed initial client validation." },
  { id: "hris", name: "HRIS & People Operations Platform", role: "IT Project Manager · Hybrid", when: "Jan – Nov 2026", outcome: "Deployed",
    blurb: "Bridged engineering, QA, and stakeholders to replace slow, inaccurate HR processes. Now running at multinational companies across the Philippines." },
  { id: "streaming", name: "Subscription Streaming Platform", role: "Associate IT Project Manager · Agile (Scrum)", when: "Aug – Oct 2025", outcome: "Live · 120,000+ subscribers",
    blurb: "Coordinated platform development, feature reviews, client walkthroughs, and UAT for a platform now live across the Philippines." },
  { id: "tour", name: "Operations Management & Tour Tracking Suite", role: "Associate IT Project Manager · Waterfall", when: "Jul – Aug 2025", outcome: "Live & deployed",
    blurb: "Led requirements discovery and business analysis, then coordinated a high-fidelity prototype the client could review." },
];

export const STATS = [
  ["18", "Projects led"],
  ["200+", "Stakeholders bridged"],
  ["120,000+", "Highest reach"],
  ["4+", "Years in delivery and research"],
];

export const ROLES = [
  { when: "Dec 2025 – Present", title: "IT Project Manager", org: "Intellismart Technology Inc.", current: true,
    points: ["Lead cross-functional teams across multiple concurrent projects in Jira", "Authored the signed BRD and SRS used across the development lifecycle", "Introduced Agile/Scrum, plus AI-assisted analysis, documentation, research, and prototyping"] },
  { when: "Jun – Oct 2025", title: "Associate IT Project Manager", org: "Go8 Technology Inc.",
    points: ["Coordinated project lifecycles from requirements to post-deployment support", "Ran stakeholder reports, system walkthroughs, and UAT", "Used Google Analytics for change requests and Trello for team workflows"] },
  { when: "Feb – May 2025", title: "Junior Project Management Intern", org: "Go8 Technology Inc.",
    points: ["Initiated requirements gathering and analysis", "Managed documentation, resource allocation, and risk logs"] },
  { when: "Jan 2022 – May 2025", title: "Research Consultant (Delivery Lead)", org: "Freelance · Remote",
    points: ["Turned datasets into action plans and research methodologies", "Facilitated client upskilling and planning on resources, timelines, and milestones"] },
];

// Roadmap: months counted from Jan 2022 (0) to Dec 2026 (60).
export const ROADMAP = {
  startYear: 2022, months: 60, now: 58.5,
  rows: [
    { group: "Roles", label: "IT Project Manager", meta: "Intellismart", s: 47, e: 58.5, kind: "current" },
    { group: "Roles", label: "Associate IT Project Manager", meta: "Go8 Technology", s: 41, e: 46, kind: "solid" },
    { group: "Roles", label: "Junior PM Intern", meta: "Go8 Technology", s: 37, e: 41, kind: "solid" },
    { group: "Roles", label: "Research Consultant (Delivery Lead)", meta: "Freelance", s: 0, e: 41, kind: "solid" },
    { group: "Projects", label: "Inventory & Accounting", meta: "Ready for UAT", s: 52, e: 58.5, kind: "hatch" },
    { group: "Projects", label: "HRIS & People Operations", meta: "Deployed", s: 48, e: 58.5, kind: "hatch" },
    { group: "Projects", label: "Streaming Platform", meta: "Live", s: 43, e: 46, kind: "hatch" },
    { group: "Projects", label: "Ops & Tour Tracking", meta: "Live", s: 42, e: 44, kind: "hatch" },
  ],
};
