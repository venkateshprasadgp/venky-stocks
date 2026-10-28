import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';

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
  isLoading?: boolean;
  onExport: () => void;
}

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];

const formatCurrency = (val: number | undefined) => {
  if (val === undefined || val === null) return '-';
  if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
  return '₹' + val.toLocaleString();
};

const formatRatio = (val: number | undefined) => {
  if (val === undefined || val === null) return '-';
  return val.toFixed(2);
};

export const DataTable: React.FC<DataTableProps> = ({ fundamentals, historical, isLoading = false, onExport }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'historical'>('historical');
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [page, setPage] = useState(0);
  const [prevHistorical, setPrevHistorical] = useState(historical);

  if (prevHistorical !== historical) {
    setPrevHistorical(historical);
    setPage(0);
  }

  const rows = useMemo(() => historical.slice().reverse(), [historical]);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex-1 flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-800 px-4">
        <div className="flex gap-6">
          <button
            className={clsx("py-4 text-sm font-medium transition-colors border-b-2", activeTab === 'historical' ? "border-brand-green text-brand-green" : "border-transparent text-slate-400 hover:text-slate-200")}
            onClick={() => setActiveTab('historical')}
          >
            Historical Data
          </button>
          <button
            className={clsx("py-4 text-sm font-medium transition-colors border-b-2", activeTab === 'summary' ? "border-brand-green text-brand-green" : "border-transparent text-slate-400 hover:text-slate-200")}
            onClick={() => setActiveTab('summary')}
          >
            Summary Ratios
          </button>
        </div>

        {activeTab === 'historical' && (
          <button
            onClick={onExport}
            disabled={isLoading || rows.length === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV (All)
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
              <span className="text-white font-medium">{formatRatio(fundamentals?.dividendYield)}%</span>
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
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
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
                  {pageRows.map((row) => (
                    <tr key={row.time} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-4 text-sm text-slate-300">{row.time}</td>
                      <td className="py-2 px-4 text-sm text-slate-300 text-right">{row.open.toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-slate-300 text-right">{row.high.toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-slate-300 text-right">{row.low.toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-slate-300 text-right">{row.close.toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-slate-300 text-right">{row.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading full daily history...
                </div>
              )}
              {!isLoading && rows.length === 0 && (
                <div className="text-center py-10 text-sm text-slate-500">No historical data available.</div>
              )}
            </div>

            {rows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span>
                    {(pageStart + 1).toLocaleString()}–{Math.min(pageStart + pageSize, rows.length).toLocaleString()} of {rows.length.toLocaleString()} days
                    {' '}({rows[rows.length - 1].time} → {rows[0].time})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[
                    { icon: ChevronsLeft, label: 'First page', target: 0, disabled: currentPage === 0 },
                    { icon: ChevronLeft, label: 'Previous page', target: currentPage - 1, disabled: currentPage === 0 },
                  ].map(({ icon: Icon, label, target, disabled }) => (
                    <button key={label} aria-label={label} onClick={() => setPage(target)} disabled={disabled}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                  <span className="px-2">Page {currentPage + 1} of {totalPages}</span>
                  {[
                    { icon: ChevronRight, label: 'Next page', target: currentPage + 1, disabled: currentPage >= totalPages - 1 },
                    { icon: ChevronsRight, label: 'Last page', target: totalPages - 1, disabled: currentPage >= totalPages - 1 },
                  ].map(({ icon: Icon, label, target, disabled }) => (
                    <button key={label} aria-label={label} onClick={() => setPage(target)} disabled={disabled}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
