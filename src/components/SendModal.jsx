import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { connection } from '../utils/solana.js';

export default function SendModal({ open, onOpenChange, onConfirm }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [feeSol, setFeeSol] = useState(null);
  const [feeInr, setFeeInr] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [solPriceInr, setSolPriceInr] = useState(null);

  // Fetch SOL price in INR
  async function fetchSolPrice() {
    try {
      console.log('[SendModal] Fetching SOL price...');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr'
      );
      const data = await response.json();
      if (data.solana?.inr) {
        console.log('[SendModal] SOL price fetched:', data.solana.inr);
        setSolPriceInr(data.solana.inr);
      } else {
        console.warn('[SendModal] SOL price not found in response, using fallback');
        setSolPriceInr(20000); // Fallback: ~₹20,000 per SOL
      }
    } catch (error) {
      console.error('[SendModal] Failed to fetch SOL price:', error);
      setSolPriceInr(20000); // Fallback: ~₹20,000 per SOL
    }
  }

  // Estimate transaction fee
  async function estimateFee() {
    console.log('[SendModal] estimateFee called', { to, amount });
    
    if (!to || !amount) {
      console.log('[SendModal] Missing to or amount, clearing fee');
      setFeeSol(null);
      setFeeInr(null);
      setLoadingFee(false);
      return;
    }

    // Validate recipient address
    let recipientPubkey;
    try {
      recipientPubkey = new PublicKey(to.trim());
      console.log('[SendModal] Valid recipient address:', recipientPubkey.toBase58());
    } catch (error) {
      console.log('[SendModal] Invalid recipient address:', error.message);
      setFeeSol(null);
      setFeeInr(null);
      setLoadingFee(false);
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('[SendModal] Invalid amount:', amount);
      setFeeSol(null);
      setFeeInr(null);
      setLoadingFee(false);
      return;
    }

      console.log('[SendModal] Starting fee estimation...');
      setLoadingFee(true);
      try {
        // Get latest blockhash
        console.log('[SendModal] Fetching latest blockhash...');
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        console.log('[SendModal] Blockhash fetched:', blockhash);
        
        const lamports = Math.round(amountNum * LAMPORTS_PER_SOL);
        console.log('[SendModal] Transaction amount:', lamports, 'lamports');
        
        // Create a dummy transaction to estimate fee
        // Generate a random keypair for the sender (doesn't need to exist on-chain)
        // This allows us to create a valid transaction structure
        const dummyKeypair = Keypair.generate();
        const dummyTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: dummyKeypair.publicKey,
            toPubkey: recipientPubkey,
            lamports: lamports,
          })
        );
        
        // Set fee payer and recent blockhash
        dummyTx.feePayer = dummyKeypair.publicKey;
        dummyTx.recentBlockhash = blockhash;

        console.log('[SendModal] Compiling transaction message...');
        const message = dummyTx.compileMessage();
        console.log('[SendModal] Message compiled successfully');
        
        console.log('[SendModal] Getting fee for message...');
        const feeResult = await connection.getFeeForMessage(
          message,
          { commitment: 'confirmed' }
        );

        console.log('[SendModal] Fee result:', feeResult, 'Type:', typeof feeResult);
        
        // Handle fee result (can be null, object with value, or number)
        let feeLamports;
        if (feeResult === null || feeResult === undefined) {
          feeLamports = 5000; // Default fallback for localnet
          console.warn('[SendModal] Fee result is null/undefined, using fallback:', feeLamports);
        } else if (typeof feeResult === 'number') {
          feeLamports = feeResult;
          console.log('[SendModal] Fee is a number:', feeLamports);
        } else if (typeof feeResult === 'object') {
          // Check for value property
          if (feeResult.value !== null && feeResult.value !== undefined) {
            feeLamports = feeResult.value;
            console.log('[SendModal] Fee from value property:', feeLamports);
          } else {
            feeLamports = 5000; // Default fallback
            console.warn('[SendModal] Fee object has no value, using fallback:', feeLamports);
          }
        } else {
          feeLamports = 5000; // Default fallback
          console.warn('[SendModal] Unexpected fee result type, using fallback:', feeLamports);
        }

        const feeSolValue = feeLamports / LAMPORTS_PER_SOL;
        console.log('[SendModal] Estimated fee:', feeSolValue, 'SOL', `(${feeLamports} lamports)`);
        setFeeSol(feeSolValue);
        
        // Update INR fee if price is available
        if (solPriceInr !== null) {
          const inrValue = feeSolValue * solPriceInr;
          console.log('[SendModal] Fee in INR:', inrValue);
          setFeeInr(inrValue);
        }
    } catch (error) {
      console.error('[SendModal] Fee Estimation Error:', error);
      console.error('[SendModal] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Don't clear fee state on error, keep showing loading or previous value
      setFeeSol(null);
      setFeeInr(null);
    } finally {
      setLoadingFee(false);
      console.log('[SendModal] Fee estimation complete');
    }
  }

  // Fetch SOL price on mount
  useEffect(() => {
    console.log('[SendModal] Modal opened:', open);
    if (open) {
      fetchSolPrice();
    } else {
      // Reset fee state when modal closes
      setFeeSol(null);
      setFeeInr(null);
      setLoadingFee(false);
    }
  }, [open]);

  // Estimate fee when recipient or amount changes
  useEffect(() => {
    console.log('[SendModal] useEffect triggered', { open, to, amount });
    
    if (open && to && amount) {
      console.log('[SendModal] Setting up fee estimation timeout...');
      const timeoutId = setTimeout(() => {
        console.log('[SendModal] Timeout fired, calling estimateFee');
        estimateFee();
      }, 500); // Debounce for 500ms
      return () => {
        console.log('[SendModal] Cleaning up timeout');
        clearTimeout(timeoutId);
      };
    } else {
      console.log('[SendModal] Clearing fee (missing to/amount or modal closed)');
      setFeeSol(null);
      setFeeInr(null);
      setLoadingFee(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, amount, open]);

  // Update INR fee when SOL price changes
  useEffect(() => {
    if (feeSol !== null && solPriceInr !== null) {
      console.log('[SendModal] Updating INR fee', { feeSol, solPriceInr });
      const inrValue = feeSol * solPriceInr;
      setFeeInr(inrValue);
    }
  }, [feeSol, solPriceInr]);

  function close() { 
    console.log('[SendModal] Closing modal');
    setShowSuccess(false);
    setTo('');
    setAmount('');
    setFeeSol(null);
    setFeeInr(null);
    setLoadingFee(false);
    onOpenChange(false); 
  }
  
  async function confirm() {
    await onConfirm({ to, amount });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  // Format functions
  function formatSol(value) {
    if (value === null || value === undefined) return '—';
    return value.toFixed(9).replace(/\.?0+$/, '');
  }

  function formatInr(value) {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  // Calculate final total
  function getFinalTotal() {
    if (!amount || !feeSol) return null;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return null;
    return amountNum + feeSol;
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

                      {/* Gas Fee Estimation */}
                      {(() => {
                        console.log('[SendModal] Render check:', { loadingFee, feeSol, feeInr, to, amount });
                        return (loadingFee || feeSol !== null);
                      })() && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="rounded-2xl p-4 space-y-3 mt-2"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            minHeight: '60px'
                          }}
                        >
                          {loadingFee ? (
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                              <span>Estimating fee...</span>
                            </div>
                          ) : feeSol !== null ? (
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Gas Fee:
                                  </span>
                                  <Info 
                                    size={14} 
                                    className="cursor-help" 
                                    style={{ color: 'var(--text-tertiary)' }}
                                    title="This is the estimated Solana network fee for this transaction."
                                  />
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                    {formatSol(feeSol)} SOL
                                  </span>
                                  {feeInr !== null && (
                                    <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>
                                      ({formatInr(feeInr)})
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {getFinalTotal() !== null && (
                                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                      Final Total:
                                    </span>
                                    <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                      {formatSol(getFinalTotal())} SOL
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : null}
                        </motion.div>
                      )}
                      
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


