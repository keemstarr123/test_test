'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Task } from '@/lib/types';
import { Check } from 'lucide-react'; // <-- Import the check icon

// NodeProps gives us `data`, `selected`, etc.
export default function TaskNode({ data, selected }: NodeProps<Task>) {
  // --- ⬇️ KPI Calculation Logic ⬇️ ---
  const incompleteKpis = data.kpi.filter(k => !k.completed);
  const incompleteCount = incompleteKpis.length;
  
  // Show red circle if there are incomplete KPIs
  const showIncomplete = incompleteCount > 0;
  
  // Show green check ONLY if there are KPIs AND all are complete
  const showComplete = data.kpi.length > 0 && incompleteCount === 0;
  // --- ⬆️ End Logic ⬆️ ---

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-transparent !border-0"
      />

      {/* Main Node Body */}
      <div className="flex flex-col items-center">
        
        {/* --- ⬇️ Wrapper for positioning the badge ⬇️ --- */}
        <div className="relative">
          
          {/* 1. The Circle with Icon */}
          <div
            className={`
              w-24 h-24
              rounded-full
              flex items-center justify-center
              bg-white shadow-lg
              border-4
              transition-all
              ${selected ? 'border-blue-500' : 'border-gray-300'}
            `}
          >
            <span className="text-4xl">
              {data.icon}
            </span>
          </div>

          {/* --- ⬇️ KPI Status Badge ⬇️ --- */}
          {showIncomplete && (
            <div 
              className="absolute -top-2 -right-2 w-6 h-6 
                         bg-red-500 rounded-full 
                         flex items-center justify-center 
                         text-white text-xs font-bold 
                         border-2 border-white"
              title={`${incompleteCount} KPI(s) incomplete`}
            >
              {incompleteCount}
            </div>
          )}

          {showComplete && (
            <div 
              className="absolute -top-2 -right-2 w-6 h-6 
                         bg-green-500 rounded-full 
                         flex items-center justify-center 
                         text-white 
                         border-2 border-white"
              title="All KPIs achieved"
            >
              <Check size={16} />
            </div>
          )}
          {/* --- ⬆️ End KPI Status Badge ⬆️ --- */}

        </div>
        {/* --- ⬆️ End Wrapper ⬆️ --- */}


        {/* 2. The Title Below */}
        <div className="mt-2 text-center max-w-40">
          <span className="font-semibold text-gray-800 text-xs">
            {data.name}
          </span>
        </div>

      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-transparent !border-0"
      />
    </>
  );
}