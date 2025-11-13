import React from 'react';
import { motion } from 'framer-motion';

export default function BalanceCard({ balanceSol, onSend, onReceive }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }} 
      whileHover={{ scale: 1.02 }}
      className="relative rounded-3xl p-8 glass-card glass-card-hover text-white overflow-hidden transition-transform duration-300 ease-in-out"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 rounded-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-neutral-400 font-medium tracking-wide">Total Balance</p>
            <div className="flex items-baseline gap-3">
              <p className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                {balanceSol ?? '—'}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="text-xl font-semibold text-neutral-300">SOL</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onSend} 
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold shadow-lg btn-glow-emerald"
            >
              Send
            </button>
            <button 
              onClick={onReceive} 
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg btn-glow-cyan"
            >
              Receive
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-lg"></div>
    </motion.div>
  );
}


