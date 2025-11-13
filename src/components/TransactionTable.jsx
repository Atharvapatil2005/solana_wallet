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
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-neutral-200 text-lg font-semibold">Recent Transactions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-neutral-300">
            <thead className="bg-gradient-to-r from-neutral-900/50 to-slate-900/50">
              <tr>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium">Date</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium">Type</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium">Amount</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium">Signature</th>
              </tr>
            </thead>
            <tbody>
              {!hasRows && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-neutral-500 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-2 py-8">
                      <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center">
                        <span className="text-neutral-500 text-xl">📄</span>
                      </div>
                      <span>No transactions yet</span>
                    </div>
                  </td>
                </tr>
              ))}
              {hasRows && rows.map((r, index) => (
                <tr key={r.signature} className="border-t border-white/5 hover:bg-white/5 transition-all duration-200 group">
                  <td className="px-6 py-4 text-neutral-300">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(r.type)}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-200">{r.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-400 break-all group-hover:text-neutral-300 transition-colors">
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


