export interface OrderLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderbookData {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export interface OrderbookSnapshot extends OrderbookData {
  lastUpdateId: number;
}

export interface SymbolInfo {
  symbol: string;
  tickSize: number;
  pricePrecision: number;
  quantityPrecision: number;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export const TRADING_PAIRS = [
  { value: "BTCUSDT", label: "BTC / USDT" },
  { value: "ETHUSDT", label: "ETH / USDT" },
  { value: "SOLUSDT", label: "SOL / USDT" },
  { value: "BNBUSDT", label: "BNB / USDT" },
  { value: "XRPUSDT", label: "XRP / USDT" },
] as const;

export type TradingPair = (typeof TRADING_PAIRS)[number]["value"];
