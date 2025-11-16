// components/ProjectCanvas.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
  useReactFlow,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import TaskNode from './TaskNode';
import type { Task } from '@/lib/types';

// positions
const nodePositions: { [key: string]: { x: number; y: number } } = {
  T1: { x: 450, y: 50 },
  T6: { x: 1050, y: 50 },
  T2: { x: 150, y: 300 },
  T3: { x: 450, y: 300 },
  T4: { x: 750, y: 300 },
  T5: { x: 750, y: 500 },
  T7: { x: 450, y: 700 },
};

type Tool = 'select' | 'add' | 'delete';

interface ProjectCanvasProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string | null) => void;
}

function buildEdges(tasks: Task[]): Edge[] {
  const edges: Edge[] = [];
  tasks.forEach(task => {
    task.successor.forEach(successorId => {
      edges.push({
        id: `e-${task.id}-${successorId}`,
        source: task.id,
        target: successorId,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#6366f1',
        },
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: '#6366f1',
        },
      });
    });
  });
  return edges;
}

export default function ProjectCanvas({ tasks, onTaskSelect }: ProjectCanvasProps) {
  const { project } = useReactFlow();
  const [activeTool, setActiveTool] = useState<Tool>('select');

  // 🔹 nodes initialised from tasks
  const [nodes, setNodes] = useState<Node<Task>[]>(() =>
    tasks.map(task => ({
      id: task.id,
      type: 'task',
      position: nodePositions[task.id] || { x: 0, y: 0 },
      data: task,
    }))
  );

  // 🔹 keep node.data in sync when tasks change
  useEffect(() => {
  setNodes(prevNodes =>
    tasks.map(task => {
      // keep existing position if node already exists
      const existing = prevNodes.find(n => n.id === task.id);
      return {
        id: task.id,
        type: 'task',
        position:
          existing?.position ||
          nodePositions[task.id] || { x: 0, y: 0 },
        data: task, // 👈 always use latest task (with updated KPI)
      };
    })
  );
}, [tasks]);

  const [edges, setEdges] = useState<Edge[]>(() => buildEdges(tasks));

  useEffect(() => {
    setEdges(buildEdges(tasks));
  }, [tasks]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      task: TaskNode,
    }),
    []
  );

  const onNodesChange: OnNodesChange = useCallback(
    changes => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    changes => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );

  const handlePaneClick: React.MouseEventHandler = useCallback(
    event => {
      if (activeTool === 'add') {
        const bounds = (event.target as HTMLDivElement).getBoundingClientRect();
        const position = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        const newId = `T-new-${Date.now()}`;

        // you'll probably want to also add this to `tasks` state in parent later
        setNodes(nds => [
          ...nds,
          {
            id: newId,
            type: 'task',
            position,
            data: {
              id: newId,
              name: 'New Task',
              desc: 'Describe what happens in this step.',
              icon: '✨',
              completed: false,
              kpi: [],
              Requirements: [],
              group_members: [],
              predecessor: [],
              successor: [],
              discussion_messages: [],
            },
          },
        ]);
      } else if (activeTool === 'select') {
        onTaskSelect?.(null);
      }
    },
    [activeTool, project, onTaskSelect]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<Task>) => {
      if (activeTool === 'delete') {
        setNodes(nds => nds.filter(n => n.id !== node.id));
        setEdges(eds => eds.filter(e => e.source !== node.id && e.target !== node.id));
        onTaskSelect?.(null);
      } else {
        onTaskSelect?.(node.id);
      }
    },
    [activeTool, onTaskSelect]
  );

  const baseBtn =
    'h-8 w-8 flex items-center justify-center rounded-full text-xs border transition';
  const activeBtn =
    'bg-[#4d4ea1] text-white border-[#4d4ea1] shadow-sm';
  const idleBtn =
    'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50';

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-100"
      >
        <Controls />
        <Background color="#e5e7eb" gap={16} />
      </ReactFlow>

      {/* Tool bar */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 border border-gray-200 rounded-full shadow-md px-1 py-1">
          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`${baseBtn} ${activeTool === 'select' ? activeBtn : idleBtn}`}
            title="Select / move"
          >
            ➤
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('add')}
            className={`${baseBtn} ${activeTool === 'add' ? activeBtn : idleBtn}`}
            title="Add task"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('delete')}
            className={`${baseBtn} ${activeTool === 'delete' ? activeBtn : idleBtn}`}
            title="Remove task"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
