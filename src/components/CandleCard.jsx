import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { motion } from 'framer-motion';

export default function CandleCard() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchOhlc() {
    try {
      // CoinGecko market chart in INR (last 1 day hourly)
      const url = 'https://api.coingecko.com/api/v3/coins/solana/ohlc?vs_currency=inr&days=1';
      const res = await fetch(url);
      const data = await res.json();
      // data: [timestamp, open, high, low, close]
      const candles = data.map(([t, o, h, l, c]) => ({
        time: Math.floor(t / 1000),
        open: Number(o),
        high: Number(h),
        low: Number(l),
        close: Number(c),
      }));
      if (candles.length > 0) {
        seriesRef.current.setData(candles);
        setPrice(candles[candles.length - 1].close);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      // fail silently; UI stays as-is
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#cbd5e1',
      },
      grid: {
        vertLines: { color: 'rgba(148,163,184,0.08)' },
        horzLines: { color: 'rgba(148,163,184,0.08)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)' },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      autoSize: true,
    });
    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      borderVisible: false,
    });
    seriesRef.current = series;

    fetchOhlc();
    const interval = setInterval(fetchOhlc, 45000);

    // Resize observer for responsiveness
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => chart.applyOptions({ autoSize: true }));
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      clearInterval(interval);
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.disconnect();
      }
      chart.remove();
    };
  }, []);

  const formatINR = (v) =>
    v == null
      ? '—'
      : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="relative rounded-3xl p-6 glass-card glass-card-hover overflow-hidden transition-transform duration-300 ease-in-out"
      style={{ minHeight: 300 }}
    >
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-slate-900/20 rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-neutral-900/30 to-slate-800/20 rounded-3xl"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-neutral-200 text-lg font-semibold">SOL/INR</h3>
            <p className="text-xs text-neutral-400">Candlestick (1d window)</p>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
            {formatINR(price)}
          </div>
        </div>
        <div ref={containerRef} className="flex-1" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        )}
        
        {/* Powered by TradingView label */}
        <div className="absolute bottom-4 right-4">
          <p className="text-xs text-neutral-500 opacity-60">Powered by TradingView</p>
        </div>
      </div>
      
      <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl" />
    </motion.div>
  );
}

