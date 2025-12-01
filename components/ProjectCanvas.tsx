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
  const { project,fitView } = useReactFlow();
  const [activeTool, setActiveTool] = useState<Tool>('select');

  // 🌟 animation state
  const [isIntroLoading, setIsIntroLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);

  // 🔹 nodes initialised from tasks
  const [nodes, setNodes] = useState<Node<Task>[]>(() =>
    tasks.map(task => ({
      id: task.id,
      type: 'task',
      position: task.position || { x: 0, y: 0 },
      data: task,
    }))
  );

  // 🔹 keep node.data in sync when tasks change
  useEffect(() => {
    setNodes(prevNodes =>
      tasks.map(task => {
        const existing = prevNodes.find(n => n.id === task.id);
        return {
          id: task.id,
          type: 'task',
          position: existing?.position || task.position || { x: 0, y: 0 },
          data: task,
        };
      })
    );
  }, [tasks]);

  const [edges, setEdges] = useState<Edge[]>(() => buildEdges(tasks));

  useEffect(() => {
    setEdges(buildEdges(tasks));
  }, [tasks]);

  // 🎬 intro + stagger animation
  useEffect(() => {
    if (!tasks.length || !nodes.length) return;

    setVisibleCount(0);
    setIsIntroLoading(true);

    let intervalId: number | undefined;
    const introTimeout = window.setTimeout(() => {
      // hide spinner, start revealing nodes
      setIsIntroLoading(false);
      setVisibleCount(1); // show first node

      intervalId = window.setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= nodes.length) {
            if (intervalId !== undefined) {
              window.clearInterval(intervalId);
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // delay between nodes
    }, 1500); // spinner duration

    return () => {
      window.clearTimeout(introTimeout);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length, nodes.length]);

  useEffect(() => {
    if (isIntroLoading) return;
    if (!nodes.length) return;

    requestAnimationFrame(() => {
      fitView({ padding: 0.25, duration: 600 });
    });
  }, [nodes, isIntroLoading, fitView]);

  // map node.id → index so we know when to show edges
  const nodeIndexById = useMemo(() => {
    const map: Record<string, number> = {};
    nodes.forEach((n, idx) => {
      map[n.id] = idx;
    });
    return map;
  }, [nodes]);

  // only show first `visibleCount` nodes
  const animatedNodes = useMemo(
    () =>
      nodes.map((n, idx) => ({
        ...n,
        hidden: idx >= visibleCount,
      })),
    [nodes, visibleCount]
  );

  // only show edges when both ends are visible
  const animatedEdges = useMemo(
    () =>
      edges.map(edge => {
        const sIdx = nodeIndexById[edge.source];
        const tIdx = nodeIndexById[edge.target];
        const visible =
          sIdx !== undefined &&
          tIdx !== undefined &&
          sIdx < visibleCount &&
          tIdx < visibleCount;

        return {
          ...edge,
          hidden: !visible,
        };
      }),
    [edges, nodeIndexById, visibleCount]
  );

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

        setNodes(nds => [
          ...nds,
          {
            id: newId,
            type: 'task',
            position,
            data: {
              id: newId,
              name: 'New Task',
              position: { x: 0, y: 0 },
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

        // 👇 ensure ReactFlow has picked up the new node before we fit
        
      } else if (activeTool === 'select') {
        onTaskSelect?.(null);
      }
    },
    [activeTool, project, onTaskSelect, fitView]
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
        nodes={animatedNodes}
        edges={animatedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        className="bg-gray-100"
      >
        <Controls />
        <Background color="#e5e7eb" gap={16} />
      </ReactFlow>

      {/* Intro overlay spinner */}
      {isIntroLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100/80 backdrop-blur-[1px]">
          <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-[#4d4ea1] animate-spin mb-3" />
          <p className="text-sm text-gray-700">
            Generating by our Implementation Agent…
          </p>
        </div>
      )}

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
