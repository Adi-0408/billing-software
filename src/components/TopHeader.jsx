import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { APP_MODULES } from './Sidebar';
import { useJewellery } from '../context/JewelleryContext';

export default function TopHeader({ 
  activeView, 
  onSelectView, 
  onToggleMobileSidebar, 
  isCollapsed 
}) {
  const { rates, showroom } = useJewellery();
  const currentModule = APP_MODULES.find(m => m.id === activeView) || APP_MODULES[0];

  return (
    <header className="sticky top-0 z-30 bg-obsidian-950/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Active Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white border border-white/10 cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {showroom.name}
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-white text-sm sm:text-base">
              {currentModule.label}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Live Rates & Quick New Bill */}
      <div className="flex items-center gap-3 font-mono text-xs">
        {/* Live Gold Rate */}
        <div 
          onClick={() => onSelectView('settings')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900/90 border border-white/10 text-slate-300 hover:border-gold-500/40 cursor-pointer transition-colors"
          title="Click to change daily rates"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">22K Gold:</span>
          <span className="text-gold-300 font-bold">₹{rates.gold22k}/g</span>
        </div>

        {/* Live Silver Rate */}
        <div 
          onClick={() => onSelectView('settings')}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900/90 border border-white/10 text-slate-300 hover:border-gold-500/40 cursor-pointer transition-colors"
          title="Click to change daily rates"
        >
          <span className="text-slate-400">Silver:</span>
          <span className="text-slate-100 font-bold">₹{rates.silver999}/g</span>
        </div>

        {/* Quick New Bill Action */}
        <button
          onClick={() => onSelectView('billing')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold cursor-pointer shadow-gold-glow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Bill</span>
        </button>
      </div>
    </header>
  );
}
