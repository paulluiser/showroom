const guides = {
  home: {
    label: "Welcome to the showroom",
    message:
      "I connect business needs and software teams, using AI to support clear requirements and delivery.",
    next: "intelligence",
    action: "Explore AI capabilities",
  },
  intelligence: {
    label: "Intelligence, applied",
    message:
      "I use AI to analyze requirements, structure documentation, prototype ideas, and streamline project workflows.",
    next: "work",
    action: "Discover selected work",
  },
  work: {
    label: "Inside the work",
    message:
      "I coordinate delivery across enterprise systems, digital platforms, prototypes, and HRIS.",
    next: "experience",
    action: "Explore my experience",
  },
  experience: {
    label: "The person behind delivery",
    message:
      "I bring a computer science foundation and research experience to IT project management.",
    next: "contact",
    action: "Connect with Paul",
  },
  contact: {
    label: "A conversation starts here",
    message:
      "I’m open to IT Project Management and Product Manager/Owner opportunities. Reach me at paulluiser@gmail.com.",
    next: "home",
    action: "Back to the beginning",
  },
};
export function guideFor(id) {
  return guides[id] || guides.home;
}
export const workflows = [
  {
    label: "Understand",
    form: "lightbulb",
    title: "Requirements intelligence",
    short: "Find the signal.",
    description:
      "I use AI to find gaps in discovery notes and turn business processes into clear requirements. For the inventory-accounting platform, I authored the signed business requirements and system specifications with AI-assisted analysis. I validate business rules and secure stakeholder agreement before finalizing the work.",
    steps: [
      ["notes", "Discovery insights", "I turn discovery notes into questions and requirements."],
      ["analysis", "AI-assisted analysis", "I surface gaps and clarify business rules with AI."],
      ["alignment", "Stakeholder alignment", "I confirm requirements with the people who use them."],
    ],
    proof: [
      ["Business requirements", "Signed BRD"],
      ["System specifications", "SRS"],
      ["Project", "Inventory & accounting"],
    ],
    input: "Discovery notes & business processes",
    process: "Analyze · challenge · structure",
    output: "Requirements ready for stakeholder review",
    detail:
      "Human checkpoint: validate business rules and secure stakeholder agreement.",
  },
  {
    label: "Prototype",
    form: "hammer",
    title: "Rapid prototyping",
    short: "Make ideas tangible.",
    description:
      "I use generative and agentic tools to make ideas tangible before committing delivery effort. For the operations management and tour tracking suite, I led discovery and coordinated a high-fidelity prototype. I test concepts against user needs and project scope, then use stakeholder feedback to decide what moves forward.",
    steps: [
      ["map", "Workflow discovery", "I map the user’s task and the decisions it requires."],
      ["prototype", "Prototype exploration", "I use AI to explore interface and workflow options."],
      ["alignment", "Stakeholder walkthrough", "I test the concept with stakeholders before delivery."],
    ],
    proof: [
      ["My role", "Discovery & coordination"],
      ["Deliverable", "High-fidelity prototype"],
      ["Project", "Operations & tour tracking"],
    ],
    input: "Business problem & user workflow",
    process: "Explore · prototype · iterate",
    output: "A tangible concept for discussion",
    detail:
      "Human checkpoint: test assumptions against actual user and delivery needs.",
  },
  {
    label: "Automate",
    form: "gear",
    title: "Workflow automation",
    short: "Create space to lead.",
    description:
      "I use generative and agentic AI to support documentation, research, prototyping, and repetitive project workflows, giving me more time for decisions and team coordination. I review the accuracy, relevance, and sensitivity of the output before I use it or share it with stakeholders.",
    steps: [
      ["inbox", "Recurring inputs", "I gather the notes and context a task needs."],
      ["draft", "AI-assisted drafting", "I use AI to structure drafts and research notes."],
      ["review", "Human review", "I check accuracy and sensitivity before sharing."],
    ],
    proof: [
      ["Documentation", "Project drafts"],
      ["Research", "Structured notes"],
      ["My review", "Accuracy & sensitivity"],
    ],
    input: "Recurring tasks & project context",
    process: "Structure · assist · review",
    output: "Drafts and insights for informed action",
    detail:
      "Human checkpoint: review accuracy, relevance, and sensitive information.",
  },
  {
    label: "Research",
    form: "open book",
    title: "Research synthesis",
    description:
      "I use AI to organize research and bring related findings together. I check the original sources, flag what still needs investigation, and turn the findings into notes I can use for project decisions.",
    steps: [
      ["sources", "Gather sources", "I collect references and frame the question."],
      ["compare", "Compare findings", "I use AI to organize themes and surface gaps."],
      ["insight", "Summarize evidence", "I check the sources before sharing a conclusion."],
    ],
    proof: [
      ["Input", "Research sources"],
      ["Output", "Structured findings"],
      ["My review", "Source checks"],
    ],
  },
  {
    label: "Validate",
    form: "check mark",
    title: "Human-led validation",
    description:
      "I review AI-assisted drafts against the original requirements and business rules before I use them. I flag uncertainty and check sensitive information, then bring decisions that need agreement back to the stakeholders.",
    steps: [
      ["criteria", "Set the criteria", "I start with agreed requirements and business rules."],
      ["verify", "Check the output", "I compare the draft against the source material."],
      ["alignment", "Confirm decisions", "I bring unresolved questions back to stakeholders."],
    ],
    proof: [
      ["Reference", "Agreed requirements"],
      ["My review", "Accuracy & sensitivity"],
      ["Decision", "Stakeholder agreement"],
    ],
  },
];
export const projects = [
  {
    name: "HRIS & People Operations Platform",
    category: "Human Resource Information System",
    milestone: "Deployed to multinational companies around the Philippines.",
    problem: "Traditional, inaccurate, and time-consuming human resource processes.",
    date: "Dec 2025 — Nov 2026",
    company: "",
    summary:
      "I bridged engineering, QA, and stakeholders throughout HRIS delivery.",
    tags: [],
    role: "IT Project Manager",
    context:
      "An HRIS addressing traditional, inaccurate, and time-consuming HR processes, now deployed to multinational companies around the Philippines.",
    contributions: [
      "I served as IT Project Manager, bridging engineering, QA, and stakeholders.",
    ],
    evidence: "Focus: cross-functional coordination and stakeholder alignment.",
    art: "hris",
  },
  {
    name: "Enterprise Inventory & Accounting Platform",
    category: "Enterprise systems",
    date: "May - Nov 2026",
    methodology: "Agile Scrum",
    milestone: "Passed initial client validation and ready for UAT.",
    problem: "Untracked stocks, sales, and procurement orders caused by fragmented records and no single, unified platform.",
    company: "Intellismart Technology Inc.",
    summary:
      "I translated client operations into signed business requirements and system specifications.",
    tags: [
      "Requirements engineering",
      "Scope & change control",
      "AI-assisted analysis",
    ],
    role: "IT Project Manager",
    context:
      "An enterprise inventory-accounting system requiring a shared understanding of client operations, pain points, and system requirements.",
    contributions: [
      "I led client data-gathering sessions to understand current processes and needs.",
      "I authored the signed Business Requirements Document (BRD) and System Requirements Specification (SRS) used across the software development lifecycle.",
      "I applied AI-assisted analysis to identify requirement gaps and structure specifications.",
      "I facilitated change request management.",
    ],
    evidence:
      "Documented deliverable: Signed business requirements and system specifications.",
    art: "enterprise",
  },
  {
    name: "Subscription Streaming Platform",
    category: "Subscription streaming",
    milestone: "Live with more than 120,000 subscribers in the Philippines.",
    date: "Aug — Oct 2025",
    company: "Go8 Technology Inc.",
    summary:
      "I coordinated the platform development, feature reviews, and user acceptance testing.",
    tags: ["Cross-functional delivery", "Client walkthroughs", "UAT"],
    role: "Associate IT Project Manager",
    context:
      "A subscription streaming platform connecting business requirements with cross-functional development, now live with more than 120,000 subscribers in the Philippines.",
    contributions: [
      "I coordinated cross-functional teams through end-to-end platform development and delivery.",
      "I facilitated client walkthroughs and user acceptance testing (UAT) sessions.",
      "I reviewed features against defined requirements to support stakeholder validation.",
    ],
    evidence:
      "Live platform with more than 120,000 subscribers in the Philippines; my work covered development coordination, feature reviews, and UAT.",
    art: "streaming",
  },
  {
    name: "Operations Management & Tour Tracking Suite",
    category: "Operations & tour tracking",
    milestone: "The tour tracking system is now live and deployed.",
    date: "Jul — Aug 2025",
    company: "Go8 Technology Inc.",
    summary:
      "I led discovery and coordinated delivery of a high-fidelity prototype.",
    tags: ["Business analysis", "Client alignment", "Prototyping"],
    role: "Associate IT Project Manager",
    context:
      "An internal management website and tour tracking application, developed from requirements discovery and a high-fidelity prototype. The tour tracking system is now live and deployed.",
    contributions: [
      "I led requirements gathering, client communication, and business analysis.",
      "I coordinated the development lifecycle through delivery of a high-fidelity prototype.",
    ],
    evidence: "Documented deliverable: high-fidelity prototype.",
    art: "operations",
  },
];

