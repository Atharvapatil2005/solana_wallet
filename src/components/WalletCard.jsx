import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Premium glassy wallet card showing label, address, SOL + INR
export default function WalletCard({ balanceSol, address, walletLabel, onSend, onReceive }) {
  const [solPriceInr, setSolPriceInr] = useState(null);
  const [inrValue, setInrValue] = useState(null);

  // Fetch current SOL price in INR
  useEffect(() => {
    let isMounted = true;

    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr'
        );
        const data = await res.json();
        if (!isMounted) return;
        if (data?.solana?.inr) {
          setSolPriceInr(data.solana.inr);
        } else {
          // Fallback price
          setSolPriceInr(20000);
        }
      } catch (e) {
        console.error('Failed to fetch SOL price for wallet card:', e);
        if (isMounted) {
          setSolPriceInr(20000);
        }
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute INR equivalent when balance or price changes
  useEffect(() => {
    if (balanceSol == null || solPriceInr == null) {
      setInrValue(null);
      return;
    }
    setInrValue(balanceSol * solPriceInr);
  }, [balanceSol, solPriceInr]);

  const formatInr = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const shortenAddress = (addr) => {
    if (!addr) return 'No wallet loaded';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  };

  const label = walletLabel || 'Primary Wallet';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className="relative rounded-3xl p-6 md:p-7 glass-card glass-card-hover overflow-hidden transition-transform duration-300 ease-in-out"
      style={{
        color: 'var(--text-primary)',
        background:
          'linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(6, 182, 212, 0.25))',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Background decorative glows */}
      <div className="pointer-events-none">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-10 left-0 w-48 h-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
                Wallet
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/20 border border-white/10">
                {shortenAddress(address)}
              </span>
            </div>
            <p className="text-lg font-semibold text-white truncate">
              {label}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Total Balance
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                {balanceSol ?? '—'}
              </p>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-black/25 border border-white/10 text-emerald-100">
                SOL
              </span>
            </div>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
              ≈ {formatInr(inrValue)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-3 min-w-[160px]">
          <motion.button
            onClick={onSend}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="px-6 py-3 rounded-2xl border border-transparent bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold shadow-lg btn-glow-emerald transition-transform duration-200 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:shadow-emerald-400/40"
          >
            Send
          </motion.button>
          <motion.button
            onClick={onReceive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="px-6 py-3 rounded-2xl border border-transparent bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg btn-glow-cyan transition-transform duration-200 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:shadow-cyan-400/40"
          >
            Receive
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}


