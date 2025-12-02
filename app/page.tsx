// app/page.tsx
'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ProjectCanvas from '@/components/ProjectCanvas';
import AppSidebar from '@/components/AppSidebar';
import ArenaSidebar from '@/components/ArenaSidebar';
import KPISidebar from '@/components/KPISidebar';

import type { Task, KPI } from '@/lib/types';
import { mockTasks } from '@/lib/data';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    mockTasks[0]?.id ?? null
  );

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;

  const handleKPIUpdate = (
    taskId: string,
    kpiId: string,
    updates: Partial<KPI>
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id !== taskId
          ? task
          : {
              ...task,
              kpi: task.kpi.map(k =>
                k.id === kpiId ? { ...k, ...updates } : k
              ),
            }
      )
    );
  };

  // 🔁 when Next is clicked:
  // - go to first successor
  // - clear that successor's Requirements
  const handleNextTask = (nextId: string | null) => {
    if (!nextId) return;

    setTasks(prev =>
      prev.map(task =>
        task.id === nextId
          ? {
              ...task,
              // assumes field name is `Requirements`
              // and you want it completely cleared
              Requirements: [],
            }
          : task
      )
    );

    setSelectedTaskId(nextId);
  };

  return (
    <main className="relative w-[100vw] h-[100vh] overflow-hidden bg-[#f4f6fa]">
      <div className="absolute w-[100%] h-[100%]  z-50  flex flex-col">
        <header className="bg-white text-black flex justify-between items-center px-5 py-3 rounded-full shadow-sm">
          <h1 className="text-lg font-bold">
            AI Implementation Canvas for Lucky Draw & WhatsApp Journeys
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Current status:{' '}
              <span className="font-semibold">
                {selectedTask ? selectedTask.name : 'No step selected'}
              </span>
            </span>

            <button
              className="text-sm font-medium px-4 py-1 rounded-full border"
              style={{ borderColor: '#4D4EA1', color: '#4D4EA1' }}
            >
              Share
            </button>
          </div>
        </header>

        <div className="w-full flex-1 py-2 flex flex-row justify-between items-center">
          <div className="w-fit flex-[1] h-full">
            <AppSidebar />
          </div>

          <div className="flex-[11] h-full me-4 rounded-xl">
            <ReactFlowProvider>
              <ProjectCanvas
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onTaskSelect={setSelectedTaskId}
              />
            </ReactFlowProvider>
          </div>

          <div className="flex-[7] text-center h-full flex flex-col gap-5">
            <KPISidebar
              kpis={selectedTask?.kpi ?? []}
              requirements={selectedTask?.Requirements ?? []}
              taskId={selectedTask?.id ?? null}
              successors={selectedTask?.successor ?? []}
              onKPIUpdate={handleKPIUpdate}
              onNextTask={handleNextTask}
            />
            <ArenaSidebar
              task={selectedTask}
              onKPIUpdate={handleKPIUpdate}
            />
          </div>
        </div>
      </div>
    </main>
  );
}


