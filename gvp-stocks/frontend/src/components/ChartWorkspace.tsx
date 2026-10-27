import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, CandlestickData, Time, LineData } from 'lightweight-charts';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorsData {
  time?: string[];
  sma20?: (number | null)[];
  sma50?: (number | null)[];
  sma200?: (number | null)[];
  bb_upper?: (number | null)[];
  bb_lower?: (number | null)[];
}

interface ChartWorkspaceProps {
  data: ChartData[];
  indicators: IndicatorsData | null;
  isLoading: boolean;
  showSMA20?: boolean;
  showSMA50?: boolean;
  showSMA200?: boolean;
  showBB?: boolean;
}

export const ChartWorkspace: React.FC<ChartWorkspaceProps> = ({
  data,
  indicators,
  isLoading,
  showSMA20 = false,
  showSMA50 = false,
  showSMA200 = false,
  showBB = false
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  // Overlays
  const sma20Ref = useRef<any>(null);
  const sma50Ref = useRef<any>(null);
  const sma200Ref = useRef<any>(null);
  const bbUpperRef = useRef<any>(null);
  const bbLowerRef = useRef<any>(null);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0B0E14' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: { color: '#475569', width: 1, style: 1, labelBackgroundColor: '#1e293b' },
        horzLine: { color: '#475569', width: 1, style: 1, labelBackgroundColor: '#1e293b' },
      }
    });

    chartRef.current = chart;

    // Candlestick Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C076',
      downColor: '#FF3B30',
      borderVisible: false,
      wickUpColor: '#00C076',
      wickDownColor: '#FF3B30',
    });
    seriesRef.current = candlestickSeries;

    // Overlay Series
    sma20Ref.current = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, visible: false });
    sma50Ref.current = chart.addSeries(LineSeries, { color: '#eab308', lineWidth: 1, visible: false });
    sma200Ref.current = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 1, visible: false });
    bbUpperRef.current = chart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 1, lineStyle: 2, visible: false });
    bbLowerRef.current = chart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 1, lineStyle: 2, visible: false });

    // Set up tooltip
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined || !param.time ||
        param.point.x < 0 || param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 || param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setTooltip((prev) => (prev ? { ...prev, visible: false } : null));
        return;
      }

      const dataPoint = param.seriesData.get(candlestickSeries) as CandlestickData;
      if (dataPoint) {
        const originalPoint = data.find(d => d.time === param.time);
        setTooltip({
          visible: true,
          x: param.point.x,
          y: param.point.y,
          date: param.time as string,
          open: dataPoint.open,
          high: dataPoint.high,
          low: dataPoint.low,
          close: dataPoint.close,
          volume: originalPoint?.volume || 0
        });
      }
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  // Handle data updates
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const chartData: CandlestickData[] = data.map(d => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })).sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());

      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  // Handle Indicators visibility and data
  useEffect(() => {
    if (!indicators || !indicators.time) return;

    const formatLineData = (values: (number | null)[] | undefined): LineData[] => {
      if (!values || !indicators.time) return [];
      return indicators.time.map((t, i) => ({
        time: t as Time,
        value: values[i] as number
      })).filter(d => d.value !== null && d.value !== undefined)
      .sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());
    };

    if (sma20Ref.current) {
      sma20Ref.current.applyOptions({ visible: showSMA20 });
      if (showSMA20 && indicators.sma20) sma20Ref.current.setData(formatLineData(indicators.sma20));
    }
    if (sma50Ref.current) {
      sma50Ref.current.applyOptions({ visible: showSMA50 });
      if (showSMA50 && indicators.sma50) sma50Ref.current.setData(formatLineData(indicators.sma50));
    }
    if (sma200Ref.current) {
      sma200Ref.current.applyOptions({ visible: showSMA200 });
      if (showSMA200 && indicators.sma200) sma200Ref.current.setData(formatLineData(indicators.sma200));
    }
    if (bbUpperRef.current && bbLowerRef.current) {
      bbUpperRef.current.applyOptions({ visible: showBB });
      bbLowerRef.current.applyOptions({ visible: showBB });
      if (showBB && indicators.bb_upper && indicators.bb_lower) {
        bbUpperRef.current.setData(formatLineData(indicators.bb_upper));
        bbLowerRef.current.setData(formatLineData(indicators.bb_lower));
      }
    }
  }, [indicators, showSMA20, showSMA50, showSMA200, showBB]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] bg-slate-900 animate-pulse border border-slate-800 flex items-center justify-center">
        <span className="text-slate-500">Loading Chart Data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] bg-slate-900 border border-slate-800 flex items-center justify-center">
        <span className="text-slate-500">No chart data available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full border border-slate-800 rounded-lg overflow-hidden bg-brand-dark">
      {tooltip && tooltip.visible && (
        <div
          className="absolute z-10 bg-slate-800/90 border border-slate-700 text-xs text-white p-2 rounded shadow-lg pointer-events-none"
          style={{
            left: Math.min(tooltip.x + 15, chartContainerRef.current?.clientWidth! - 150) + 'px',
            top: Math.max(tooltip.y - 15, 10) + 'px'
          }}
        >
          <div className="font-semibold mb-1 text-slate-300">{tooltip.date}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-slate-400">O:</span> <span className={tooltip.open > tooltip.close ? "text-brand-red" : "text-brand-green"}>{tooltip.open.toFixed(2)}</span>
            <span className="text-slate-400">H:</span> <span>{tooltip.high.toFixed(2)}</span>
            <span className="text-slate-400">L:</span> <span>{tooltip.low.toFixed(2)}</span>
            <span className="text-slate-400">C:</span> <span className={tooltip.close >= tooltip.open ? "text-brand-green" : "text-brand-red"}>{tooltip.close.toFixed(2)}</span>
            <span className="text-slate-400 col-span-1">Vol:</span> <span className="col-span-1">{tooltip.volume.toLocaleString()}</span>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  );
};
