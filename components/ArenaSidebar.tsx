'use client';

import { useEffect, useState, useRef } from 'react';
import { Paperclip, Send, Check, Plus } from 'lucide-react';
import type { Task, DiscussionMessage, Agent, KPI } from '@/lib/types';
import { agent_list } from '@/lib/data';

type ArenaSidebarProps = {
  task?: Task | null;
  onKPIUpdate?: (taskId: string, kpiId: string, updates: Partial<KPI>) => void;
};

type FlowStage = 'idle' | 'askedCopyHelp' | 'copyDone';

type Message = DiscussionMessage & {
  from: 'agent' | 'you';
  senderId?: string;
  senderLabel?: string;
};

type AddMessageOptions = {
  senderId?: string;
  senderLabel?: string;
};

// 🔌 map agent.id → backend endpoint
const AGENT_ENDPOINTS: Record<string, string> = {
  agent_creative: 'https://specialized-agent.onrender.com/creative',
  agent_media: 'https://specialized-agent.onrender.com/media',
  // add more here if you create more agents
};

const LUCKY_DRAW_WORKFLOW_STEPS = [
  '🔍 Looking for relevant project files in GitHub (metadata.json, index.html, index.tsx, types.ts, services/geminiService.ts)…',
  '🧩 Updating lucky draw components in constants.ts and types.ts…',
  '⚙️ Adjusting business logic in services/geminiService.ts…',
  '🚀 Deploying updated lucky draw website to hosting…',
  '✅ Done! The lucky draw website is now updated and live.',
];

const WHATSAPP_MESSAGE_STEPS = [
  '👤 Identifying the correct recipient from DataLake…',
  '✏️ Framing message content based on context and intent…',
  '📤 Sending WhatsApp message via API…',
  '✅ Message successfully delivered!',
];

