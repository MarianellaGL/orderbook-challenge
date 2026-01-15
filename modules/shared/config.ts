function getEnvString(key: string, defaultValue: string): string {
  if (typeof window !== "undefined") {
    return process.env[key] ?? defaultValue;
  }
  return process.env[key] ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config = {
  binance: {
    restUrl: getEnvString(
      "NEXT_PUBLIC_BINANCE_REST_URL",
      "https://api.binance.com/api/v3"
    ),
    wsUrl: getEnvString(
      "NEXT_PUBLIC_BINANCE_WS_URL",
      "wss://stream.binance.com:9443/ws"
    ),
  },

  orderbook: {
    defaultSymbol: getEnvString("NEXT_PUBLIC_DEFAULT_SYMBOL", "BTCUSDT"),
    maxLevels: getEnvNumber("NEXT_PUBLIC_MAX_LEVELS", 10),
    batchIntervalMs: getEnvNumber("NEXT_PUBLIC_BATCH_INTERVAL_MS", 1000),
    maxPendingDeltas: getEnvNumber("NEXT_PUBLIC_MAX_PENDING_DELTAS", 50),
  },

  reconnect: {
    initialDelayMs: getEnvNumber(
      "NEXT_PUBLIC_RECONNECT_INITIAL_DELAY_MS",
      1000
    ),
    maxDelayMs: getEnvNumber("NEXT_PUBLIC_RECONNECT_MAX_DELAY_MS", 10000),
    maxAttempts: getEnvNumber("NEXT_PUBLIC_RECONNECT_MAX_ATTEMPTS", 5),
  },
} as const;

export type Config = typeof config;
