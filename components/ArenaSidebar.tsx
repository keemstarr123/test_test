'use client';

import { useEffect, useState, useRef } from 'react';
import { Paperclip, Send, Check, Plus } from 'lucide-react';
import type { Task, DiscussionMessage, Agent, KPI, DiscussionFile } from '@/lib/types';
import { agent_list } from '@/lib/data';

type ArenaSidebarProps = {
  task?: Task | null;
  // 🔄 match Home.tsx: use Partial<KPI> as updates
  onKPIUpdate?: (taskId: string, kpiId: string, updates: Partial<KPI>) => void;
};

type FileAttachment = {
  id: string;
  name: string;
};

type Message = DiscussionMessage & {
  from: 'agent' | 'you';
  attachments?: FileAttachment[];
};

type FlowStage = 'idle' | 'askedCopyHelp' | 'copyDone';

export default function ArenaSidebar({ task, onKPIUpdate }: ArenaSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [members, setMembers] = useState<Agent[]>([]);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);

  // 📎 attached files + ref
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 💬 small flow state for the T1 script
  const [flowStage, setFlowStage] = useState<FlowStage>('idle');

  const chatContainerRef = useRef<HTMLDivElement | null>(null);


  const hasTask = !!task;

  // 🔐 requirement lock: true if any requirement is NOT completed
  const blockedByRequirements =
    !!task?.Requirements && task.Requirements.some((r) => !r.completed);

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

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

