'use client';

import { Paperclip, Send } from 'lucide-react';


export default function DetailSidebar() {
  // Later, we'll pass the selected task as a prop here
  // const { task } = props;

  return (
    <aside className="w-80 bg-white border-l border-gray-200 
                    p-4 flex flex-col gap-4 shadow-inner z-10"
    >
      {/* 1. KPI/Requirements Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="font-semibold text-gray-800 mb-2">KPI/Requirements</h3>
        {/* We will map over task.kpi here later */}
        <p className="text-sm text-gray-500">
          Click a task to see its KPIs.
        </p>
      </div>

      {/* 2. Arena Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 
                    flex-1 flex flex-col"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Arena</h3>
          <div className="flex -space-x-2">
            {/* Group members will go here */}
            <span className="w-6 h-6 bg-blue-200 text-blue-800 text-xs 
                             rounded-full flex items-center justify-center 
                             border-2 border-white"
            >
              CA
            </span>
            <span className="w-6 h-6 bg-green-200 text-green-800 text-xs 
                             rounded-full flex items-center justify-center 
                             border-2 border-white"
            >
              MA
            </span>
          </div>
        </div>
        
        {/* Chat area placeholder */}
        <div className="flex-1 bg-white rounded border border-gray-200 mb-2 p-2">
           <p className="text-sm text-gray-400">
             Chat history will appear here...
           </p>
        </div>

        {/* Chat Input */}
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-300">
          <button className="p-1 text-gray-500 hover:text-blue-500">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Update progression..."
            className="flex-1 bg-transparent text-sm focus:outline-none 
                       placeholder-gray-400"
          />
          <button className="p-1 text-gray-500 hover:text-blue-500">
            <Send size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}