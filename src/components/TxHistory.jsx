import React, { useEffect, useMemo, useState } from 'react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getRecentTransactions } from '../utils/solana.js';

const LOCAL_STORAGE_KEY = 'solana_wallet_secret';

export default function TxHistory() {
  const [sigs, setSigs] = useState([]);
  const [loading, setLoading] = useState(false);

  const pubkey = useMemo(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try {
      const arr = JSON.parse(saved);
      return Keypair.fromSecretKey(Uint8Array.from(arr)).publicKey;
    } catch (_) {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!pubkey) return setSigs([]);
      setLoading(true);
      try {
        const txs = await getRecentTransactions(pubkey, 10);
        if (!active) return;
        setSigs(txs);
      } catch (_) {
        if (active) setSigs([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [pubkey]);

  return (
    <section className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && sigs.length === 0 && <p className="text-sm text-gray-500">No transactions</p>}
      <ul className="list-disc pl-5 space-y-1">
        {sigs.map((sig) => (
          <li key={sig} className="font-mono text-sm break-all">{sig}</li>
        ))}
      </ul>
    </section>
  );
}


