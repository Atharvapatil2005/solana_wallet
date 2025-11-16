import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { removeWallet } from '../utils/walletManager.js';

export default function DeleteWalletModal({ open, onOpenChange, wallet, activeWalletId, onComplete }) {
  const [loading, setLoading] = useState(false);
  const isActive = wallet?.id === activeWalletId;

  async function handleDelete() {
    if (!wallet) return;

    setLoading(true);
    try {
      const wasActive = isActive;
      const nextWallet = removeWallet(wallet.id);
      
      onComplete?.(wasActive, nextWallet);
      onOpenChange(false);
      
      // If no wallets left, reload to show create/import screen
      if (!nextWallet) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Delete failed:', error);
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
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-transparent"></div>
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
                <div className="w-[90vw] max-w-md rounded-3xl glass border border-red-500/30 p-6 text-white shadow-2xl backdrop-blur-xl pointer-events-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-neutral-900/80 to-slate-800/50 rounded-3xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                          Delete Wallet
                        </Dialog.Title>
                        <button 
                          onClick={() => onOpenChange(false)} 
                          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-300 mb-1">
                              This action cannot be undone
                            </p>
                            <p className="text-xs text-neutral-400">
                              Delete this wallet? All stored data will be permanently removed.
                            </p>
                          </div>
                        </div>

                        {wallet && (
                          <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/50">
                            <p className="text-xs text-neutral-400 mb-1">Wallet Name</p>
                            <p className="text-sm font-medium text-neutral-200">
                              {wallet.label || 'Unnamed Wallet'}
                            </p>
                            <p className="text-xs text-neutral-400 mt-2 mb-1">Address</p>
                            <p className="text-xs font-mono text-neutral-300 break-all">
                              {wallet.publicKey}
                            </p>
                          </div>
                        )}

                        {isActive && (
                          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-xs text-yellow-300">
                              ⚠️ This is your active wallet. Another wallet will be selected after deletion.
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-3 justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="hover-lift px-6 py-3 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-600/50 text-sm font-semibold text-neutral-300 transition-all duration-300 ease-in-out"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-sm font-semibold text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Deleting...' : 'Delete Wallet'}
                          </button>
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

