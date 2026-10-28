import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroRibbon } from './components/HeroRibbon';
import { DataTable } from './components/DataTable';
import { getQuote, getHistorical, getFundamentals } from './services/api';
import { exportToCSV } from './services/export';
import { AlertCircle } from 'lucide-react';

const TIMEFRAME = '1d';
const PERIOD = 'max';

function App() {
  const [ticker, setTicker] = useState('CANBK');

  const [quote, setQuote] = useState<any>(null);
  const [historical, setHistorical] = useState<any[]>([]);
  const [fundamentals, setFundamentals] = useState<any>(null);

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const fetchStockData = async (symbol: string) => {
    const requestId = ++latestRequest.current;
    const isStale = () => requestId !== latestRequest.current;
    setError(null);
    setIsLoadingQuote(true);
    setIsLoadingHistorical(true);
    setHistorical([]);

    try {
      const [quoteData, fundData] = await Promise.all([
        getQuote(symbol).catch(() => { throw new Error('Failed to fetch quote data. Ticker might be invalid or rate limited.'); }),
        getFundamentals(symbol).catch(() => null)
      ]);
      if (isStale()) return;

      setQuote(quoteData);
      setFundamentals(fundData);
      setIsLoadingQuote(false);

      const histData = await getHistorical(symbol, TIMEFRAME, PERIOD).catch(() => []);
      if (isStale()) return;
      setHistorical(histData);
    } catch (err: any) {
      if (isStale()) return;
      console.error(err);
      setError(err.message || 'An error occurred while fetching stock data.');
    } finally {
      if (!isStale()) {
        setIsLoadingQuote(false);
        setIsLoadingHistorical(false);
      }
    }
  };

  useEffect(() => {
    fetchStockData(ticker);
  }, [ticker]);

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

        <DataTable
          fundamentals={fundamentals}
          historical={historical}
          isLoading={isLoadingHistorical}
          onExport={handleExport}
        />
      </main>
    </div>
  );
}

export default App;
