
import React, { useMemo } from 'react';
import { OHLC, ChartOverlay } from '../types';

interface SmartChartProps {
  candles: OHLC[];
  overlays?: ChartOverlay[];
  height?: number;
}

const SmartChart: React.FC<SmartChartProps> = React.memo(({ candles = [], overlays = [], height = 400 }) => {
  if (!candles || candles.length === 0) return (
      <div className="flex flex-col items-center justify-center bg-gray-900 border border-gray-800 rounded-xl text-gray-500" style={{ height }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className="text-sm font-medium">Chart data unavailable</span>
      </div>
  );

  const width = 800; // Internal SVG coordinate width
  // Split height for Price (70%), RSI (15%), MACD (15%)
  const priceHeight = height * 0.7;
  const rsiHeight = height * 0.15;
  const macdHeight = height * 0.15;
  
  const padding = { top: 20, right: 60, bottom: 20, left: 10 };

  // --- MEMOIZED CALCULATIONS (Run only when candles change) ---
  
  const { vwapValues, minPrice, maxPrice, getX, getY, candleWidth, vwapPoints } = useMemo(() => {
      let cumVol = 0;
      let cumPV = 0;
      const vwapVals = candles.map(c => {
        const tp = (c.high + c.low + c.close) / 3;
        cumPV += tp * c.volume;
        cumVol += c.volume;
        return cumVol === 0 ? tp : cumPV / cumVol;
      });

      const prices = candles.flatMap(c => [c.high, c.low]);
      const allValues = [...prices, ...vwapVals];
      const minP = Math.min(...allValues);
      const maxP = Math.max(...allValues);
      const range = maxP - minP || 1;
      
      const yMin = minP - (range * 0.05);
      const yMax = maxP + (range * 0.05);
      const yRange = yMax - yMin || 1;

      const calcX = (i: number) => padding.left + (i / (Math.max(1, candles.length - 1))) * (width - padding.left - padding.right);
      const calcY = (p: number) => padding.top + (priceHeight - padding.top - padding.bottom) - ((p - yMin) / yRange) * (priceHeight - padding.top - padding.bottom);
      
      const cWidth = Math.max(2, (width - padding.left - padding.right) / candles.length * 0.6);
      const vPoints = vwapVals.map((v, i) => `${calcX(i)},${calcY(v)}`).join(" ");

      return { vwapValues: vwapVals, minPrice: yMin, maxPrice: yMax, getX: calcX, getY: calcY, candleWidth: cWidth, vwapPoints: vPoints };
  }, [candles, width, priceHeight]);

  // --- RSI Calculation Memo ---
  const { rsiPoints, rsiY } = useMemo(() => {
      const rsiTop = priceHeight;
      const rsiH = rsiHeight - 5;
      const calcRsiY = (val: number) => rsiTop + rsiH - ((val || 50) / 100) * rsiH;
      const points = candles.map((c, i) => `${getX(i)},${calcRsiY(c.rsi || 50)}`).join(" ");
      return { rsiPoints: points, rsiY: calcRsiY };
  }, [candles, priceHeight, rsiHeight, getX]);

  // --- MACD Calculation Memo ---
  const { macdPaths } = useMemo(() => {
      const macdTop = priceHeight + rsiHeight;
      const macdH = macdHeight - 5;
      // Find min/max for scaling
      const macdVals = candles.flatMap(c => [c.macd || 0, c.macdSignal || 0, c.macdHist || 0]);
      const minM = Math.min(...macdVals, -0.5);
      const maxM = Math.max(...macdVals, 0.5);
      const rangeM = maxM - minM || 1;
      
      const calcMacdY = (val: number) => macdTop + macdH - ((val - minM) / rangeM) * macdH;
      
      const macdLine = candles.map((c, i) => `${getX(i)},${calcMacdY(c.macd || 0)}`).join(" ");
      const signalLine = candles.map((c, i) => `${getX(i)},${calcMacdY(c.macdSignal || 0)}`).join(" ");
      
      return { macdPaths: { macd: macdLine, signal: signalLine, calcY: calcMacdY } };
  }, [candles, priceHeight, rsiHeight, macdHeight, getX]);


  return (
    <div className="w-full overflow-hidden bg-gray-900 rounded-xl border border-gray-800 relative select-none group">
      
      {/* Legend */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none z-10 opacity-70">
         <div className="flex items-center gap-1.5 bg-gray-900/80 px-2 py-1 rounded border border-gray-700 backdrop-blur-sm">
             <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
             <span className="text-[10px] text-purple-200 font-bold">VWAP</span>
         </div>
         {overlays.filter(o => o.type !== 'Pattern').map((ov, i) => (
             <div key={i} className="flex items-center gap-1.5 bg-gray-900/80 px-2 py-1 rounded border border-gray-700 backdrop-blur-sm">
                 <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ov.color || '#FBBF24' }}></span>
                 <span className="text-[10px] text-gray-300 font-bold">{ov.label}</span>
             </div>
         ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block shape-rendering-geometricPrecision">
        {/* === MAIN PRICE CHART === */}
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + (priceHeight - padding.top - padding.bottom) * pct;
            return <line key={pct} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#374151" strokeWidth="0.5" strokeDasharray="4" />;
        })}

        {/* VWAP */}
        <polyline points={vwapPoints} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Candles */}
        {candles.map((c, i) => {
          const x = getX(i);
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          const isGreen = c.close >= c.open;
          const color = isGreen ? '#10B981' : '#EF4444';

          return (
            <g key={i}>
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
              <rect x={x - candleWidth / 2} y={Math.min(yOpen, yClose)} width={candleWidth} height={Math.max(1, Math.abs(yClose - yOpen))} fill={color} />
            </g>
          );
        })}

        {/* Overlays (S/R and Zones) */}
        {overlays.map((ov, i) => {
           // Horizontal Levels (Resistance/Support/Zones)
           if (ov.yValue !== undefined) {
               const y = getY(ov.yValue);
               const isMajor = ov.strength === 'Major';
               const opacity = ov.confidenceScore ? ov.confidenceScore / 100 : (isMajor ? 0.9 : 0.6);
               const strokeWidth = isMajor ? 2 : 1;
               const dashArray = isMajor ? "" : "5,3";

               // For Zones (HVN, Zones), render a shaded area if needed, simplified here as thick line
               const isZone = ov.type === 'Zone' || ov.label.includes('HVN');
               
               return (
                   <g key={`ov-${i}`} className="group/line">
                       {/* Transparent hit area for hover */}
                       <rect x={padding.left} y={y - 5} width={width - padding.left - padding.right} height={10} fill="transparent" />
                       
                       {isZone ? (
                          <rect x={padding.left} y={y-4} width={width - padding.left - padding.right} height={8} fill={ov.color} fillOpacity="0.15" />
                       ) : null}

                       <line 
                         x1={padding.left} 
                         y1={y} 
                         x2={width - padding.right} 
                         y2={y} 
                         stroke={ov.color || '#FBBF24'} 
                         strokeWidth={strokeWidth} 
                         strokeDasharray={dashArray} 
                         opacity={opacity} 
                       />
                       
                       {/* Label on Axis */}
                       <text x={width - 55} y={y - 4} fill={ov.color} fontSize="9" fontWeight="bold">{ov.label}</text>
                       
                       {/* Tooltip on Hover via SVG title */}
                       <title>{`${ov.type}: $${ov.yValue}\n${ov.strength || 'Normal'} Strength (${ov.confidenceScore}%)\nMethod: ${ov.method || 'Unknown'}\nTouches: ${ov.testCount || 0}\n${ov.description || ''}`}</title>
                   </g>
               );
           }
           // Polyline Overlays (Patterns, Trendlines)
           if (ov.points) {
               const pointsStr = ov.points.map(p => `${getX(p.index)},${getY(p.price)}`).join(" ");
               return (
                 <g key={`ov-${i}`}>
                   <polyline points={pointsStr} fill="none" stroke={ov.color} strokeWidth="2" />
                   <title>{`${ov.label}\n${ov.description || ''}`}</title>
                 </g>
               );
           }
           return null;
        })}

        {/* Price Labels */}
        {[0, 0.5, 1].map(pct => {
            const price = maxPrice - ((maxPrice - minPrice) * pct);
            const y = padding.top + (priceHeight - padding.top - padding.bottom) * pct;
            return <text key={`pl-${pct}`} x={width - 55} y={y + 3} fill="#9CA3AF" fontSize="10">${price.toFixed(2)}</text>;
        })}

        {/* === RSI PANEL === */}
        <line x1={padding.left} y1={priceHeight} x2={width - padding.right} y2={priceHeight} stroke="#374151" strokeWidth="1" />
        <rect x={padding.left} y={rsiY(70)} width={width - padding.left - padding.right} height={rsiY(30) - rsiY(70)} fill="#374151" fillOpacity="0.1" />
        <line x1={padding.left} y1={rsiY(70)} x2={width - padding.right} y2={rsiY(70)} stroke="#4B5563" strokeDasharray="2" strokeWidth="0.5" />
        <line x1={padding.left} y1={rsiY(30)} x2={width - padding.right} y2={rsiY(30)} stroke="#4B5563" strokeDasharray="2" strokeWidth="0.5" />
        <polyline points={rsiPoints} fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        <text x={10} y={priceHeight + 15} fill="#6B7280" fontSize="9" fontWeight="bold">RSI (14)</text>

        {/* === MACD PANEL === */}
        <line x1={padding.left} y1={priceHeight + rsiHeight} x2={width - padding.right} y2={priceHeight + rsiHeight} stroke="#374151" strokeWidth="1" />
        <polyline points={macdPaths.macd} fill="none" stroke="#3B82F6" strokeWidth="1.5" />
        <polyline points={macdPaths.signal} fill="none" stroke="#F97316" strokeWidth="1.5" />
        {candles.map((c, i) => {
            const h = c.macdHist || 0;
            const yZero = macdPaths.calcY(0);
            const yVal = macdPaths.calcY(h);
            return <line key={`h-${i}`} x1={getX(i)} y1={yZero} x2={getX(i)} y2={yVal} stroke={h >= 0 ? '#10B981' : '#EF4444'} strokeWidth={Math.max(1, candleWidth-1)} opacity="0.6" />;
        })}
        <text x={10} y={priceHeight + rsiHeight + 15} fill="#6B7280" fontSize="9" fontWeight="bold">MACD (12,26,9)</text>

      </svg>
    </div>
  );
});

export default SmartChart;
