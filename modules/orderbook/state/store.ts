
"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  OrderLevel,
  TradingPair,
  ConnectionStatus,
} from "../types";
import { fetchRawSnapshot } from "../api/binanceClient";
import { createDepthWebSocket, DepthDelta } from "../realtime/websocket";
import {
  applyDelta,
  mapToSortedArray,
  initializeFromSnapshot,
  shouldApplyDelta,
} from "../realtime/reconcile";
import { config } from "../../shared";

const BATCH_INTERVAL_MS = config.orderbook.batchIntervalMs;
const INITIAL_RECONNECT_DELAY_MS = config.reconnect.initialDelayMs;
const MAX_RECONNECT_DELAY_MS = config.reconnect.maxDelayMs;
const MAX_RECONNECT_ATTEMPTS = config.reconnect.maxAttempts;
const MAX_PENDING_DELTAS = config.orderbook.maxPendingDeltas;

interface OrderbookState {
  bids: OrderLevel[];
  asks: OrderLevel[];
  symbol: TradingPair;
  status: ConnectionStatus;
  error: Error | null;
  isPaused: boolean;

  setSymbol: (symbol: TradingPair) => void;
  disconnect: () => void;
  pause: () => void;
  resume: () => void;
}

interface InternalState {
  bidsMap: Map<string, number>;
  asksMap: Map<string, number>;
  lastUpdateId: number;
  isDirty: boolean;
  pendingDeltas: DepthDelta[];
  batchTimeout: ReturnType<typeof setTimeout> | null;
  cleanupWs: (() => void) | null;
  isIntentionalClose: boolean;
  reconnectAttempt: number;
  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  isInitialized: boolean;
  isPausedInternal: boolean;
  currentSymbol: string;
}

let internal: InternalState = {
  bidsMap: new Map(),
  asksMap: new Map(),
  lastUpdateId: 0,
  isDirty: false,
  pendingDeltas: [],
  batchTimeout: null,
  cleanupWs: null,
  isIntentionalClose: false,
  reconnectAttempt: 0,
  reconnectTimeout: null,
  isInitialized: false,
  isPausedInternal: false,
  currentSymbol: "BTCUSDT",
};

function resetInternal(preservePaused = false, newSymbol?: string) {
  const wasPaused = internal.isPausedInternal;
  internal = {
    bidsMap: new Map(),
    asksMap: new Map(),
    lastUpdateId: 0,
    isDirty: false,
    pendingDeltas: [],
    batchTimeout: null,
    cleanupWs: null,
    isIntentionalClose: false,
    reconnectAttempt: 0,
    reconnectTimeout: null,
    isInitialized: false,
    isPausedInternal: preservePaused ? wasPaused : false,
    currentSymbol: newSymbol ?? internal.currentSymbol,
  };
}

