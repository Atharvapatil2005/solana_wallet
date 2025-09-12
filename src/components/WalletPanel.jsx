import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  connection,
  getBalance,
  requestAirdrop,
  transferAllToNull,
} from '../utils/solana.js';

const LOCAL_STORAGE_KEY = 'solana_wallet_secret';

export default function WalletPanel() {
  const [secretKey, setSecretKey] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const keypair = useMemo(() => {
    if (!secretKey) return null;
    try {
      return Keypair.fromSecretKey(Uint8Array.from(secretKey));
    } catch (e) {
      return null;
    }
  }, [secretKey]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setSecretKey(arr);
        setPublicKey(Keypair.fromSecretKey(Uint8Array.from(arr)).publicKey.toBase58());
      } catch (_) {}
    }
  }, []);

  async function refreshBalance() {
    if (!publicKey) return;
    try {
      const lamports = await getBalance(new PublicKey(publicKey));
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (e) {
      toast.error(`Failed to fetch balance: ${e.message}`);
    }
  }

  useEffect(() => {
    refreshBalance();
  }, [publicKey]);

  function handleCreateWallet() {
    const kp = Keypair.generate();
    const arr = Array.from(kp.secretKey);
    setSecretKey(arr);
    setPublicKey(kp.publicKey.toBase58());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
    toast.success('New wallet created');
  }

  function handleDownload() {
    if (!secretKey) return;
    const blob = new Blob([JSON.stringify(secretKey, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAirdrop() {
    if (!publicKey) return toast.info('Create or import a wallet first');
    setLoading(true);
    try {
      await requestAirdrop(new PublicKey(publicKey), 1);
      toast.success('Airdrop requested');
      await new Promise(r => setTimeout(r, 1500));
      await refreshBalance();
    } catch (e) {
      toast.error(`Airdrop failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearBalance() {
    if (!keypair) return toast.info('Create or import a wallet first');
    setLoading(true);
    try {
      const sig = await transferAllToNull(keypair);
      toast.success(`Cleared: ${sig}`);
      await new Promise(r => setTimeout(r, 1200));
      await refreshBalance();
    } catch (e) {
      toast.error(`Clear failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleImportJsonFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result);
        const kp = Keypair.fromSecretKey(Uint8Array.from(arr));
        setSecretKey(arr);
        setPublicKey(kp.publicKey.toBase58());
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
        toast.success('Wallet imported');
      } catch (e) {
        toast.error('Invalid wallet.json');
      }
    };
    reader.readAsText(file);
  }

  function handleImportSecretKey(text) {
    try {
      const arr = JSON.parse(text);
      const kp = Keypair.fromSecretKey(Uint8Array.from(arr));
      setSecretKey(arr);
      setPublicKey(kp.publicKey.toBase58());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
      toast.success('Wallet imported');
    } catch (e) {
      toast.error('Invalid secret key array');
    }
  }

  function handleClearLocal() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSecretKey(null);
    setPublicKey(null);
    setBalance(null);
  }

  return (
    <section className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-3">Wallet</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={handleCreateWallet}>
            Create Wallet
          </button>
          <button className="px-3 py-2 bg-gray-700 text-white rounded" onClick={handleDownload} disabled={!secretKey}>
            Download wallet.json
          </button>
          <label className="px-3 py-2 bg-gray-200 rounded cursor-pointer">
            Import wallet.json
            <input type="file" accept="application/json" className="hidden" onChange={handleImportJsonFile} />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Paste secret key array</label>
            <textarea className="mt-1 w-full rounded border p-2" rows={3} placeholder="[1,2,3,...]" onBlur={(e) => e.target.value && handleImportSecretKey(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input className="mt-1 w-full rounded border p-2" readOnly value={publicKey || ''} placeholder="Not loaded" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={handleAirdrop} disabled={!publicKey || loading}>
            Airdrop 1 SOL
          </button>
          <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={handleClearBalance} disabled={!publicKey || loading}>
            Clear Balance
          </button>
          <button className="px-3 py-2 bg-gray-300 rounded" onClick={refreshBalance} disabled={!publicKey || loading}>
            Refresh Balance
          </button>
          <button className="px-3 py-2 bg-gray-200 rounded" onClick={handleClearLocal}>
            Remove from localStorage
          </button>
        </div>

        <div>
          <span className="text-sm text-gray-600">Balance:</span>{' '}
          <span className="font-mono">{balance ?? '—'}{balance != null ? ' SOL' : ''}</span>
        </div>
      </div>
    </section>
  );
}


