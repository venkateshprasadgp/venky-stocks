import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const searchStocks = async (query: string) => {
  const response = await api.get(`/search?q=${query}`);
  return response.data;
};

export const getQuote = async (ticker: string) => {
  const response = await api.get(`/stock/${ticker}/quote`);
  return response.data;
};

export const getHistorical = async (ticker: string, timeframe: string = '1d', period: string = 'max') => {
  const response = await api.get(`/stock/${ticker}/historical?timeframe=${timeframe}&period=${period}`);
  return response.data;
};

export const getFundamentals = async (ticker: string) => {
  const response = await api.get(`/stock/${ticker}/fundamentals`);
  return response.data;
};

export default api;
