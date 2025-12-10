import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, KeyRound, ShieldAlert } from 'lucide-react';

export default function ReceiveModal({ open, onOpenChange, address, onCopy, secretKeyArray }) {
  const [showSecretWarning, setShowSecretWarning] = useState(false);
  const [copyingSecret, setCopyingSecret] = useState(false);

  function close() {
    onOpenChange(false);
    setShowSecretWarning(false);
    setCopyingSecret(false);
  }

  const handleCopyAddress = () => {
    onCopy?.();
  };

  const handleCopyPublicKey = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch (e) {
      console.error('Failed to copy public key:', e);
    }
  };

  const handleSecretKeyClick = () => {
    if (!secretKeyArray || !secretKeyArray.length) return;
    setShowSecretWarning(true);
  };

  const handleConfirmCopySecret = async () => {
    if (!secretKeyArray || !secretKeyArray.length) return;
    setCopyingSecret(true);
    try {
      const secretJson = JSON.stringify(secretKeyArray);
      await navigator.clipboard.writeText(secretJson);
    } catch (e) {
      console.error('Failed to copy secret key:', e);
    } finally {
      setCopyingSecret(false);
      setShowSecretWarning(false);
    }
  };

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
                          Receive SOL
                        </Dialog.Title>
                        <button onClick={close} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="w-full space-y-5">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                            <span className="text-2xl">💰</span>
                          </div>
                          <p className="text-neutral-400 text-sm">
                            Share your wallet address to receive SOL
                          </p>
                        </div>

                        <div className="h-px bg-neutral-800/80 border border-neutral-900/50 rounded-full" />
                        
                        {/* Address field */}
                        <div className="space-y-3">
                          <label className="block text-sm text-neutral-400 font-medium">
                            Wallet Address
                          </label>
                          <div className="flex items-center gap-3">
                            <input 
                              className="flex-1 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 p-4 text-sm text-neutral-200 font-mono focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" 
                              value={address || ''} 
                              readOnly 
                            />
                            <motion.button 
                              onClick={handleCopyAddress} 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="hover-lift px-4 py-3 rounded-2xl border border-transparent bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 flex items-center gap-2 text-xs font-semibold text-white shadow-lg hover:shadow-cyan-500/35 glow-cyan hover:border-cyan-300/60"
                            >
                              <Copy size={14}/> Copy Address
                            </motion.button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-neutral-900/90 border border-neutral-800/70 rounded-full" />

                        {/* Extra wallet info buttons */}
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-500">
                            Advanced wallet info
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                              onClick={handleCopyPublicKey}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="flex-1 px-4 py-3 rounded-2xl border border-neutral-700/70 bg-neutral-900/40 hover:bg-neutral-800/60 text-xs font-medium text-neutral-200 flex items-center justify-center gap-2 transition-colors hover:border-cyan-300/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                            >
                              <Copy size={14} />
                              <span>Copy Base58 Public Key</span>
                            </motion.button>
                            <motion.button
                              onClick={handleSecretKeyClick}
                              disabled={!secretKeyArray || !secretKeyArray.length}
                              whileHover={{ scale: secretKeyArray && secretKeyArray.length ? 1.02 : 1 }}
                              whileTap={{ scale: secretKeyArray && secretKeyArray.length ? 0.97 : 1 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="flex-1 px-4 py-3 rounded-2xl border border-red-500/40 bg-red-900/20 hover:bg-red-900/40 text-xs font-medium text-red-200 flex items-center justify-center gap-2 transition-colors hover:border-pink-400/60 hover:shadow-[0_0_18px_rgba(248,113,113,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-red-500/40"
                            >
                              <KeyRound size={14} />
                              <span>Copy Secret Key</span>
                            </motion.button>
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            Never share your secret key with anyone. It gives full control over your funds.
                          </p>
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

      {/* Secret key warning modal */}
      <AnimatePresence>
        {open && showSecretWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSecretWarning(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20, duration: 0.35 }}
              className="relative w-[90vw] max-w-sm rounded-3xl bg-neutral-950/90 border border-red-500/40 shadow-2xl p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="mt-1">
                  <ShieldAlert className="text-red-400" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-200">
                    Copy Secret Key?
                  </h3>
                  <p className="mt-1 text-xs text-neutral-300">
                    Your secret key controls this wallet. Anyone with this key can move all of your funds.
                    Only copy it if you understand the risks and are backing up securely.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  onClick={() => setShowSecretWarning(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="px-4 py-2 rounded-2xl bg-neutral-900/80 text-xs font-medium text-neutral-200 border border-neutral-700/80 hover:bg-neutral-800/80 transition-colors hover:border-neutral-400/40 hover:shadow-[0_0_12px_rgba(148,163,184,0.25)]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirmCopySecret}
                  disabled={copyingSecret}
                  whileHover={{ scale: copyingSecret ? 1 : 1.02 }}
                  whileTap={{ scale: copyingSecret ? 1 : 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-xs font-semibold text-white shadow-lg shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2 border border-transparent hover:border-red-300/60"
                >
                  <KeyRound size={14} />
                  {copyingSecret ? 'Copying…' : 'Copy Secret Key'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}