import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function SendModal({ open, onOpenChange, onConfirm }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  function close() { 
    setShowSuccess(false);
    setTo('');
    setAmount('');
    onOpenChange(false); 
  }
  
  async function confirm() {
    await onConfirm({ to, amount });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50"
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent"></div>
              </motion.div>
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ type: "ease-out", duration: 0.3 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className="w-[90vw] max-w-md rounded-3xl glass border border-white/20 p-6 text-white shadow-2xl backdrop-blur-xl pointer-events-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-neutral-900/80 to-slate-800/50 rounded-3xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">Send SOL</Dialog.Title>
                      <button onClick={close} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-neutral-400 font-medium mb-2">
                          Recipient Address
                          <span className="ml-2 text-xs text-neutral-500" title="Enter a valid Solana wallet address.">ℹ️</span>
                        </label>
                        <input 
                          className="w-full rounded-2xl bg-neutral-800/50 border border-neutral-700/50 p-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" 
                          value={to} 
                          onChange={(e) => setTo(e.target.value)} 
                          placeholder="Enter recipient address"
                          title="Enter a valid Solana wallet address."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-400 font-medium mb-2">
                          Amount (SOL)
                          <span className="ml-2 text-xs text-neutral-500" title="Minimum 0.0001 SOL.">ℹ️</span>
                        </label>
                        <input 
                          className="w-full rounded-2xl bg-neutral-800/50 border border-neutral-700/50 p-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          placeholder="0.1"
                          title="Minimum 0.0001 SOL."
                        />
                      </div>
                      
                      <div className="flex gap-3 justify-end pt-4">
                        <button 
                          onClick={close} 
                          className="hover-lift px-6 py-3 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600/50 text-sm font-semibold text-neutral-300 transition-all duration-300 ease-in-out"
                        >
                          Cancel
                        </button>
                        <motion.button 
                          onClick={confirm} 
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-sm font-semibold text-white shadow-lg hover:shadow-emerald-500/25 glow-green transition-all duration-300 ease-in-out"
                          animate={showSuccess ? {
                            boxShadow: [
                              '0 0 20px rgba(34, 197, 94, 0.3)',
                              '0 0 40px rgba(34, 197, 94, 0.6)',
                              '0 0 20px rgba(34, 197, 94, 0.3)',
                            ]
                          } : {}}
                          transition={{ duration: 1, repeat: showSuccess ? 2 : 0 }}
                        >
                          Confirm Send
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}


