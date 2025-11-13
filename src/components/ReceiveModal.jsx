import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy } from 'lucide-react';

export default function ReceiveModal({ open, onOpenChange, address, onCopy }) {
  function close() { onOpenChange(false); }

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
                      <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">Receive SOL</Dialog.Title>
                      <button onClick={close} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="w-full space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                          <span className="text-2xl">💰</span>
                        </div>
                        <p className="text-neutral-400 text-sm">Share your wallet address to receive SOL</p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm text-neutral-400 font-medium">Wallet Address</label>
                        <div className="flex items-center gap-3">
                          <input 
                            className="flex-1 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 p-4 text-sm text-neutral-200 font-mono focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" 
                            value={address || ''} 
                            readOnly 
                          />
                          <button 
                            onClick={onCopy} 
                            className="hover-lift px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 flex items-center gap-2 text-sm font-semibold text-white shadow-lg hover:shadow-cyan-500/25 glow-cyan"
                          >
                            <Copy size={16}/> Copy
                          </button>
                        </div>
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