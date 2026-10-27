import yfinance as yf
import pandas as pd
from typing import Dict, Any, List, Optional
import datetime

def get_ticker_with_suffix(query: str, exchange_suffix: str = ".NS") -> str:
    """Helper to append suffix if missing."""
    query = query.upper()
    if not query.endswith(".NS") and not query.endswith(".BO"):
        return f"{query}{exchange_suffix}"
    return query

def search_symbols(query: str, exchange_suffix: str = ".NS") -> List[Dict[str, str]]:
    """Naive search helper for autocomplete."""
    # Since yfinance doesn't have a direct search API, we just format the query
    ticker = get_ticker_with_suffix(query, exchange_suffix)
    return [{"symbol": ticker, "name": query.upper()}]

def get_quote(ticker_symbol: str) -> Dict[str, Any]:
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info

    # Sometimes yfinance might not return all keys
    return {
        "ltp": info.get("currentPrice", info.get("regularMarketPrice")),
        "dayChange": info.get("regularMarketChange"),
        "changePercent": info.get("regularMarketChangePercent"),
        "dayHigh": info.get("dayHigh"),
        "dayLow": info.get("dayLow"),
        "high52w": info.get("fiftyTwoWeekHigh"),
        "low52w": info.get("fiftyTwoWeekLow"),
        "volume": info.get("volume"),
        "previousClose": info.get("previousClose"),
        "open": info.get("open"),
    }

def get_historical_data(ticker_symbol: str, timeframe: str = "1d", period: str = "1y") -> List[Dict[str, Any]]:
    # Map API timeframe to yfinance interval
    interval_map = {"1d": "1d", "1wk": "1wk", "1mo": "1mo"}
    interval = interval_map.get(timeframe, "1d")

    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period=period, interval=interval)

    if hist.empty:
        return []

    hist.reset_index(inplace=True)

    # Rename Date or Datetime to time
    if "Date" in hist.columns:
        hist.rename(columns={"Date": "time"}, inplace=True)
    elif "Datetime" in hist.columns:
        hist.rename(columns={"Datetime": "time"}, inplace=True)

    # Convert time to string YYYY-MM-DD
    hist["time"] = hist["time"].apply(lambda x: x.strftime("%Y-%m-%d"))

    # Keep only required columns
    columns_to_keep = ["time", "Open", "High", "Low", "Close", "Volume"]
    hist = hist[columns_to_keep]
    hist.rename(columns={"Open": "open", "High": "high", "Low": "low", "Close": "close", "Volume": "volume"}, inplace=True)

    return hist.to_dict(orient="records")

def get_fundamentals(ticker_symbol: str) -> Dict[str, Any]:
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info

    return {
        "marketCap": info.get("marketCap"),
        "peRatio": info.get("trailingPE"),
        "pbRatio": info.get("priceToBook"),
        "sectorPe": info.get("sectorPE"), # Might not be available
        "eps": info.get("trailingEps"),
        "dividendYield": info.get("dividendYield"),
        "52WeekHigh": info.get("fiftyTwoWeekHigh"),
        "52WeekLow": info.get("fiftyTwoWeekLow")
    }

def get_historical_df(ticker_symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
    """Returns raw dataframe for indicator calculation."""
    ticker = yf.Ticker(ticker_symbol)
    df = ticker.history(period=period, interval=interval)
    return df
