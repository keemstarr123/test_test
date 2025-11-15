'use client';

import { useState } from 'react';
import { LayoutDashboard, Target, Bot } from 'lucide-react';

export default function AppSidebar() {
  const [active, setActive] = useState<'dashboard' | 'targets' | 'agents'>('dashboard');

  const baseStyle =
    'w-10 h-10 rounded-lg flex items-center justify-center transition-all';
  const inactiveStyle =
    'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-700';
  const activeStyle =
    'bg-[#ef415f] text-white shadow-lg shadow-[#ef415f]/30';

  return (
    <nav className="flex flex-col items-center gap-4 z-20">
      {/* Dashboard Button */}
      <button
        onClick={() => setActive('dashboard')}
        className={`${baseStyle} ${
          active === 'dashboard' ? activeStyle : inactiveStyle
        }`}
      >
        <LayoutDashboard size={20} />
      </button>

      {/* Target Button */}
      <button
        onClick={() => setActive('targets')}
        className={`${baseStyle} ${
          active === 'targets' ? activeStyle : inactiveStyle
        }`}
      >
        <Target size={20} />
      </button>

      {/* Bot Button */}
      <button
        onClick={() => setActive('agents')}
        className={`${baseStyle} ${
          active === 'agents' ? activeStyle : inactiveStyle
        }`}
      >
        <Bot size={20} />
      </button>
    </nav>
  );
}
