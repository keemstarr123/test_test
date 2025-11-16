import { Task, Agent, KPI } from "./types";


export const agent_list: Agent[] = [
  { id: 'A1', name: 'Creative Agent', avatar: '🎨' , description: 'Transforms insights into compelling designs, concepts, and storytelling assets powered by Claude-level creativity.'},
  { id: 'A2', name: 'Media Agent', avatar: '📡' , description: 'Strategizes and deploys high-impact media and channel activations using Claude-optimized planning intelligence.'},
  { id: 'A3', name: 'Validation Agent', avatar: '🔍', description:'Examines ideas with rigorous analysis and structured evidence to ensure accuracy, feasibility, and effectiveness.'},
]


export var mockTasks: Task[] = [
  {
    id: 'T1',
    name: 'Design Post-Purchase Communication Flow',
    desc: 'Create structured WhatsApp-first message pathways for confirmation, dispatch, tracking, delay alerts, and feedback requests.',
    icon: '✨',
    completed: false,
    group_members: [agent_list[0]], // Strategy / CX / Orchestration agent
    predecessor: [],
    successor: ['T2', 'T3', 'T4'],
    Requirements: [],
    kpi: [
      {
        id: 'K1',
        name: 'Message Flow Blueprint',
        target: 'End-to-end flow mapped in Figma / Miro for all key post-purchase touchpoints.',
        completed: false,
        evidence: ''
      },
      {
        id: 'K2',
        name: 'Copywriting Draft Completed',
        target: 'All core WhatsApp templates drafted (confirmation, dispatch, delay, feedback).',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  },

  {
    id: 'T2',
    name: 'Build Delivery Reschedule Portal Front-End',
    desc: 'Create customer self-service interface for selecting or changing delivery times.',
    icon: '✨',
    completed: false,
    group_members: [agent_list[1]], // Creative / Product UI Agent
    predecessor: ['T1'],
    successor: ['T7'],
    Requirements: [
      {
        id: 'R1',
        name: 'T1 · Design Post-Purchase Communication Flow',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      }
    ],
    kpi: [
      {
        id: 'K4',
        name: 'Portal UI/UX Completion',
        target: 'Responsive reschedule portal with key states (select slot, confirm, success, error).',
        completed: false,
        evidence: ''
      },
      {
        id: 'K5',
        name: 'Task Completion Usability Score',
        target: '≥ 80% of test users can reschedule in under 3 clicks without assistance.',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  },

  {
    id: 'T3',
    name: 'Deploy Automated Multi-Channel Messaging Campaign',
    desc: 'Launch the automated WhatsApp and email order journey including tracking, ETA and delay updates.',
    icon: '📡',
    completed: false,
    group_members: [agent_list[2]], // Media / Automation Agent
    predecessor: ['T1'],
    successor: ['T7'],
    Requirements: [

    ],
    kpi: [
      {
        id: 'K6',
        name: 'Automation Delivery Rate',
        target: '≥ 98% successful send rate across WhatsApp and email for all triggered messages.',
        completed: false,
        evidence: ''
      },
      {
        id: 'K7',
        name: 'Tracking Link Engagement',
        target: '≥ 35% CTR on tracking links for high-value segments within first 30 days.',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  },

  {
    id: 'T4',
    name: 'Design Rumahku Loyalty & Rewards Dashboard',
    desc: 'Create UI for redemption of points and delivery fee reward visibility.',
    icon: '✨',
    completed: false,
    group_members: [agent_list[1]], // Creative Agent again
    predecessor: ['T1'],
    successor: ['T5', 'T7'],
    Requirements: [
      {
        id: 'R3',
        name: 'T1 · Design Post-Purchase Communication Flow',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      }
    ],
    kpi: [
      {
        id: 'K8',
        name: 'Rewards Dashboard Mockups',
        target: 'Finalized high-fidelity mockups approved by product and brand teams.',
        completed: false,
        evidence: ''
      },
      {
        id: 'K9',
        name: 'Reward Workflow Clarity',
        target: 'Users can explain how to earn and redeem points after a 1-minute walkthrough.',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  },

  {
    id: 'T5',
    name: 'Launch On-Time Delivery Cashback Rollout',
    desc: 'Deploy marketing announcement and automation journey to execute RM5 e-wallet rebates.',
    icon: '📡',
    completed: false,
    group_members: [agent_list[2]], // Media Agent
    predecessor: ['T4'],
    successor: ['T7'],
    Requirements: [
      {
        id: 'R4',
        name: 'T4 · Design Rumahku Loyalty & Rewards Dashboard',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      }
    ],
    kpi: [
      {
        id: 'K10',
        name: 'Cashback Redemption Activation',
        target: '≥ 70% of eligible customers successfully receive and can redeem cashback.',
        completed: false,
        evidence: ''
      },
      {
        id: 'K11',
        name: 'Repeat Purchase Lift',
        target: '≥ 5% uplift in 60-day repeat purchase rate among cashback recipients.',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  },

  {
    id: 'T6',
    name: 'Deploy Courier Performance & SLA Dashboard Campaign',
    desc: 'Publish campaign messaging promoting improved delivery speed and transparency based on SLA achievement data.',
    icon: '📡',
    completed: false,
    group_members: [agent_list[2]], // Media Agent
    predecessor: [],
    successor: [],
    Requirements: [],
    kpi: [
      {
        id: 'K12',
        name: 'Campaign Awareness Reach',
        target: 'Hit planned impressions / reach for “delivery reliability” messaging across key channels.',
        completed: false,
        evidence: ''
      },
      {
        id: 'K13',
        name: 'NPS / Uplift Impact Tracking',
        target: 'Measure NPS or CSAT shift in segments exposed to the campaign vs control.',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  },

  {
    id: 'T7',
    name: 'Full Journey End-to-End QA Validation',
    desc: 'Test tracking flows, portal usage, cashback triggers, and proactive notifications.',
    icon: '🔍',
    completed: false,
    group_members: [agent_list[3]], // Validation / QA Agent
    predecessor: ['T2', 'T3', 'T4', 'T5'],
    successor: [],
    Requirements: [
      {
        id: 'R5',
        name: 'T2 · Build Delivery Reschedule Portal Front-End',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      },
      {
        id: 'R6',
        name: 'T3 · Deploy Automated Multi-Channel Messaging Campaign',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      },
      {
        id: 'R7',
        name: 'T4 · Design Rumahku Loyalty & Rewards Dashboard',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      },
      {
        id: 'R8',
        name: 'T5 · Launch On-Time Delivery Cashback Rollout',
        target: 'Must be done first before this feature unlocks.',
        completed: false,
        evidence: ''
      }
    ],
    kpi: [
      {
        id: 'K14',
        name: 'Error Rate Threshold',
        target: 'End-to-end post-purchase journey runs with ≤ 2% functional error rate.',
        completed: false,
        evidence: ''
      },
      {
        id: 'K15',
        name: 'Launch Readiness Approval',
        target: 'QA, CX, and stakeholder sign-off obtained for go-live.',
        completed: false,
        evidence: ''
      }
    ],
    discussion_messages: []
  }
];
