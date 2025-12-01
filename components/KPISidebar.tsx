'use client';

import { useState } from 'react';
import { KPI } from '@/lib/types';

interface KPISidebarProps {
  kpis?: KPI[];
  requirements?: KPI[];
  taskId: string | null;
  successors?: string[];
  onKPIUpdate?: (taskId: string, kpiId: string, updates: Partial<KPI>) => void;
  onNextTask?: (taskId: string | null) => void;
}

export default function KPISidebar({
  kpis = [],
  requirements = [],
  taskId,
  successors = [],
  onKPIUpdate,
  onNextTask,
}: KPISidebarProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  // 🔍 decide whether to show Requirements or KPI
  const hasIncompleteRequirements = requirements.some(r => !r.completed);
  const shouldShowRequirements =
    hasIncompleteRequirements && requirements.length > 0;

  const items = shouldShowRequirements ? requirements : kpis;
  const hasItems = items.length > 0;

  const title = shouldShowRequirements ? 'Requirements' : 'KPI';
  const chipLabel = shouldShowRequirements ? 'Requirement' : 'KPI';

  const toggleOpen = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const renderEvidence = (evidence: string) => {
    if (!evidence) return null;

    const isUrl =
      evidence.startsWith('http://') || evidence.startsWith('https://');

    if (isUrl) {
      const lower = evidence.toLowerCase();

      if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) {
        return (
          <img
            src={evidence}
            alt="KPI evidence"
            className="mt-2 max-h-32 w-full rounded-lg object-cover border border-slate-200"
          />
        );
      }

      if (/\.(mp4|webm|ogg)$/.test(lower)) {
        return (
          <video
            src={evidence}
            controls
            className="mt-2 w-full rounded-lg border border-slate-200"
          />
        );
      }

      return (
        <a
          href={evidence}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-xs text-indigo-600 underline"
        >
          Open evidence
        </a>
      );
    }

    return (
      <p className="mt-2 text-xs text-slate-600 leading-snug">
        {evidence}
      </p>
    );
  };

  // ✅ all KPI completed (only relevant when we're in KPI mode)
  const allKpisCompleted =
    !shouldShowRequirements &&
    kpis.length > 0 &&
    kpis.every(k => k.completed);

  const handleNextClick = () => {
    const nextTaskId = successors[0] ?? null;
    onNextTask?.(nextTaskId);
  };

  return (
    <aside className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm">
      {/* Header with title + small button top-right */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">
          {title}
        </h3>

        {allKpisCompleted && successors.length > 0 && (
          <button
            type="button"
            onClick={handleNextClick}
            className="
              text-xs font-medium
              bg-emerald-500 hover:bg-emerald-600
              text-white
              px-3 py-1.5
              rounded-lg
              transition
            "
          >
            Next →
          </button>
        )}
      </div>

      {!hasItems && (
        <p className="text-sm text-slate-500">
          Click a task to see its {shouldShowRequirements ? 'requirements' : 'KPIs'}.
        </p>
      )}

      {hasItems && (
        <div
          className="
            space-y-3
            h-[115px]
            max-w-[494px]
            max-h-[110px]
            overflow-y-auto
            pr-1
          "
        >
          {items.map(item => {
            const isOpen = openId === item.id;

            const circleClasses = item.completed
              ? 'h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700'
              : 'h-4 w-4 rounded-full border-2 border-indigo-400 bg-white';

            return (
              <div
                key={item.id}
                className="
                  bg-slate-50
                  rounded-2xl
                  px-3 py-3
                  shadow-sm
                  border border-slate-100
                  flex flex-col gap-2
                "
              >
                {/* Header row for each KPI / requirement */}
                <div className="flex items-start gap-3">
                  {/* Status circle */}
                  <div className="mt-1 flex h-6 w-6 items-center justify-center">
                    <div className={circleClasses}>
                      {item.completed && '✓'}
                    </div>
                  </div>

                  {/* Title + target */}
                  <div className="flex-1 text-left">
                    <div className="text-xs text-slate-400 mb-0.5">
                      {chipLabel}
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {item.target}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleOpen(item.id)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700"
                  >
                    {isOpen ? 'Hide result' : 'View result'}
                  </button>
                </div>

                {/* Collapsible body – empty if no evidence */}
                {isOpen && item.evidence && (
                  <div className="border-t border-slate-200 pt-2 mt-1">
                    {renderEvidence(item.evidence)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
