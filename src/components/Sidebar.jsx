import React from 'react';
import { Home, Send, Download, History, Settings } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'send', label: 'Send', icon: Send },
  { key: 'receive', label: 'Receive', icon: Download },
  { key: 'transactions', label: 'Transactions', icon: History },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="w-64 shrink-0 glass min-h-screen hidden md:flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-neutral-900/80 to-slate-800/50"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="text-white font-semibold tracking-wide text-lg">Solana Wallet</div>
          </div>
        </div>
        
        <nav className="px-4 py-2 space-y-2">
          {items.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button 
                key={key} 
                onClick={() => onChange(key)} 
                className={`sidebar-button w-full flex items-center gap-4 px-4 py-3 rounded-2xl group relative overflow-hidden transition-all duration-300 ease-in-out ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20' 
                    : 'text-neutral-300/70 hover:text-white hover:bg-white/5 hover:shadow-lg hover:shadow-white/5'
                }`}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl"></div>
                    {/* Gradient left border glow */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full shadow-lg shadow-cyan-400/50 blur-sm"></div>
                  </>
                )}
                <Icon size={20} className={`relative z-10 transition-all duration-300 ease-in-out ${
                  isActive 
                    ? 'text-emerald-400' 
                    : 'opacity-70 group-hover:opacity-100 group-hover:text-white'
                }`} />
                <span className="text-sm font-medium relative z-10">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}


