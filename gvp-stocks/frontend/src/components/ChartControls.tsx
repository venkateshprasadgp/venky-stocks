import React from 'react';
import clsx from 'clsx';

interface ChartControlsProps {
  timeframe: string;
  period: string;
  onTimeframeChange: (tf: string, pd: string) => void;
  showSMA20: boolean;
  setShowSMA20: (v: boolean) => void;
  showSMA50: boolean;
  setShowSMA50: (v: boolean) => void;
  showSMA200: boolean;
  setShowSMA200: (v: boolean) => void;
  showBB: boolean;
  setShowBB: (v: boolean) => void;
  showRSI: boolean;
  setShowRSI: (v: boolean) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  period, onTimeframeChange,
  showSMA20, setShowSMA20,
  showSMA50, setShowSMA50,
  showSMA200, setShowSMA200,
  showBB, setShowBB,
  showRSI, setShowRSI
}) => {
  const periods = [
    { label: '1M', pd: '1mo', tf: '1d' },
    { label: '3M', pd: '3mo', tf: '1d' },
    { label: '6M', pd: '6mo', tf: '1d' },
    { label: '1Y', pd: '1y', tf: '1d' },
    { label: '5Y', pd: '5y', tf: '1wk' },
    { label: 'ALL', pd: 'max', tf: '1mo' },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border-b border-slate-800 p-3 gap-4">
      {/* Timeframes */}
      <div className="flex bg-slate-800 rounded p-1">
        {periods.map(p => (
          <button
            key={p.label}
            onClick={() => onTimeframeChange(p.tf, p.pd)}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              period === p.pd ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Indicators */}
      <div className="flex flex-wrap gap-3 text-xs items-center">
        <span className="text-slate-500 font-medium">Indicators:</span>
        <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
          <input type="checkbox" checked={showSMA20} onChange={(e) => setShowSMA20(e.target.checked)} className="accent-blue-500" />
          SMA 20
        </label>
        <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
          <input type="checkbox" checked={showSMA50} onChange={(e) => setShowSMA50(e.target.checked)} className="accent-yellow-500" />
          SMA 50
        </label>
        <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
          <input type="checkbox" checked={showSMA200} onChange={(e) => setShowSMA200(e.target.checked)} className="accent-pink-500" />
          SMA 200
        </label>
        <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
          <input type="checkbox" checked={showBB} onChange={(e) => setShowBB(e.target.checked)} className="accent-purple-500" />
          Bollinger Bands
        </label>
        <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
          <input type="checkbox" checked={showRSI} onChange={(e) => setShowRSI(e.target.checked)} className="accent-brand-green" />
          RSI (14)
        </label>
      </div>
    </div>
  );
};