export const useOrderbookStore = create<OrderbookState>()(
  subscribeWithSelector((set, get) => {
    const getReconnectDelay = () => {
      const delay = INITIAL_RECONNECT_DELAY_MS * Math.pow(2, internal.reconnectAttempt);
      return Math.min(delay, MAX_RECONNECT_DELAY_MS);
    };

    const flushUpdates = () => {
      if (!internal.isDirty) return;

      const newBids = mapToSortedArray(internal.bidsMap, false);
      const newAsks = mapToSortedArray(internal.asksMap, true);

      internal.isDirty = false;
      internal.batchTimeout = null;

      set({ bids: newBids, asks: newAsks });
    };

    const scheduleBatch = () => {
      if (internal.batchTimeout) return;
      internal.batchTimeout = setTimeout(flushUpdates, BATCH_INTERVAL_MS);
    };

    const handleDelta = (delta: DepthDelta) => {
      // Ignore deltas from different symbols (prevents race condition on symbol change)
      if (delta.s !== internal.currentSymbol) {
        console.debug(`[orderbook] Ignoring delta for ${delta.s}, current symbol is ${internal.currentSymbol}`);
        return;
      }

      if (!internal.isInitialized) {
        if (internal.pendingDeltas.length < MAX_PENDING_DELTAS) {
          internal.pendingDeltas.push(delta);
        }
        return;
      }

      if (!shouldApplyDelta(delta.u, internal.lastUpdateId)) {
        return;
      }

      const bidsChanged = applyDelta(internal.bidsMap, delta.b);
      const asksChanged = applyDelta(internal.asksMap, delta.a);

      if (bidsChanged || asksChanged) {
        internal.lastUpdateId = delta.u;
        internal.isDirty = true;
        scheduleBatch();
      }
    };

    const synchronize = async () => {
      const { symbol } = get();

      try {
        const snapshot = await fetchRawSnapshot(symbol);
        const { bidsMap, asksMap } = initializeFromSnapshot(
          snapshot.bids,
          snapshot.asks
        );

        internal.bidsMap = bidsMap;
        internal.asksMap = asksMap;
        internal.lastUpdateId = snapshot.lastUpdateId;

        for (const delta of internal.pendingDeltas) {
          if (delta.u < snapshot.lastUpdateId) continue;
          applyDelta(internal.bidsMap, delta.b);
          applyDelta(internal.asksMap, delta.a);
        }

        internal.pendingDeltas = [];
        internal.isInitialized = true;
        internal.reconnectAttempt = 0;

        set({
          bids: mapToSortedArray(internal.bidsMap, false),
          asks: mapToSortedArray(internal.asksMap, true),
          status: "connected",
          error: null,
        });
      } catch (error) {
        console.error("Failed to synchronize:", error);
        scheduleReconnect();
      }
    };

    const connect = () => {
      if (internal.isIntentionalClose) return;

      const { symbol } = get();
      set({ status: "connecting" });
      internal.isInitialized = false;
      internal.pendingDeltas = [];

      internal.cleanupWs = createDepthWebSocket({
        symbol,
        onMessage: handleDelta,
        onOpen: () => synchronize(),
        onClose: (wasClean, code) => {
          internal.cleanupWs = null;

          if (internal.isIntentionalClose) {
            set({ status: "disconnected" });
            return;
          }

          const error = wasClean
            ? null
            : new Error(`Connection closed (code: ${code})`);

          set({ status: "reconnecting", error });
          scheduleReconnect();
        },
        onError: () => {
          if (!internal.isIntentionalClose) {
            set({
              status: "reconnecting",
              error: new Error("WebSocket connection failed")
            });
          }
        },
      });
    };

    const scheduleReconnect = () => {
      if (internal.isIntentionalClose || internal.reconnectTimeout) return;

      if (internal.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
        set({
          status: "error",
          error: new Error("Connection failed after multiple attempts"),
        });
        return;
      }

      const delay = getReconnectDelay();
      internal.reconnectTimeout = setTimeout(() => {
        internal.reconnectTimeout = null;
        internal.reconnectAttempt++;
        connect();
      }, delay);
    };

    const cleanup = () => {
      if (internal.batchTimeout) {
        clearTimeout(internal.batchTimeout);
      }
      if (internal.reconnectTimeout) {
        clearTimeout(internal.reconnectTimeout);
      }
      if (internal.cleanupWs) {
        internal.cleanupWs();
      }
    };

    return {
      bids: [],
      asks: [],
      symbol: "BTCUSDT",
      status: "disconnected",
      error: null,
      isPaused: false,

      setSymbol: (symbol: TradingPair) => {
        internal.isIntentionalClose = true;
        cleanup();
        resetInternal(true, symbol);

        set({
          symbol,
          bids: [],
          asks: [],
          status: internal.isPausedInternal ? "disconnected" : "connecting",
          error: null,
        });

        internal.isIntentionalClose = false;
        if (!internal.isPausedInternal) {
          connect();
        }
      },

      disconnect: () => {
        internal.isIntentionalClose = true;
        cleanup();
        resetInternal();
        set({
          status: "disconnected",
          bids: [],
          asks: [],
          isPaused: false,
        });
      },

      pause: () => {
        if (internal.isPausedInternal) return;
        internal.isPausedInternal = true;
        internal.isIntentionalClose = true;
        cleanup();
        if (internal.batchTimeout) {
          clearTimeout(internal.batchTimeout);
          internal.batchTimeout = null;
        }
        if (internal.reconnectTimeout) {
          clearTimeout(internal.reconnectTimeout);
          internal.reconnectTimeout = null;
        }
        if (internal.cleanupWs) {
          internal.cleanupWs();
          internal.cleanupWs = null;
        }
        set({ status: "disconnected", isPaused: true });
      },

      resume: () => {
        if (!internal.isPausedInternal) return;
        internal.isPausedInternal = false;
        internal.isIntentionalClose = false;
        internal.isInitialized = false;
        internal.pendingDeltas = [];
        internal.bidsMap = new Map();
        internal.asksMap = new Map();
        internal.lastUpdateId = 0;
        set({ isPaused: false, status: "connecting" });
        connect();
      },
    };
  })
);

export const useBids = () => useOrderbookStore((s) => s.bids);
export const useAsks = () => useOrderbookStore((s) => s.asks);
export const useSymbol = () => useOrderbookStore((s) => s.symbol);
export const useStatus = () => useOrderbookStore((s) => s.status);
export const useError = () => useOrderbookStore((s) => s.error);
export const useSetSymbol = () => useOrderbookStore((s) => s.setSymbol);

export const useBestBid = () => useOrderbookStore((s) => s.bids[0]?.price ?? 0);
export const useBestAsk = () => useOrderbookStore((s) => s.asks[0]?.price ?? 0);

export const useSpread = () =>
  useOrderbookStore((s) => {
    const bestBid = s.bids[0]?.price ?? 0;
    const bestAsk = s.asks[0]?.price ?? 0;
    return bestAsk - bestBid;
  });

export const useSpreadPercent = () =>
  useOrderbookStore((s) => {
    const bestBid = s.bids[0]?.price ?? 0;
    const bestAsk = s.asks[0]?.price ?? 0;
    const spread = bestAsk - bestBid;
    if (bestBid <= 0) return "0.00";
    return ((spread / bestBid) * 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

export const useMaxTotal = () =>
  useOrderbookStore((s) => {
    const bidsMax = s.bids[s.bids.length - 1]?.total ?? 0;
    const asksMax = s.asks[s.asks.length - 1]?.total ?? 0;
    return Math.max(bidsMax, asksMax);
  });

export const useIsLoading = () =>
  useOrderbookStore((s) => s.status === "connecting" && s.bids.length === 0);

export const useIsPaused = () => useOrderbookStore((s) => s.isPaused);
export const usePause = () => useOrderbookStore((s) => s.pause);
export const useResume = () => useOrderbookStore((s) => s.resume);
