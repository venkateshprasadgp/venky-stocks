import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface QuoteData {
  ltp: number;
  dayChange: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  high52w: number;
  low52w: number;
  volume: number;
  previousClose: number;
}

interface HeroRibbonProps {
  ticker: string;
  quote: QuoteData | null;
  isLoading: boolean;
}

const formatNumber = (num: number) => {
  if (!num) return '-';
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(2) + ' K';
  return num.toString();
};

export const HeroRibbon: React.FC<HeroRibbonProps> = ({ ticker, quote, isLoading }) => {
  if (isLoading || !quote) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 p-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-16 bg-slate-800 rounded"></div>
          <div className="h-16 bg-slate-800 rounded"></div>
          <div className="h-16 bg-slate-800 rounded"></div>
          <div className="h-16 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  const isPositive = quote.dayChange >= 0;

  // Calculate slider positions safely
  const dayRangeSpread = quote.dayHigh - quote.dayLow;
  const dayRangePos = dayRangeSpread > 0 ? ((quote.ltp - quote.dayLow) / dayRangeSpread) * 100 : 50;

  const w52Spread = quote.high52w - quote.low52w;
  const w52Pos = w52Spread > 0 ? ((quote.ltp - quote.low52w) / w52Spread) * 100 : 50;

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

        {/* Main Price Display */}
        <div className="flex flex-col">
          <h2 className="text-sm font-medium text-slate-400 mb-1">{ticker}</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white">₹{quote.ltp?.toFixed(2)}</span>
            <div className={clsx(
              "flex items-center px-2 py-1 rounded text-sm font-semibold",
              isPositive ? "bg-brand-green/20 text-brand-green" : "bg-brand-red/20 text-brand-red"
            )}>
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(quote.dayChange)?.toFixed(2)} ({Math.abs(quote.changePercent)?.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Day Range */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-2 flex justify-between">
              <span>Day Low</span>
              <span>Day High</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2 relative">
              <div
                className="absolute w-2 h-2.5 bg-white rounded-sm top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${Math.min(Math.max(dayRangePos, 0), 100)}%` }}
              />
            </div>
            <div className="text-sm text-white flex justify-between font-medium">
              <span>{quote.dayLow?.toFixed(2) || '-'}</span>
              <span>{quote.dayHigh?.toFixed(2) || '-'}</span>
            </div>
          </div>

          {/* 52W Range */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-2 flex justify-between">
              <span>52W Low</span>
              <span>52W High</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2 relative">
              <div
                className="absolute w-2 h-2.5 bg-white rounded-sm top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${Math.min(Math.max(w52Pos, 0), 100)}%` }}
              />
            </div>
            <div className="text-sm text-white flex justify-between font-medium">
              <span>{quote.low52w?.toFixed(2) || '-'}</span>
              <span>{quote.high52w?.toFixed(2) || '-'}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col justify-center">
            <span className="text-xs text-slate-400 mb-1">Volume</span>
            <span className="text-lg font-semibold text-white">{formatNumber(quote.volume)}</span>
          </div>

          {/* Previous Close */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col justify-center">
            <span className="text-xs text-slate-400 mb-1">Prev. Close</span>
            <span className="text-lg font-semibold text-white">₹{quote.previousClose?.toFixed(2) || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