const examples = [
  {
    applicationTitle: "In practice: enterprise requirements",
    application:
      "I used AI-assisted analysis to identify requirement gaps and structure specifications for the inventory-accounting platform. I authored the signed business requirements and system specifications.",
    exampleQuestion: "Who can approve an inventory adjustment?",
    exampleAssist:
      "Surface missing approval roles, permissions, and exception cases in the discovery notes.",
    exampleReview:
      "Confirm the rule with stakeholders before adding it to the specification.",
  },
  {
    applicationTitle: "Relevant work: operations & tour tracking",
    application:
      "I led discovery and coordinated delivery of a high-fidelity prototype. My AI toolkit supports early exploration; stakeholder feedback determines what moves forward.",
    exampleQuestion: "How should a tour coordinator review a delayed stop?",
    exampleAssist:
      "Explore a few interface and workflow alternatives for discussion.",
    exampleReview:
      "Validate the proposed flow with the user's actual task and project scope.",
  },
  {
    applicationTitle: "In practice: project workflows",
    application:
      "Across my project management work, I use generative and agentic AI for documentation, research, prototyping, and repetitive processes.",
    exampleQuestion: "What needs a decision before the next project update?",
    exampleAssist:
      "Organize project notes into risks, open questions, and draft follow-ups.",
    exampleReview:
      "Check each item against the source and choose what needs a stakeholder decision.",
  },
];
workflows.forEach((workflow, index) =>
  Object.assign(workflow, examples[index]),
);

