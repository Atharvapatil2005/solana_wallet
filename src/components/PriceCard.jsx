import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline.jsx';

export default function PriceCard() {
  const [sparklineData, setSparklineData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchPriceData = async () => {
    try {
      // Fetch current price and 24h change
      const priceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr&include_24hr_change=true'
      );
      const priceData = await priceResponse.json();
      
      const price = priceData.solana.inr;
      const change = priceData.solana.inr_24h_change;
      
      setCurrentPrice(price);
      setPriceChange(change);
      
      // Fetch historical data for sparkline (last 24 hours)
      const chartResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=inr&days=1'
      );
      const chartData = await chartResponse.json();
      
      // Extract prices from the market_chart response
      // Format: [[timestamp, price], ...]
      if (chartData.prices && Array.isArray(chartData.prices)) {
        const prices = chartData.prices.map(([timestamp, price]) => price);
        // Take last 24-30 points for a smooth sparkline
        const recentPrices = prices.slice(-24);
        setSparklineData(recentPrices);
      }
      
      setLastUpdated(Date.now());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch price data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    // Update every 30 seconds
    const interval = setInterval(fetchPriceData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastUpdated === 0) return;
    
    const updateSeconds = () => {
      const diff = Math.floor((Date.now() - lastUpdated) / 1000);
      setSecondsAgo(diff);
    };
    
    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change) => {
    if (!change) return '0.00';
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-neutral-200 text-lg font-semibold">SOL Price</h3>
            <p className="text-xs text-neutral-400">Live market data</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs text-neutral-400">Live</span>
          </div>
        </div>
        
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <>
            {/* Price Display */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
                  {formatPrice(currentPrice)}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                  priceChange >= 0 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {priceChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {formatChange(priceChange)}
                </div>
              </div>
              <p className="text-sm text-neutral-400">24h change</p>
            </div>
            
            {/* Sparkline Chart */}
            <div className="h-20 w-full">
              <Sparkline data={sparklineData} height={80} className="w-full" />
            </div>
            
            {/* Last updated label */}
            {lastUpdated > 0 && sparklineData.length > 0 && (
              <div className="mt-2 text-center">
                <p className="text-xs text-neutral-500">
                  Last updated {secondsAgo} {secondsAgo === 1 ? 'second' : 'seconds'} ago
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Decorative glow */}
      <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl"></div>
    </motion.div>
  );
}
