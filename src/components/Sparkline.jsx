import React, { useRef, useEffect, useState } from 'react';

export default function Sparkline({ data, width = '100%', height = 80, className = '' }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(200);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setSvgWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  if (!data || data.length < 2) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center ${className}`} style={{ height }}>
        <span className="text-xs text-neutral-500">Loading...</span>
      </div>
    );
  }

  // Extract prices from data array
  const prices = data.map(d => typeof d === 'number' ? d : d.price || d);
  
  // Calculate dimensions
  const padding = 4;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Find min and max for scaling
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1; // Avoid division by zero
  
  // Calculate points for the line
  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * chartWidth;
    const y = chartHeight - ((price - minPrice) / range) * chartHeight;
    return { x: x + padding, y: y + padding };
  });
  
  // Create path string for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Create path for area fill (closed path)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight + padding} L ${points[0].x} ${chartHeight + padding} Z`;

  return (
    <div ref={containerRef} className={`${className}`} style={{ height, width }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="sparklineFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#sparklineFill)"
        />
        
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#sparklineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))' }}
        />
      </svg>
    </div>
  );
}