export default function ArenaSidebar({ task, onKPIUpdate }: ArenaSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [members, setMembers] = useState<Agent[]>([]);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [workflowStepIndex, setWorkflowStepIndex] = useState<number | null>(null);
  const [workflowStepIndex2, setWorkflowStepIndex2] = useState<number | null>(null);
  const [flowStage, setFlowStage] = useState<FlowStage>('idle');

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const hasTask = !!task;

  // 🔐 requirement lock
  const blockedByRequirements =
    !!task?.Requirements && task.Requirements.some((r) => !r.completed);

  // 🔎 pick a default agent (for welcome + workflows)
  const resolveDefaultAgent = (): Agent => {
    if (members.length) return members[0];
    if (task?.group_members?.length) return task.group_members[0]!;
    return agent_list[0];
  };

  // 🔎 find which agent a message belongs to (by senderId)
  const findAgentForMessage = (msg: Message): Agent | undefined => {
    if (!msg.senderId) return undefined;
    return (
      members.find(a => a.id === msg.senderId) ||
      task?.group_members?.find(a => a.id === msg.senderId) ||
      agent_list.find(a => a.id === msg.senderId)
    );
  };

  // 🔄 reset when task changes
  useEffect(() => {
    if (!task) {
      setMessages([]);
      setAttachedFiles([]);
      setMembers([]);
      setFlowStage('idle');
      return;
    }

    setFlowStage('idle');
    setMembers(task.group_members ?? []);

    if (task.discussion_messages?.length) {
      setMessages(
        task.discussion_messages.map((m): Message => ({
          ...m,
          from: m.senderType === 'agent' ? 'agent' : 'you',
        }))
      );
    } else {
      const kpiList = task.kpi
        ?.map(k => `• ${k.name} — ${k.completed ? "Completed" : "Pending"}`)
        ?.join("\n");

      const defaultAgent = task.group_members?.[0] ?? agent_list[0];

      const placeholder: Message = {
        id: "welcome",
        createdAt: new Date().toISOString(),
        senderType: "agent",
        from: "agent",
        senderId: defaultAgent.id,
        senderLabel: defaultAgent.name,
        content: [
          {
            type: "text",
            text: `👋 Hi there! I'm ${defaultAgent.name}. How can I help you with "${task.name}" today?\n\nHere are the current KPIs:\n${kpiList}`
          }
        ],
        metadata: {}
      };

      setMessages([placeholder]);
    }

    setAttachedFiles([]);
  }, [task?.id]);

  // always scroll to bottom on new messages
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // 🧠 Lucky draw workflow
  useEffect(() => {
    if (workflowStepIndex === null || !task) return;

    if (workflowStepIndex >= LUCKY_DRAW_WORKFLOW_STEPS.length) {
      setWorkflowStepIndex(null);
      return;
    }

    const timeout = setTimeout(() => {
      const text = LUCKY_DRAW_WORKFLOW_STEPS[workflowStepIndex];
      const now = new Date();
      const defaultAgent = resolveDefaultAgent();

      const stepMessage: Message = {
        id: `workflow1-${now.getTime()}-${workflowStepIndex}`,
        createdAt: now.toISOString(),
        senderType: 'agent',
        from: 'agent',
        senderId: defaultAgent.id,
        senderLabel: defaultAgent.name,
        content: [{ type: 'text', text }],
        taskId: task.id,
        metadata: {
          kind: 'workflow_step',
          workflow: 'build_lucky_draw_website',
          stepIndex: workflowStepIndex,
        },
      };

      setMessages(prev => [...prev, stepMessage]);

      setWorkflowStepIndex(prev =>
        prev === null ? null : prev + 1
      );
    }, 2000);

    return () => clearTimeout(timeout);
  }, [workflowStepIndex, task?.id, members.length]);

  // 🧠 WhatsApp workflow
  useEffect(() => {
    if (workflowStepIndex2 === null || !task) return;

    if (workflowStepIndex2 >= WHATSAPP_MESSAGE_STEPS.length) {
      setWorkflowStepIndex2(null);
      return;
    }

    const timeout = setTimeout(() => {
      const text = WHATSAPP_MESSAGE_STEPS[workflowStepIndex2];
      const now = new Date();
      const defaultAgent = resolveDefaultAgent();

      const stepMessage: Message = {
        id: `workflow2-${now.getTime()}-${workflowStepIndex2}`,
        createdAt: now.toISOString(),
        senderType: 'agent',
        from: 'agent',
        senderId: defaultAgent.id,
        senderLabel: defaultAgent.name,
        content: [{ type: 'text', text }],
        taskId: task.id,
        metadata: {
          kind: 'workflow_step',
          workflow: 'send_whatsapp_message',
          stepIndex: workflowStepIndex2,
        },
      };

      setMessages(prev => [...prev, stepMessage]);

      setWorkflowStepIndex2(prev =>
        prev === null ? null : prev + 1
      );
    }, 3000);

    return () => clearTimeout(timeout);
  }, [workflowStepIndex2, task?.id, members.length]);

  const addMessage = (
    from: 'agent' | 'you',
    text: string,
    options: AddMessageOptions = {}
  ) => {
    const now = new Date();

    setMessages((prev) => {
      const newMessage: Message = {
        id: `${now.getTime()}-${prev.length + 1}`,
        createdAt: now.toISOString(),
        senderType: from === 'agent' ? 'agent' : 'user',
        senderId: options.senderId,
        senderLabel: options.senderLabel ?? (from === 'agent' ? 'Agent' : 'You'),
        content: text
          ? [
              {
                type: 'text' as const,
                text,
              },
            ]
          : [],
        from,
        metadata: {},
        taskId: task?.id,
        replyToMessageId: undefined,
      };

      return [...prev, newMessage];
    });
  };

  // 🔌 generic API caller for any agent in AGENT_ENDPOINTS
  const callAgentApi = async (agent: Agent, query: string) => {
    const url = AGENT_ENDPOINTS[agent.id];
    if (!url) {
      console.warn('[ArenaSidebar] No endpoint configured for agent', agent.id);
      return;
    }

    console.log('[ArenaSidebar] calling agent API', {
      agentId: agent.id,
      agentName: agent.name,
      url,
      query,
    });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} – ${errText}`);
      }

      const raw = await res.text();
      console.log('[ArenaSidebar] raw response body from', agent.id, ':', raw);

      let data: any = null;
      if (raw && raw.trim().length) {
        try {
          data = JSON.parse(raw);
        } catch {
          // not JSON, we'll just treat it as plain text
        }
      }

      const text =
        data?.reply ??
        data?.response ??
        data?.result ??
        data?.message ??
        (raw && raw.trim().length
          ? raw
          : `✅ ${agent.name} responded (200) but returned an empty body.`);

      addMessage('agent', text, {
        senderId: agent.id,
        senderLabel: agent.name,
      });
    } catch (err: any) {
      console.error(`Agent API error for ${agent.id}:`, err);
      addMessage(
        'agent',
        `⚠️ ${agent.name} API error: ${err?.message ?? 'Unknown error'}`,
        {
          senderId: agent.id,
          senderLabel: agent.name,
        }
      );
    }
  };

  const handleSend = async () => {
    if (!task) return;
    if (blockedByRequirements) return;

    const trimmed = input.trim();
    const hasText = trimmed.length > 0;
    const hasFiles = attachedFiles.length > 0;
    const now = new Date();

    if (!hasText && !hasFiles) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      senderType: 'user',
      from: 'you',
      content: [{ type: 'text', text: trimmed }],
      taskId: task.id,
      metadata: {},
    };

    // 🔁 Trigger workflows on specific phrases
    if (trimmed === "Could you help me to build the lucky draw website?") {
      userMessage.metadata = {
        ...(userMessage.metadata || {}),
        triggeredWorkflow: 'build_lucky_draw_website',
        triggeredAt: now.toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setWorkflowStepIndex(0);

      setInput('');
      if (task?.kpi?.length && onKPIUpdate) {
        onKPIUpdate(task.id, task.kpi[0].id, {
          completed: true,
          evidence: ""
        });
      }
      return;
    }

    if (trimmed === "Who shall we send the whatsapp message to, and could you please help me to do that?") {
      userMessage.metadata = {
        ...(userMessage.metadata || {}),
        triggeredWorkflow: 'send_whatsapp_message',
        triggeredAt: now.toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      (async () => {
        try {
          const res = await fetch('https://specialized-agent.onrender.com/send_whatsapp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!res.ok) {
            console.error('Failed to send WhatsApp POST:', res.status, res.statusText);
          } else {
            const data = await res.json().catch(() => null);
            console.log('WhatsApp POST success:', data);
          }
        } catch (err) {
          console.error('Error sending WhatsApp POST:', err);
        }
      })();

      // (POST to your backend can go here if you want)
      setWorkflowStepIndex2(0);

      setInput('');
      if (task?.kpi?.length && onKPIUpdate) {
        onKPIUpdate(task.id, task.kpi[0].id, {
          completed: true,
          evidence: ""
        });
      }
      return;
    }

    // 1️⃣ log user's message
    if (hasText) {
      addMessage('you', trimmed, { senderLabel: 'You' });
    }
    setInput('');
    setAttachedFiles([]);

    if (!hasText) return;

    // 2️⃣ decide which agents are active:
    const activeAgents: Agent[] =
      members.length > 0 ? members : (task.group_members ?? []);

    console.log('[ArenaSidebar] activeAgents for message:', activeAgents);

    if (!activeAgents.length) {
      console.warn('[ArenaSidebar] No active agents attached to this task.');
      return;
    }

    // 3️⃣ send to each active agent that has a configured endpoint
    for (const agent of activeAgents) {
      void callAgentApi(agent, trimmed);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // toggle agent membership (UI + routing which endpoints we call)
  const toggleAgent = (agent: Agent) => {
    if (!hasTask) return;

    setMembers((prev) => {
      const already = prev.some((m) => m.id === agent.id);
      if (already) {
        return prev.filter((m) => m.id !== agent.id);
      }
      return [...prev, agent];
    });
  };

  // 📎 file attach handlers
  const handleAttachClick = () => {
    if (!hasTask || blockedByRequirements) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const visibleMembers = members.slice(0, 2);
  const inputDisabled = !hasTask || blockedByRequirements;

  // ✅ deterministic timestamp (no locale)
  const formatTimestamp = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const h12 = ((hours + 11) % 12) + 1;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const mm = minutes.toString().padStart(2, '0');
    return `${h12}:${mm} ${ampm}`;
  };

  const getInitials = (label?: string) => {
    if (!label) return 'Ag';
    const parts = label.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-800 flex items-end gap-1">
            Workplace
            {blockedByRequirements && (
              <span className="text-[10px] text-amber-600">
                Complete all Requirements for this task to unlock messaging.
              </span>
            )}
          </h3>
          <p className="text-[11px] text-left text-gray-500 truncate max-w-[260px]">
            {hasTask
              ? `${task!.icon} ${task!.name}`
              : 'Select a task to open the Workplace.'}
          </p>
        </div>

        {/* Agents + hover menu */}
        <div className="relative flex items-center -space-x-2 group">
          {visibleMembers.map((agent) => (
            <span
              key={agent.id}
              className="w-6 h-6 bg-blue-100 text-blue-800 text-[10px] rounded-full flex items-center justify-center border-2 border-white"
            >
              {agent.avatar ?? getInitials(agent.name)}
            </span>
          ))}

          <button
            type="button"
            onClick={() => setIsAgentMenuOpen((prev) => !prev)}
            className="w-6 h-6 bg-white text-gray-500 text-sm rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-[#4d4ea1] hover:text-[#4d4ea1] transition"
            aria-label="Add AI agent"
          >
            +
          </button>

          <div
            className={`
              absolute right-0 top-8 z-20 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-3
              ${
                isAgentMenuOpen
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
              }
              transition-all duration-150 ease-out
            `}
          >
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700">
                Attach AI agents to this Workplace
              </p>
              <p className="text-[11px] text-gray-400">
                Hover to preview, click to add or remove.
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {agent_list.map((agent) => {
                const isActive = members.some((m) => m.id === agent.id);
                return (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                        {agent.avatar ?? getInitials(agent.name)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-gray-800">
                            {agent.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 line-clamp-2">
                          {agent.description}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAgent(agent)}
                      className={`flex items-center justify-center rounded-full border text-[11px] px-2 py-1 transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#4d4ea1] hover:text-[#4d4ea1]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={chatContainerRef}
        className="bg-white rounded-2xl border border-gray-200 mb-3 p-3 shadow-sm
                    max-w-[494px] h-[185px] max-h-[185px] overflow-y-auto pr-1 space-y-3"
      >
        {hasTask ? (
          messages.length > 0 ? (
            messages.map((msg) => {
              const isAgent = msg.from === 'agent';
              const agent = isAgent ? findAgentForMessage(msg) : undefined;
              const displayLabel =
                msg.senderLabel ?? agent?.name ?? (isAgent ? 'Agent' : 'You');

              const textBlock = msg.content?.find(
                (b): b is { type: 'text'; text: string } => b.type === 'text'
              );

              if (!textBlock || !textBlock.text.trim().length) return null;

              return (
                <div
                  key={msg.id}
                  className={
                    isAgent
                      ? 'flex items-start gap-2 text-left'
                      : 'flex items-start gap-2 justify-end text-right'
                  }
                >
                  {isAgent && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-pink-900">
                      {agent?.avatar ?? getInitials(agent?.name ?? msg.senderLabel)}
                    </div>
                  )}

                  <div className="max-w-[80%]">
                    <div className="text-[11px] text-gray-500 mb-0.5 flex items-center gap-1">
                      <span className="font-semibold">
                        {displayLabel}
                      </span>
                      <span className="ml-1 text-[10px]">
                        {formatTimestamp(msg.createdAt)}
                      </span>
                    </div>

                    <div
                      className="
                        text-sm text-gray-800 whitespace-pre-line
                        break-words
                        max-w-[350px]
                        overflow-hidden
                      "
                    >
                      {textBlock.text}
                    </div>
                  </div>

                  {!isAgent && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">
              No discussion yet for this task. Start the first note in the Workplace.
            </p>
          )
        ) : (
          <p className="text-sm text-gray-400">
            Select a task on the canvas to start a discussion here.
          </p>
        )}
      </div>

      {/* Chat input bar */}
      <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Attach button with badge */}
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={inputDisabled}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#4d4ea1] text-white hover:opacity-90 transition disabled:opacity-40"
          aria-label="Attach file"
        >
          <Paperclip size={18} />

          {attachedFiles.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {attachedFiles.length}
            </span>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Textbox */}
        <input
          type="text"
          placeholder={
            !hasTask
              ? 'Select a task to start a discussion...'
              : blockedByRequirements
              ? 'Complete this task’s Requirements to unlock the Workplace...'
              : 'Your message...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 
                     focus:outline-none focus:ring-1 focus:ring-[#4d4ea1] placeholder-gray-400
                     disabled:bg-gray-100 disabled:text-gray-400"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={inputDisabled}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br 
                     from-[#ff4b8b] to-[#ff7a4e] text-white shadow-md hover:opacity-90 transition
                     disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
