import React, { useState } from 'react';
import clsx from 'clsx';
import { Download } from 'lucide-react';

interface Fundamentals {
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  sectorPe?: number;
  eps?: number;
  dividendYield?: number;
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
}

interface HistoricalRecord {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DataTableProps {
  fundamentals: Fundamentals | null;
  historical: HistoricalRecord[];
  onExport: () => void;
}

const formatCurrency = (val: number | undefined) => {
  if (val === undefined || val === null) return '-';
  if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
  return '₹' + val.toLocaleString();
};

const formatRatio = (val: number | undefined, percent = false) => {
  if (val === undefined || val === null) return '-';
  return percent ? (val * 100).toFixed(2) + '%' : val.toFixed(2);
};

export const DataTable: React.FC<DataTableProps> = ({ fundamentals, historical, onExport }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'historical'>('summary');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden mt-6">
      <div className="flex justify-between items-center border-b border-slate-800 px-4">
        <div className="flex gap-6">
          <button
            className={clsx("py-4 text-sm font-medium transition-colors border-b-2", activeTab === 'summary' ? "border-brand-green text-brand-green" : "border-transparent text-slate-400 hover:text-slate-200")}
            onClick={() => setActiveTab('summary')}
          >
            Summary Ratios
          </button>
          <button
            className={clsx("py-4 text-sm font-medium transition-colors border-b-2", activeTab === 'historical' ? "border-brand-green text-brand-green" : "border-transparent text-slate-400 hover:text-slate-200")}
            onClick={() => setActiveTab('historical')}
          >
            Historical Data
          </button>
        </div>

        {activeTab === 'historical' && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      <div className="p-4">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">Market Cap</span>
              <span className="text-white font-medium">{formatCurrency(fundamentals?.marketCap)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">P/E Ratio</span>
              <span className="text-white font-medium">{formatRatio(fundamentals?.peRatio)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">P/B Ratio</span>
              <span className="text-white font-medium">{formatRatio(fundamentals?.pbRatio)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">Sector P/E</span>
              <span className="text-white font-medium">{formatRatio(fundamentals?.sectorPe)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">EPS (TTM)</span>
              <span className="text-white font-medium">{formatRatio(fundamentals?.eps)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">Dividend Yield</span>
              <span className="text-white font-medium">{formatRatio(fundamentals?.dividendYield, true)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">52 Week High</span>
              <span className="text-white font-medium">₹{formatRatio(fundamentals?.['52WeekHigh'])}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs mb-1">52 Week Low</span>
              <span className="text-white font-medium">₹{formatRatio(fundamentals?.['52WeekLow'])}</span>
            </div>
          </div>
        )}

        {activeTab === 'historical' && (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 shadow-sm">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">Date</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-right">Open</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-right">High</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-right">Low</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-right">Close</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {historical.slice().reverse().slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-4 text-sm text-slate-300">{row.time}</td>
                    <td className="py-2 px-4 text-sm text-slate-300 text-right">{(row.open).toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm text-slate-300 text-right">{(row.high).toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm text-slate-300 text-right">{(row.low).toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm text-slate-300 text-right">{(row.close).toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm text-slate-300 text-right">{row.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historical.length > 50 && (
              <div className="text-center py-4 text-xs text-slate-500">
                Showing last 50 records. Use the Export function for full data.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
