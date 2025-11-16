import React from 'react';
import { motion } from 'framer-motion';

export default function TransactionTable({ rows }) {
  const hasRows = rows && rows.length > 0;
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'Send': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Receive': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="relative rounded-3xl overflow-hidden glass-card glass-card-hover border border-white/10 transition-transform duration-300 ease-in-out"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-neutral-900/50 to-slate-800/30"></div>
      
      <div className="relative z-10">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: 'var(--text-primary)' }}>
            <thead style={{ background: 'var(--bg-tertiary)' }}>
              <tr>
                <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Date</th>
                <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Type</th>
                <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Amount</th>
                <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Signature</th>
              </tr>
            </thead>
            <tbody>
              {!hasRows && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-6 py-4 text-center" colSpan={5} style={{ color: 'var(--text-tertiary)' }}>
                    <div className="flex flex-col items-center gap-2 py-8">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <span className="text-xl" style={{ color: 'var(--text-tertiary)' }}>📄</span>
                      </div>
                      <span style={{ color: 'var(--text-tertiary)' }}>No transactions yet</span>
                    </div>
                  </td>
                </tr>
              ))}
              {hasRows && rows.map((r, index) => (
                <tr key={r.signature} className="border-t transition-all duration-200 group" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(r.type)}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{r.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs break-all transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {r.signature}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}


