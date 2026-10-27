import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import type { IChartApi, Time, LineData } from 'lightweight-charts';

interface IndicatorsData {
  time?: string[];
  rsi14?: (number | null)[];
}

interface RSIPaneProps {
  indicators: IndicatorsData | null;
  visible: boolean;
}

export const RSIPane: React.FC<RSIPaneProps> = ({ indicators, visible }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<any>(null);
  const rsiUpperRef = useRef<any>(null);
  const rsiLowerRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !visible) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0B0E14' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      width: chartContainerRef.current.clientWidth,
      height: 150,
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { autoScale: false },
      crosshair: {
        mode: 1,
        vertLine: { color: '#475569', width: 1, style: 1 },
        horzLine: { color: '#475569', width: 1, style: 1 },
      }
    });

    // Explicitly set the price range
    chart.timeScale().fitContent();
    const rightPriceScale = chart.priceScale('right');
    rightPriceScale.applyOptions({
      autoScale: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });

    chartRef.current = chart;

    rsiSeriesRef.current = chart.addSeries(LineSeries, { color: '#00C076', lineWidth: 2, autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 }}) });

    // Threshold lines
    rsiUpperRef.current = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 }}) });
    rsiLowerRef.current = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 }}) });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !indicators || !indicators.time || !indicators.rsi14) return;

    const formatLineData = (values: (number | null)[]): LineData[] => {
      if (!indicators.time) return [];
      return indicators.time.map((t, i) => ({
        time: t as Time,
        value: values[i] as number
      })).filter(d => d.value !== null && d.value !== undefined)
      .sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());
    };

    const rsiData = formatLineData(indicators.rsi14);
    if (rsiData.length > 0 && rsiSeriesRef.current) {
      rsiSeriesRef.current.setData(rsiData);

      const upperLineData = rsiData.map(d => ({ time: d.time, value: 70 }));
      const lowerLineData = rsiData.map(d => ({ time: d.time, value: 30 }));

      rsiUpperRef.current?.setData(upperLineData);
      rsiLowerRef.current?.setData(lowerLineData);

      chartRef.current?.timeScale().fitContent();
    }
  }, [indicators, visible]);

  if (!visible) return null;

  return (
    <div className="w-full border-t border-slate-800 bg-brand-dark relative">
      <div className="px-2 py-1 text-xs font-semibold text-slate-400 absolute z-10 pointer-events-none">RSI (14)</div>
      <div ref={chartContainerRef} className="w-full h-[150px]" />
    </div>
  );
};
