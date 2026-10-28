from fastapi import APIRouter, HTTPException, Response
from typing import Optional
import json
import csv
from io import StringIO
from app.services import yfinance_service

router = APIRouter()

@router.get("/search")
def search(q: str):
    if not q:
        return []
    return yfinance_service.search_symbols(q)

@router.get("/stock/{ticker}/quote")
def get_quote(ticker: str):
    try:
        symbol = yfinance_service.get_ticker_with_suffix(ticker)
        data = yfinance_service.get_quote(symbol)
        if not data.get("ltp"):
            raise HTTPException(status_code=404, detail="Stock data not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stock/{ticker}/historical")
def get_historical(ticker: str, timeframe: str = "1d", period: str = "max"):
    try:
        symbol = yfinance_service.get_ticker_with_suffix(ticker)
        data = yfinance_service.get_historical_data(symbol, timeframe=timeframe, period=period)
        if not data:
            raise HTTPException(status_code=404, detail="Historical data not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stock/{ticker}/fundamentals")
def get_fundamentals(ticker: str):
    try:
        symbol = yfinance_service.get_ticker_with_suffix(ticker)
        data = yfinance_service.get_fundamentals(symbol)
        if not data.get("marketCap"):
            raise HTTPException(status_code=404, detail="Fundamentals not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stock/{ticker}/export")
def export_data(ticker: str, format: str = "csv"):
    try:
        symbol = yfinance_service.get_ticker_with_suffix(ticker)
        data = yfinance_service.get_historical_data(symbol, timeframe="1d", period="max")
        if not data:
            raise HTTPException(status_code=404, detail="No data available to export")

        if format.lower() == "json":
            return Response(content=json.dumps(data), media_type="application/json", headers={"Content-Disposition": f"attachment; filename={ticker}_data.json"})
        else:
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=["time", "open", "high", "low", "close", "volume"])
            writer.writeheader()
            for row in data:
                writer.writerow(row)
            return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={ticker}_data.csv"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
