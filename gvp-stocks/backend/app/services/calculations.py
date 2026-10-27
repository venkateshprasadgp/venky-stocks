import pandas as pd
import ta
from typing import Dict, Any, List
import numpy as np

def calculate_indicators(df: pd.DataFrame) -> Dict[str, Any]:
    if df is None or df.empty:
        return {}

    result = {}

    try:
        # Moving Averages
        result["sma20"] = ta.trend.sma_indicator(df["Close"], window=20).replace([np.inf, -np.inf, np.nan], None).tolist()
        result["sma50"] = ta.trend.sma_indicator(df["Close"], window=50).replace([np.inf, -np.inf, np.nan], None).tolist()
        result["sma200"] = ta.trend.sma_indicator(df["Close"], window=200).replace([np.inf, -np.inf, np.nan], None).tolist()
        result["ema9"] = ta.trend.ema_indicator(df["Close"], window=9).replace([np.inf, -np.inf, np.nan], None).tolist()
        result["ema21"] = ta.trend.ema_indicator(df["Close"], window=21).replace([np.inf, -np.inf, np.nan], None).tolist()

        # Momentum
        result["rsi14"] = ta.momentum.rsi(df["Close"], window=14).replace([np.inf, -np.inf, np.nan], None).tolist()

        # Trend/Volatility
        macd = ta.trend.MACD(df["Close"], window_slow=26, window_fast=12, window_sign=9)
        result["macd"] = macd.macd().replace([np.inf, -np.inf, np.nan], None).tolist()
        result["macd_signal"] = macd.macd_signal().replace([np.inf, -np.inf, np.nan], None).tolist()
        result["macd_histogram"] = macd.macd_diff().replace([np.inf, -np.inf, np.nan], None).tolist()

        bollinger = ta.volatility.BollingerBands(df["Close"], window=20, window_dev=2)
        result["bb_upper"] = bollinger.bollinger_hband().replace([np.inf, -np.inf, np.nan], None).tolist()
        result["bb_lower"] = bollinger.bollinger_lband().replace([np.inf, -np.inf, np.nan], None).tolist()
        result["bb_mavg"] = bollinger.bollinger_mavg().replace([np.inf, -np.inf, np.nan], None).tolist()

        # Support & Resistance (Classic Pivots based on last complete day)
        if len(df) >= 2:
            last_day = df.iloc[-2] # using previous day for today's pivots
            high = last_day["High"]
            low = last_day["Low"]
            close = last_day["Close"]

            pivot = (high + low + close) / 3
            r1 = (2 * pivot) - low
            s1 = (2 * pivot) - high
            r2 = pivot + (high - low)
            s2 = pivot - (high - low)

            result["pivots"] = {
                "P": float(pivot) if not pd.isna(pivot) else None,
                "R1": float(r1) if not pd.isna(r1) else None,
                "S1": float(s1) if not pd.isna(s1) else None,
                "R2": float(r2) if not pd.isna(r2) else None,
                "S2": float(s2) if not pd.isna(s2) else None,
            }
        else:
            result["pivots"] = None

        # Add timestamps for mapping
        if "Date" in df.columns:
            time_series = df["Date"].apply(lambda x: x.strftime("%Y-%m-%d"))
        elif "Datetime" in df.columns:
            time_series = df["Datetime"].apply(lambda x: x.strftime("%Y-%m-%d"))
        else:
            time_series = pd.Series(df.index).apply(lambda x: x.strftime("%Y-%m-%d") if hasattr(x, 'strftime') else str(x))

        result["time"] = time_series.tolist()

    except Exception as e:
        print(f"Error calculating indicators: {e}")
        pass

    return result
