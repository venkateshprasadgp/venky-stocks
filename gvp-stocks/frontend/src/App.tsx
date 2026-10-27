import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroRibbon } from './components/HeroRibbon';
import { ChartWorkspace } from './components/ChartWorkspace';
import { ChartControls } from './components/ChartControls';
import { RSIPane } from './components/RSIPane';
import { DataTable } from './components/DataTable';
import { getQuote, getHistorical, getIndicators, getFundamentals } from './services/api';
import { exportToCSV } from './services/export';
import { AlertCircle } from 'lucide-react';

function App() {
  const [ticker, setTicker] = useState('CANBK');

  const [quote, setQuote] = useState<any>(null);
  const [historical, setHistorical] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any>(null);
  const [fundamentals, setFundamentals] = useState<any>(null);

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Chart Controls State
  const [timeframe, setTimeframe] = useState('1d');
  const [period, setPeriod] = useState('1y');

  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showRSI, setShowRSI] = useState(true);

  const fetchStockData = async (symbol: string, tf: string, pd: string) => {
    setError(null);
    setIsLoadingQuote(true);
    setIsLoadingChart(true);

    try {
      // Fetch quote & fundamentals in parallel
      const [quoteData, fundData] = await Promise.all([
        getQuote(symbol).catch(() => { throw new Error('Failed to fetch quote data. Ticker might be invalid or rate limited.'); }),
        getFundamentals(symbol).catch(() => null) // Fundamentals can fail gracefully
      ]);

      setQuote(quoteData);
      setFundamentals(fundData);
      setIsLoadingQuote(false);

      // Fetch historical & indicators in parallel
      const [histData, indData] = await Promise.all([
        getHistorical(symbol, tf, pd).catch(() => []),
        getIndicators(symbol).catch(() => null)
      ]);

      setHistorical(histData);
      setIndicators(indData);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching stock data.');
    } finally {
      setIsLoadingQuote(false);
      setIsLoadingChart(false);
    }
  };

  useEffect(() => {
    fetchStockData(ticker, timeframe, period);
  }, [ticker, timeframe, period]);

  const handleTimeframeChange = (tf: string, pd: string) => {
    setTimeframe(tf);
    setPeriod(pd);
  };

  const handleExport = () => {
    exportToCSV(ticker);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header onSelectTicker={setTicker} />

      {error && (
        <div className="bg-brand-red/10 border-l-4 border-brand-red p-4 mx-6 mt-6 rounded-r">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-brand-red mr-2" />
            <p className="text-brand-red font-medium">{error}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <HeroRibbon ticker={ticker} quote={quote} isLoading={isLoadingQuote} />

        <div className="flex flex-col border border-slate-800 rounded-lg overflow-hidden bg-slate-900 shadow-xl">
          <ChartControls
            timeframe={timeframe}
            period={period}
            onTimeframeChange={handleTimeframeChange}
            showSMA20={showSMA20} setShowSMA20={setShowSMA20}
            showSMA50={showSMA50} setShowSMA50={setShowSMA50}
            showSMA200={showSMA200} setShowSMA200={setShowSMA200}
            showBB={showBB} setShowBB={setShowBB}
            showRSI={showRSI} setShowRSI={setShowRSI}
          />
          <ChartWorkspace
            data={historical}
            indicators={indicators}
            isLoading={isLoadingChart}
            showSMA20={showSMA20}
            showSMA50={showSMA50}
            showSMA200={showSMA200}
            showBB={showBB}
          />
          <RSIPane indicators={indicators} visible={showRSI} />
        </div>

        <DataTable fundamentals={fundamentals} historical={historical} onExport={handleExport} />
      </main>
    </div>
  );
}

export default App;
