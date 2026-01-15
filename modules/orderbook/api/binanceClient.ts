
import { OrderLevel, OrderbookData, SymbolInfo } from "../types";
import { getPrecisionFromTickSize, config } from "../../shared";

const BASE_URL = config.binance.restUrl;

interface BinanceDepthResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface BinanceExchangeInfoResponse {
  symbols: {
    symbol: string;
    filters: {
      filterType: string;
      tickSize?: string;
    }[];
    quoteAssetPrecision: number;
    baseAssetPrecision: number;
  }[];
}

function parseOrders(
  orders: [string, string][],
  ascending: boolean
): OrderLevel[] {
  const parsed = orders.map(([price, quantity]) => ({
    price: parseFloat(price),
    quantity: parseFloat(quantity),
    total: 0,
  }));

  parsed.sort((a, b) => (ascending ? a.price - b.price : b.price - a.price));

  let cumulative = 0;
  for (const order of parsed) {
    cumulative += order.quantity;
    order.total = cumulative;
  }

  return parsed;
}


export async function fetchOrderbookSnapshot(
  symbol: string,
  limit: number = 1000
): Promise<{ data: OrderbookData; lastUpdateId: number }> {
  const response = await fetch(`${BASE_URL}/depth?symbol=${symbol}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch orderbook: ${response.status}`);
  }

  const data: BinanceDepthResponse = await response.json();

  return {
    data: {
      bids: parseOrders(data.bids, false),
      asks: parseOrders(data.asks, true),
    },
    lastUpdateId: data.lastUpdateId,
  };
}


export async function fetchRawSnapshot(
  symbol: string,
  limit: number = 1000
): Promise<BinanceDepthResponse> {
  const response = await fetch(`${BASE_URL}/depth?symbol=${symbol}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch snapshot: ${response.status}`);
  }

  return response.json();
}


export async function fetchSymbolInfo(symbol: string): Promise<SymbolInfo> {
  const response = await fetch(`${BASE_URL}/exchangeInfo?symbol=${symbol}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange info: ${response.status}`);
  }

  const data: BinanceExchangeInfoResponse = await response.json();
  const symbolData = data.symbols[0];

  const priceFilter = symbolData.filters.find(
    (f) => f.filterType === "PRICE_FILTER"
  );
  const tickSize = priceFilter?.tickSize ? parseFloat(priceFilter.tickSize) : 0.01;

  return {
    symbol: symbolData.symbol,
    tickSize,
    pricePrecision: getPrecisionFromTickSize(tickSize),
    quantityPrecision: symbolData.baseAssetPrecision,
  };
}
