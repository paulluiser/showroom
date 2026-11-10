import { projects } from './content.js';
import { INVENTORY_PATH } from './projectMagic.js';

const studies = {
  enterprise: {
    path: INVENTORY_PATH,
    title: ['Inventory &', 'accounting.'],
    intro: 'I led the requirements work for an enterprise inventory and accounting platform.',
    challenge: {
      lead: 'Stocks, sales, and procurement orders were difficult to track.',
      body: 'I worked with a business whose records were fragmented across operations. Without a single, unified platform, it was difficult to see how stock, sales, and procurement connected. I needed to turn those gaps into a shared set of requirements.',
    },
    approach: [
      ['I started with the people doing the work.', 'I led client data-gathering sessions to understand current processes, needs, and pain points.'],
      ['I made the requirements explicit.', 'I translated discovery into a signed Business Requirements Document and System Requirements Specification. I used AI-assisted analysis to identify gaps and structure the specifications.'],
      ['I kept scope and change visible.', 'I used Agile Scrum and facilitated change request management, keeping stakeholder agreement and business rules central to the requirements work.'],
    ],
    deliverables: {
      body: 'I authored the signed BRD and SRS used across the software development lifecycle.',
      items: [
        ['BRD', 'Business requirements', 'I defined the agreed business needs.'],
        ['SRS', 'System specifications', 'I structured the system requirements for delivery.'],
      ],
    },
    outcome: {
      label: 'Current milestone', status: 'Initial client validation passed', title: 'Ready for UAT.',
      body: 'The platform passed initial client validation and is now ready for user acceptance testing.',
    },
  },
  hris: {
    path: '/projects/hris',
    title: ['HRIS &', 'people operations.'],
    intro: 'I managed HRIS delivery, bridging engineering, QA, and stakeholders to address slow and inaccurate HR processes.',
    facts: [['System', 'Human Resource Information System'], ['Deployment', 'Multinational companies in the Philippines']],
    challenge: {
      lead: 'Traditional HR processes were inaccurate and time-consuming.',
      body: 'I worked on an HRIS project addressing the limitations of traditional human resource processes. As IT Project Manager, I connected the stakeholders, engineers, and QA team throughout delivery.',
    },
    approach: [
      ['I bridged stakeholders and engineering.', 'I connected the people representing HR needs with the engineering team, keeping both perspectives involved in the delivery process.'],
      ['I kept quality part of the team conversation.', 'I bridged engineering, QA, and stakeholders throughout the project. My responsibility was cross-functional coordination across the groups building, testing, and reviewing the system.'],
    ],
    outcome: {
      label: 'Deployment', status: 'Deployed', title: 'Supporting multinational companies.',
      body: 'The HRIS is now deployed to multinational companies around the Philippines. I served as IT Project Manager, bridging engineering, QA, and stakeholders throughout its delivery.',
    },
  },
  streaming: {
    path: '/projects/subscription-streaming',
    title: ['Subscription', 'streaming platform.'],
    intro: 'I coordinated end-to-end platform development, feature reviews, and user acceptance testing for a subscription streaming platform.',
    facts: [['Platform reach', '120,000+ subscribers in the Philippines']],
    challenge: {
      lead: 'Platform development needed a shared direction from requirements through validation.',
      body: 'I worked across business requirements and cross-functional implementation. I needed to keep feature development aligned with the defined requirements and bring clients into the review and acceptance process.',
    },
    approach: [
      ['I coordinated cross-functional delivery.', 'I coordinated the platform development across the delivery team, connecting implementation with the defined business requirements.'],
      ['I reviewed the features against the requirements.', 'I reviewed system features against the agreed requirements to support stakeholder validation.'],
      ['I brought clients into the validation process.', 'I facilitated client system walkthroughs and user acceptance testing sessions so functionality could be reviewed with the people accepting the work.'],
    ],
    deliverables: {
      body: 'I combined development coordination, feature reviews, client walkthroughs, and UAT as part of the platform delivery.',
      items: [
        ['Review', 'Feature alignment', 'I reviewed system features against defined requirements.'],
        ['UAT', 'Client validation', 'I facilitated client walkthroughs and user acceptance testing sessions.'],
      ],
    },
    outcome: {
      label: 'Live platform', status: 'Live in the Philippines', title: '120,000+ subscribers.',
      body: 'The platform is now live with more than 120,000 subscribers in the Philippines. My contribution covered platform development coordination, feature reviews, client walkthroughs, and UAT.',
    },
  },
  operations: {
    path: '/projects/operations-tour-tracking',
    title: ['Operations &', 'tour tracking.'],
    intro: 'I led requirements discovery and coordinated a high-fidelity prototype for an operations management website and tour tracking app.',
    facts: [['Tour tracking', 'Live & deployed']],
    challenge: {
      lead: 'Client objectives needed to become a clear direction for two connected experiences.',
      body: 'I worked on an internal management website and a tour tracking application. I needed to translate client objectives into requirements and guide the work from discovery into a high-fidelity prototype.',
    },
    approach: [
      ['I started with the client’s objectives.', 'I led system requirements gathering, client communication, and business analysis to align the work with client objectives.'],
      ['I connected discovery to a tangible prototype.', 'I coordinated the development lifecycle through delivery of a high-fidelity prototype, bringing the requirements into a form the client could review.'],
    ],
    deliverables: {
      body: 'I coordinated a high-fidelity prototype for the internal management website and tour tracking app.',
      items: [
        ['Discovery', 'Requirements & analysis', 'I led requirements gathering, business analysis, and client communication.'],
        ['Prototype', 'A high-fidelity experience', 'I coordinated the development lifecycle through delivery of the prototype.'],
      ],
    },
    outcome: {
      label: 'Deployment', status: 'Live & deployed', title: 'Tour tracking is live.',
      body: 'The tour tracking system is now live and deployed. I led requirements discovery and client communication, and coordinated the development lifecycle through delivery of a high-fidelity prototype.',
    },
  },
};

export const projectCases = Object.entries(studies).map(([art, study]) => ({ ...study, project: projects.find(project => project.art === art) }));

export function projectCaseForPath(path) {
  return projectCases.find(study => study.path === path.replace(/\/$/, ''));
}

export function projectCaseForArt(art) {
  return projectCases.find(study => study.project.art === art);
}
