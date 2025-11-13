import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const mockData = Array.from({ length: 10 }).map((_, i) => ({
  name: `T${i + 1}`,
  value: Math.max(0, 1 + Math.sin(i / 2) * 0.3 + (Math.random() - 0.5) * 0.1),
}));

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="relative rounded-3xl p-6 glass-card glass-card-hover border border-white/10 overflow-hidden transition-transform duration-300 ease-in-out"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-neutral-900/50 to-slate-800/30 rounded-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-neutral-200 text-lg font-semibold">Balance History</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
            <span className="text-xs text-neutral-400">Live</span>
          </div>
        </div>
        
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                hide 
                tick={{ fill: '#aaa' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                hide 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#fff',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }} 
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#lineGradient)" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: '#06b6d4',
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))'
                }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))' }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full w-full opacity-20" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* Decorative glow */}
      <div className="absolute top-1/2 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-2xl"></div>
    </motion.div>
  );
}


