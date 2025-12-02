import { Task, Agent, KPI } from "./types";


export const agent_list: Agent[] = [
  { id: 'agent_creative', name: 'Creative Agent', avatar: '🎨' , description: 'Transforms insights into compelling designs, concepts, and storytelling assets powered by Claude-level creativity.'},
  { id: 'agent_media', name: 'Media Agent', avatar: '📡' , description: 'Strategizes and deploys high-impact media and channel activations using Claude-optimized planning intelligence.'},
  { id: 'agent_validation', name: 'Validation Agent', avatar: '🔍', description:'Examines ideas with rigorous analysis and structured evidence to ensure accuracy, feasibility, and effectiveness.'},
]


export var mockTasks: Task[] = [
  {
    "id": "T1",
    "name": "Build Lucky Draw Website",
    "position": { "x": 500, "y": 20 },
    "desc": "Develop the lucky draw entry website with form submission, validation logic, and confirmation flow.",
    "icon": "✨",
    "kpi": [
      { "id": "K1", "name": "Website Deployment", "target": "Website is live and accessible to users", "completed": false, "evidence": "" }
    ],
    "Requirements": [],
    "completed": false,
    "group_members": [agent_list[0]],
    "predecessor": [],
    "successor": ["T2"],
    "discussion_messages": []
  },
  {
    "id": "T2",
    "name": "Send WhatsApp Invitation Campaign",
    "position": { "x": 500, "y": 200 },
    "desc": "Broadcast WhatsApp invitation messages directing users to the lucky draw entry website.",
    "icon": "📡",
    "kpi": [
      { "id": "K3", "name": "Deliver Whatsapp Message", "target": "WhatsApp broadcast message successfully sent", "completed": false, "evidence": "" },
      { "id": "K4", "name": "Click Through Rate", "target": "≥ 40% CTR to website", "completed": false, "evidence": "" }
    ],
    "Requirements": [
      { "id": "R1", "name": "T1 Completion", "target": "Website must be live before campaign", "completed": false, "evidence": "" }
    ],
    "completed": false,
    "group_members": [agent_list[1]],
    "predecessor": ["T1"],
    "successor": ["T3"],
    "discussion_messages": []
  },
  {
    "id": "T3",
    "name": "Distribute Prizes to Winners",
    "position": { "x": 500, "y": 390 },
    "desc": "Draw winners and send WhatsApp notifications to coordinate prize fulfilment.",
    "icon": "✨",
    "kpi": [
      { "id": "K5", "name": "Winner Selection Accuracy", "target": "Correct winners selected from validated participants", "completed": false, "evidence": "" },
      { "id": "K6", "name": "Prize Fulfilment", "target": "100% prizes delivered successfully", "completed": false, "evidence": "" }
    ],
    "Requirements": [
      { "id": "R2", "name": "T2 Completion", "target": "Participant pool finalized", "completed": false, "evidence": "" }
    ],
    "completed": false,
    "group_members": [agent_list[0]],
    "predecessor": ["T2"],
    "successor": ["T4", "T4b"],
    "discussion_messages": []
  },
  {
    "id": "T4b",
    "name": "Build Campaign Insights Dashboard",
    "position": { "x": 260, "y": 580 },
    "desc": "Set up a live dashboard combining website, WhatsApp, and prize fulfilment data for real-time monitoring.",
    "icon": "📊",
    "kpi": [
      {
        "id": "K15",
        "name": "Dashboard Coverage",
        "target": "Key funnel metrics (visits, entries, winners) are visualised",
        "completed": false,
        "evidence": ""
      },
      {
        "id": "K16",
        "name": "Dashboard Freshness",
        "target": "Data refreshes at least every 24 hours",
        "completed": false,
        "evidence": ""
      }
    ],
    "Requirements": [
      {
        "id": "R7",
        "name": "T3 Completion",
        "target": "Winner and participation data available for integration",
        "completed": false,
        "evidence": ""
      }
    ],
    "completed": false,
    "group_members": [agent_list[2]],
    "predecessor": ["T3"],
    "successor": ["T5"],
    "discussion_messages": []
  },
  {
    "id": "T4",
    "name": "Collect Feedback & Insights",
    "position": { "x": 740, "y": 580 },
    "desc": "Collect participant feedback and analyze engagement results for optimization.",
    "icon": "🔍",
    "kpi": [
      { "id": "K11", "name": "Response Rate", "target": "≥ 25% survey response", "completed": false, "evidence": "" },
      { "id": "K12", "name": "Insights Report", "target": "Final performance insight report delivered", "completed": false, "evidence": "" }
    ],
    "Requirements": [
      { "id": "R5", "name": "T3 Completion", "target": "Announcement must be published first", "completed": false, "evidence": "" }
    ],
    "completed": false,
    "group_members": [agent_list[2]],
    "predecessor": ["T3"],
    "successor": ["T5"],
    "discussion_messages": []
  },
  {
    "id": "T5",
    "name": "Full End-to-End QA Audit",
    "position": { "x": 500, "y": 770 },
    "desc": "Validate performance, stability, results accuracy, and user experience across the full journey.",
    "icon": "🔍",
    "kpi": [
      { "id": "K13", "name": "Error Rate", "target": "≤ 2% operational process errors", "completed": false, "evidence": "" },
      { "id": "K14", "name": "Satisfaction Score", "target": "≥ 90% positive feedback", "completed": false, "evidence": "" }
    ],
    "Requirements": [
      { "id": "R6", "name": "T6 Completion", "target": "Feedback cycle must be finished first", "completed": false, "evidence": "" }
    ],
    "completed": false,
    "group_members": [agent_list[2]],
    "predecessor": ["T4", "T4b"],
    "successor": [],
    "discussion_messages": []
  }
]



