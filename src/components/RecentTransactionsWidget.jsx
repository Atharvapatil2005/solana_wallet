import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Copy, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'react-toastify';

export default function RecentTransactionsWidget({ transactions, onRefresh }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleRowClick(tx) {
    setSelectedTx(tx);
    setModalOpen(true);
  }

  function handleCopySignature() {
    if (!selectedTx) return;
    navigator.clipboard.writeText(selectedTx.signature);
    toast.success('Signature copied to clipboard');
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'text-emerald-400';
      case 'Pending': return 'text-yellow-400';
      case 'Failed': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        className="relative rounded-3xl p-6 glass-card glass-card-hover overflow-hidden transition-transform duration-300 ease-in-out"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-neutral-900/30 to-slate-800/20 rounded-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Latest 3</span>
          </div>

          {!transactions || transactions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span className="text-xl" style={{ color: 'var(--text-tertiary)' }}>📄</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.signature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={() => handleRowClick(tx)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-cyan-500/20 cursor-pointer transition-all duration-300 ease-in-out group"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)'
                  }}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'Receive' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {tx.type === 'Receive' ? (
                      <ArrowUp size={16} className="text-emerald-400" />
                    ) : (
                      <ArrowDown size={16} className="text-blue-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {tx.amountSol.toFixed(4)} SOL
                        </span>
                        <span className="text-xs font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                          {tx.shortSig}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {tx.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Decorative glow */}
        <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl"></div>
      </motion.div>

      {/* Signature Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <AnimatePresence>
          {modalOpen && selectedTx && (
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
                        <div className="flex items-center justify-between mb-4">
                          <Dialog.Title className="text-lg font-semibold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                            Transaction Details
                          </Dialog.Title>
                          <button 
                            onClick={() => setModalOpen(false)} 
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-neutral-400 font-medium mb-2">Signature</label>
                            <div className="flex items-center gap-2">
                              <input
                                className="flex-1 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 p-3 text-sm text-neutral-200 font-mono"
                                value={selectedTx.signature}
                                readOnly
                              />
                              <button
                                onClick={handleCopySignature}
                                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 flex items-center gap-2 text-sm font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
                              >
                                <Copy size={16} /> Copy
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Type</p>
                              <p className="text-sm font-medium text-neutral-200">{selectedTx.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Amount</p>
                              <p className="text-sm font-medium text-neutral-200">{selectedTx.amountSol.toFixed(4)} SOL</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Status</p>
                              <p className={`text-sm font-medium ${getStatusColor(selectedTx.status)}`}>
                                {selectedTx.status}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Time</p>
                              <p className="text-sm font-medium text-neutral-200">{selectedTx.timestamp}</p>
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
    </>
  );
}