if (task && task.discussion_messages?.length) {
  setMessages(
    task.discussion_messages.map((m): Message => ({
      ...m,
      // derive "from" from senderType
      from: m.senderType === 'agent' ? 'agent' : 'you',
      // optional: if you later support file attachments
      // attachments: m.content
      //   .filter((block) => block.type === 'file')
      //   .map((block) => (block as { type: 'file'; file: DiscussionFile }).file),
    }))
  );
} else {
  const nowIso = new Date().toISOString();

  const helenText = blockedByRequirements
    ? `You’re in the Workplace for “${task.name}”. You need to complete the Requirements first before this Arena unlocks.`
    : `You’re now in the Workplace for “${task.name}”. I can help you refine KPIs, next actions, or risk notes.`;

  const welcomeMessage: Message = {
    id: 'local-welcome',           // must be string
    createdAt: nowIso,
    senderType: 'agent',           // assuming 'agent' is valid in SenderType
    senderLabel: 'Helen',
    senderId: 'helen-system',      // optional
    content: [
      {
        type: 'text',
        text: helenText,
      },
    ],
    from: 'agent',
    metadata: {},                  // optional
  };

  setMessages([welcomeMessage]);
}

    setAttachedFiles([]);
    setMembers(task.group_members ?? []);
  }, [task?.id, task?.name, task?.discussion_messages, task?.group_members, blockedByRequirements]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    }, [messages]);

  const addMessage = (
  from: 'agent' | 'you',
  text: string,
  attachments: DiscussionFile[] = []
) => {
  const now = new Date();

  setMessages((prev) => {
    const newMessage: Message = {
      // make a string id instead of numeric increment
      id: `${now.getTime()}-${prev.length + 1}`,
      createdAt: now.toISOString(),

      // map "from" to senderType
      senderType: from === 'agent' ? 'agent' : 'user', // adjust to your actual SenderType union
      senderId: from === 'agent' ? 'helen-system' : undefined,
      senderLabel: from === 'agent' ? 'Helen' : 'You',

      // new content structure
      content: [
        ...(text
          ? [
              {
                type: 'text' as const,
                text,
              },
            ]
          : []),
        ...attachments.map((file) => ({
          type: 'file' as const,
          file,
        })),
      ],

      // extra UI-only fields
      from,
      attachments,
      metadata: {},
      taskId: undefined,
      replyToMessageId: undefined,
    };

    return [...prev, newMessage];
  });
};

  const handleSend = () => {
    if (!task) return;
    if (blockedByRequirements) return; // 🔐 hard block

    const trimmed = input.trim();
    const hasText = trimmed.length > 0;
    const hasFiles = attachedFiles.length > 0;

    if (!hasText && !hasFiles) return;

    const attachments: FileAttachment[] = attachedFiles.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      name: file.name,
    }));

    // 1️⃣ Log user's message
    addMessage('you', hasText ? trimmed : '');
    setInput('');
    setAttachedFiles([]);

    // 2️⃣ SPECIAL SCRIPT FOR TASK T1
    if (task.id === 'T1') {
      const k1 = task.kpi.find((k) => k.id === 'K1'); // blueprint
      const k2 = task.kpi.find((k) => k.id === 'K2'); // copywriting

      // --- FIRST TURN: mark K1 complete and send 2 Helen messages ---
      if (k1 && !k1.completed && flowStage === 'idle') {
        // 🔑 send Partial<KPI> update
        onKPIUpdate?.(task.id, k1.id, { completed: true });

        // first Helen msg
        setTimeout(() => {
          addMessage(
            'agent',
            '🎉 Great job! I’ve reviewed the Figma flow — everything looks solid and well-mapped. I’ve marked the KPI as completed. 🚀'
          );
        }, 800);

        // second Helen msg asking about copywriting
        setTimeout(() => {
          addMessage(
            'agent',
            'Next up: Copywriting Draft Completed ✍️\nWe need to draft the WhatsApp templates for confirmation, dispatch, delay & feedback.\nWould you like me to help generate the first version? 😊'
          );
          setFlowStage('askedCopyHelp');
        }, 1800);

        return; // stop here, we already scheduled replies
      }

      // --- SECOND TURN: user replies to ask-for-help → mark K2 complete & send copy ---
      if (k2 && !k2.completed && flowStage === 'askedCopyHelp') {
        // mark KPI 2 as completed
        onKPIUpdate?.(task.id, k2.id, { completed: true });
        setFlowStage('copyDone');

        // generate the copywriting message
        setTimeout(() => {
          addMessage(
            'agent',
            `Sure, here's the result of the task:\n\n**👋 Hi {CustomerName}, thank you for shopping with us!**\n\nYour order **#{OrderID}** has been successfully received.\n\n🕒 *Estimated Delivery:* **{DeliveryDateRange}**\n\nYou’ll receive real-time delivery updates here on WhatsApp.\n\nMeanwhile, you can track your order anytime 👇\n\n🔗 **Track my order:** {TrackingLink}\n\nThank you for trusting us with your home 🏡✨ We’re here to make sure everything arrives perfectly.`
          );
        }, 800);

        // follow-up asking for acceptance
        setTimeout(() => {
          addMessage(
            'agent',
            'Does this look good to you, or would you like me to tweak the tone before we lock this in?'
          );
        }, 2000);

        return;
      }
    }

    // 3️⃣ Default generic reply for all other tasks / flows
    setTimeout(() => {
      addMessage(
        'agent',
        `Got it — I’ve logged this update for “${task.name}”. I can also suggest the next best action if you’d like.`
      );
    }, 600);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ toggle agent membership
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

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-800 flex items-center gap-1">
            Workplace
          </h3>
          <p className="text-[11px] text-gray-500 truncate max-w-[260px]">
            {hasTask
              ? `${task!.icon} ${task!.name}`
              : 'Select a task to open the Workplace.'}
          </p>
          {blockedByRequirements && (
            <p className="text-[10px] text-amber-600 mt-0.5">
              Complete all Requirements for this task to unlock messaging.
            </p>
          )}
        </div>

        {/* Agents + hover menu */}
        <div className="relative flex items-center -space-x-2 group">
  {visibleMembers.map((agent) => (
    <span
      key={agent.id}
      className="w-6 h-6 bg-blue-100 text-blue-800 text-[10px] rounded-full flex items-center justify-center border-2 border-white"
    >
      {agent.avatar ?? agent.name.slice(0, 2)}
    </span>
  ))}

  <button
    type="button"
    className="w-6 h-6 bg-white text-gray-500 text-sm rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-[#4d4ea1] hover:text-[#4d4ea1] transition"
    aria-label="Add AI agent"
  >
    +
  </button>

  <div
    className={`
      absolute right-0 top-8 z-20 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-3
      opacity-0 scale-95 translate-y-1 pointer-events-none
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto
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
                {agent.avatar ?? agent.name.slice(0, 2)}
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
            messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.from === 'agent'
                    ? 'flex items-start gap-2 text-left'
                    : 'flex items-start gap-2 justify-end text-right'
                }
              >
                {msg.from === 'agent' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-pink-900">
                    Cr
                  </div>
                )}

                <div className="max-w-[80%]">
                <div className="text-[11px] text-gray-500 mb-0.5">
                    <span className="font-semibold">
                    {msg.from === 'agent' ? 'Creative Agent' : 'You'}
                    </span>{' '}
                    <span className="ml-1">{msg.createdAt}</span>
                </div>

                {/* text content from MessageContentBlock[] */}
                {(() => {
                    const textBlock = msg.content?.find(
                    (b): b is { type: 'text'; text: string } => b.type === 'text'
                    );

                    if (!textBlock || !textBlock.text.trim().length) return null;

                    return (
                    <div className="text-sm text-gray-800 whitespace-pre-line">
                        {textBlock.text}
                    </div>
                    );
                })()}
                </div>

                {msg.from === 'you' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full" />
                )}
              </div>
            ))
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
          onClick={handleSend}
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