export var mockTasks2: Task[] = [
  {
    id: "task_1",
    name: "Trust & Badging Overhaul",
    desc:
      "Design and apply '100% Original' watermarks to all listings and submit Shopee Mall/LazMall applications to secure the authenticity badge.",
    icon: "🛡️",
    completed: false,
    group_members: [
      {
        id: "agent_creative",
        name: "Creative Agent",
        description:
          "Specialist in visual design, branding, and content creation.",
        avatar: "✨",
      },
    ],
    kpi: [
      {
        id: "kpi_1_1",
        name: "Mall Status Application",
        target: "Submitted & Approved",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_1_2",
        name: "Listing Updates",
        target: "100% Listings Watermarked",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: [],
    successor: ["task_3", "task_4"],
    Requirements: [],
    discussion_messages: [],
    position: { x: 100, y: 50 },
  },
  {
    id: "task_2",
    name: "Logistics Partner Migration",
    desc:
      "Switch backend logistics preferences to J&T Express/NinjaVan for reliable doorstep delivery and enable Instant Delivery for high-value items.",
    icon: "🚚",
    completed: false,
    group_members: [
      {
        id: "agent_media",
        name: "Media Agent",
        description:
          "Expert in channel deployment, platform configuration, and distribution.",
        avatar: "📡",
      },
    ],
    kpi: [
      {
        id: "kpi_2_1",
        name: "Courier Switch",
        target: "100% Migration to J&T/NinjaVan",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_2_2",
        name: "Delivery Reliability",
        target: "Late Delivery Rate < 1%",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: [],
    successor: ["task_5"],
    Requirements: [],
    discussion_messages: [],
    position: { x: 500, y: 50 },
  },
  {
    id: "task_3",
    name: "Smart Bundle Configuration",
    desc:
      "Configure 'Add-on Deals' (PWP) in the seller center to create bundles that hit the RM40+ free shipping threshold.",
    icon: "📦",
    completed: false,
    group_members: [
      {
        id: "agent_media",
        name: "Media Agent",
        description:
          "Expert in channel deployment, platform configuration, and distribution.",
        avatar: "📡",
      },
    ],
    kpi: [
      {
        id: "kpi_3_1",
        name: "Bundle Activation",
        target: "5 Active PWP Configurations",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_3_2",
        name: "AOV Uplift",
        target: "Average Order Value > RM75",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: ["task_1"],
    successor: ["task_7"],
    Requirements: [],
    discussion_messages: [],
    position: { x: 100, y: 350 },
  },
  {
    id: "task_4",
    name: "Retention Packaging Design",
    desc:
      "Design premium 'Tamper-Proof' packaging and physical 'Thank You' inserts with QR codes for next-purchase vouchers.",
    icon: "🎁",
    completed: false,
    group_members: [
      {
        id: "agent_creative",
        name: "Creative Agent",
        description:
          "Specialist in visual design, branding, and content creation.",
        avatar: "✨",
      },
    ],
    kpi: [
      {
        id: "kpi_4_1",
        name: "Packaging Production",
        target: "Prototypes Approved",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_4_2",
        name: "QR Engagement",
        target: "Scan Rate > 5%",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: ["task_1"],
    successor: ["task_7"],
    Requirements: [],
    discussion_messages: [],
    position: { x: 300, y: 350 },
  },
  {
    id: "task_5",
    name: "WhatsApp CRM Integration",
    desc:
      "Set up WhatsApp Business API (e.g., SleekFlow/Wati) and integrate with the order system for real-time tracking updates.",
    icon: "💬",
    completed: false,
    group_members: [
      {
        id: "agent_media",
        name: "Media Agent",
        description:
          "Expert in channel deployment, platform configuration, and distribution.",
        avatar: "📡",
      },
    ],
    kpi: [
      {
        id: "kpi_5_1",
        name: "API Connectivity",
        target: "Successful Order Sync",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_5_2",
        name: "Message Delivery",
        target: "Delivery Rate > 98%",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: ["task_2"],
    successor: ["task_6"],
    Requirements: [],
    discussion_messages: [],
    position: { x: 500, y: 350 },
  },
  {
    id: "task_6",
    name: "Retention Messaging Flows",
    desc:
      "Script and configure the automated 'Replenishment Nudge' messages to be sent 30 days post-purchase.",
    icon: "✍️",
    completed: false,
    group_members: [
      {
        id: "agent_creative",
        name: "Creative Agent",
        description:
          "Specialist in visual design, branding, and content creation.",
        avatar: "✨",
      },
    ],
    kpi: [
      {
        id: "kpi_6_1",
        name: "Flow Activation",
        target: "Scripts Approved & Live",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_6_2",
        name: "Reorder Rate",
        target: "Conversion > 15%",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: ["task_5"],
    successor: ["task_7"],
    Requirements: [],
    discussion_messages: [],
    position: { x: 500, y: 650 },
  },
  {
    id: "task_7",
    name: "End-to-End Validation",
    desc:
      "Conduct full QA testing of the customer journey: Bundle Purchase -> Logistics Update -> Unboxing -> WhatsApp Nudge.",
    icon: "🔍",
    completed: false,
    group_members: [
      {
        id: "agent_validation",
        name: "Validation Agent",
        description:
          "Responsible for QA testing, logic validation, and feasibility checks.",
        avatar: "🔍",
      },
    ],
    kpi: [
      {
        id: "kpi_7_1",
        name: "System Integrity",
        target: "0 Critical Errors",
        completed: false,
        evidence: "",
      },
      {
        id: "kpi_7_2",
        name: "Launch Readiness",
        target: "Final Sign-off Obtained",
        completed: false,
        evidence: "",
      },
    ],
    predecessor: ["task_3", "task_4", "task_6"],
    successor: [],
    Requirements: [],
    discussion_messages: [],
    position: { x: 300, y: 950 },
  }
]