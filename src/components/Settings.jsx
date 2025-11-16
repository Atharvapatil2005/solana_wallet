import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Keypair } from '@solana/web3.js';
import { addWallet, importWallet, exportWallet, getWallets } from '../utils/walletManager.js';
import { getActiveWallet } from '../utils/walletManager.js';

export default function Settings({ address, rpcUrl, onWalletImported, activeWallet }) {
  const [secretText, setSecretText] = useState('');
  const fileRef = useRef(null);

  function importFromArray(arr) {
    try {
      const wallet = importWallet(arr);
      toast.success('Wallet imported');
      onWalletImported?.();
      
      // Dispatch wallet changed event
      window.dispatchEvent(new CustomEvent('walletChanged'));
    } catch (e) {
      toast.error(e.message || 'Invalid secret key array');
    }
  }

  function onPasteImport() {
    try {
      const arr = JSON.parse(secretText);
      importFromArray(arr);
    } catch (_) {
      toast.error('Paste a valid JSON array');
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        
        // Handle new format: { publicKey, secretKey }
        if (data.publicKey && data.secretKey) {
          const wallet = importWallet(data);
          toast.success('Wallet imported');
          onWalletImported?.();
          window.dispatchEvent(new CustomEvent('walletChanged'));
        }
        // Handle legacy format: [1,2,3,...] (secret key array)
        else if (Array.isArray(data)) {
          importFromArray(data);
        }
        else {
          throw new Error('Invalid wallet format');
        }
      } catch (error) {
        toast.error(error.message || 'Invalid wallet.json');
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  function createNewWallet() {
    try {
      const kp = Keypair.generate();
      const wallet = addWallet({
        publicKey: kp.publicKey.toBase58(),
        secretKey: Array.from(kp.secretKey),
        label: `Wallet ${getWallets().length + 1}`,
      });
      
      toast.success('New wallet created');
      onWalletImported?.();
      
      // Dispatch wallet changed event
      window.dispatchEvent(new CustomEvent('walletChanged'));
    } catch (error) {
      toast.error(error.message || 'Failed to create wallet');
    }
  }

  async function downloadWallet() {
    const currentWallet = activeWallet || getActiveWallet();
    if (!currentWallet) {
      toast.info('No wallet available');
      return;
    }
    
    try {
      await exportWallet(currentWallet.id);
      toast.success('Wallet downloaded');
      
      // Dispatch wallet changed event to update UI
      window.dispatchEvent(new CustomEvent('walletChanged'));
    } catch (error) {
      toast.error('Failed to download wallet');
      console.error('Download error:', error);
    }
  }

  return (
    <section className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
        className="relative rounded-3xl p-6 glass-card glass-card-hover border border-white/10 overflow-hidden transition-transform duration-300 ease-in-out"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-neutral-900/50 to-slate-800/30"></div>
        <div className="relative z-10">
          <h3 className="text-lg text-neutral-200 font-semibold mb-4">Network</h3>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/50">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
            <div>
              <p className="text-sm text-neutral-400">RPC Endpoint</p>
              <p className="text-sm font-mono text-neutral-200">{rpcUrl}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        className="relative rounded-3xl p-6 glass-card glass-card-hover border border-white/10 overflow-hidden transition-transform duration-300 ease-in-out"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-neutral-900/50 to-slate-800/30"></div>
        <div className="relative z-10">
          <h3 className="text-lg text-neutral-200 font-semibold mb-4">Wallet</h3>
          
          <div className="mb-6 p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/50">
            <p className="text-sm text-neutral-400 mb-2">Address</p>
            <p className="text-sm font-mono text-neutral-200 break-all">{address || '—'}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm text-neutral-400 font-medium">Import from wallet.json</label>
              <input 
                ref={fileRef} 
                type="file" 
                accept="application/json" 
                onChange={onFileChange} 
                className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer cursor-pointer" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-neutral-400 font-medium">Paste secret key array</label>
              <div className="flex gap-2">
                <textarea 
                  className="flex-1 rounded-xl bg-neutral-800/50 border border-neutral-700/50 p-3 text-sm text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" 
                  rows={3} 
                  placeholder="[1,2,3,...]" 
                  value={secretText} 
                  onChange={(e) => setSecretText(e.target.value)} 
                />
                <button 
                  onClick={onPasteImport} 
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-sm font-semibold text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={createNewWallet} 
              className="hover-lift px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-sm font-semibold text-white shadow-lg hover:shadow-emerald-500/25"
            >
              Create new wallet
            </button>
            <button 
              onClick={downloadWallet} 
              className="hover-lift px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-sm font-semibold text-white shadow-lg hover:shadow-cyan-500/25"
            >
              Download wallet.json
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}


