// lib/types.ts

// Who is talking?

export interface DiscussionFile {
  id: string;          // DB id or storage key
  name: string;        // "screenshot.png"
  url: string;         // signed URL / CDN path
  mimeType: string;    // "image/png", "application/pdf"
  sizeBytes?: number;
}


export type MessageContentBlock =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'file';
      file: DiscussionFile;
    };

export interface DiscussionMessage {
  id: string;
  createdAt: string; // ISO timestamp
  senderType: string;
  senderId?: string;          // userId OR agentId (depending on senderType)
  senderLabel?: string;       // e.g. "Helen", "Optimization Agent"

  // core content
  content: MessageContentBlock[];

  // optional: what this message is attached to
  taskId?: string;            // e.g. "T3"
  replyToMessageId?: string;  // for threads

  metadata?: Record<string, any>;
} 

// I've added these helper types based on your Task type
export interface KPI {
  id: string;
  name: string;
  target: string;
  completed: boolean;
  evidence: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string; // Using avatar for a potential UI
  description: string;
}

// Your Task type
export interface Task {
  id: string;
  position: { x: number; y: number }; // For canvas positioning
  name: string;     // This will be the title
  desc: string;
  icon: string;     // This is the emoji
  kpi: KPI[];
  Requirements: KPI[];
  completed: boolean;
  group_members: Agent[];
  predecessor: string[];
  successor: string[]; // We use this to draw the arrows
  discussion_messages: DiscussionMessage[];
}

export interface Project {
  title: string;
  description: string;
  tasks: Task[];
  progress: number;
}