export const career = [
  {
    title: "IT Project Manager",
    company: "Intellismart Technology Inc.",
    date: "December 2025 — Present",
    summary:
      "I lead software teams from business discovery to coordinated delivery.",
    focus: "Requirements · Delivery leadership · AI workflows",
    details: [
      "I lead cross-functional teams and manage multiple concurrent projects using Jira.",
      "I authored the signed Business Requirements Document and System Requirements Specification used across the development lifecycle.",
      "I introduced Agile/Scrum across active projects and integrated AI-assisted analysis, documentation, research, and prototyping.",
    ],
  },
  {
    title: "Associate IT Project Manager",
    company: "Go8 Technology Inc.",
    date: "June — October 2025",
    summary:
      "I connected clients and delivery teams around clear requirements and acceptance criteria.",
    focus: "Stakeholder alignment · UAT · Process improvement",
    details: [
      "I coordinated project lifecycles from requirements gathering through post-deployment support.",
      "I managed stakeholder communication, reports, system walkthroughs, and user acceptance testing.",
      "I used Google Analytics to inform change requests and Trello to improve internal workflows.",
    ],
  },
  {
    title: "Junior Project Management Intern",
    company: "Go8 Technology Inc.",
    date: "February — May 2025",
    summary:
      "I supported requirements discovery, team coordination, and project control.",
    focus: "Discovery · Documentation · Risk tracking",
    details: [
      "I initiated requirements gathering and analysis while coordinating collaboration against target timelines.",
      "I managed project documentation, resource allocation, and risk logs.",
    ],
  },
  {
    title: "Research Consultant",
    company: "Freelance · Remote",
    date: "January 2022 — May 2025",
    summary:
      "I translated research and data into actionable plans for my clients.",
    focus: "Analysis · Client guidance · Research methods",
    details: [
      "I analyzed datasets, developed action plans, and proposed research methodologies.",
      "I facilitated client upskilling and strategic discussions on resources, timelines, and milestones.",
    ],
  },
];
