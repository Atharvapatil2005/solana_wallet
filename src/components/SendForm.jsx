import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { sendSol } from '../utils/solana.js';

const LOCAL_STORAGE_KEY = 'solana_wallet_secret';

export default function SendForm() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const keypair = useMemo(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try {
      const arr = JSON.parse(saved);
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    } catch (_) {
      return null;
    }
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!keypair) return toast.info('Create or import a wallet first');
    setLoading(true);
    try {
      const recipient = new PublicKey(to.trim());
      const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);
      if (!Number.isFinite(lamports) || lamports <= 0) throw new Error('Invalid amount');
      const sig = await sendSol(keypair, recipient, lamports);
      toast.success(`Sent: ${sig}`);
    } catch (e) {
      toast.error(`Send failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-3">Send SOL</h2>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Recipient Address</label>
          <input className="mt-1 w-full rounded border p-2" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient public key" />
        </div>
        <div>
          <label className="block text-sm font-medium">Amount (SOL)</label>
          <input className="mt-1 w-full rounded border p-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.1" />
        </div>
        <div className="sm:col-span-3">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit" disabled={loading}>
            Send
          </button>
        </div>
      </form>
    </section>
  );
}


