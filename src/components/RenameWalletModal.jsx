import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { updateWallet } from '../utils/walletManager.js';

export default function RenameWalletModal({ open, onOpenChange, wallet, onComplete }) {
  const [label, setLabel] = useState(wallet?.label || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open && wallet) {
      setLabel(wallet.label || '');
    }
  }, [open, wallet]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!wallet || !label.trim()) return;

    setLoading(true);
    try {
      updateWallet(wallet.id, { label: label.trim() });
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Rename failed:', error);
    } finally {
      setLoading(false);
    }
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
                        <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                          Rename Wallet
                        </Dialog.Title>
                        <button 
                          onClick={() => onOpenChange(false)} 
                          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm text-neutral-400 font-medium mb-2">
                            Wallet Label
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-2xl bg-neutral-800/50 border border-neutral-700/50 p-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Enter wallet name"
                            autoFocus
                            maxLength={50}
                          />
                          <p className="mt-1 text-xs text-neutral-500">
                            {label.length}/50 characters
                          </p>
                        </div>
                        
                        <div className="flex gap-3 justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="hover-lift px-6 py-3 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600/50 text-sm font-semibold text-neutral-300 transition-all duration-300 ease-in-out"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !label.trim()}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-sm font-semibold text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </form>
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

