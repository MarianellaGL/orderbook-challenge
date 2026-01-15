"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useOrderbookStore,
  useBids,
  useAsks,
  useSymbol,
  useStatus,
  useError,
  useSetSymbol,
  useBestBid,
  useBestAsk,
  useSpread,
  useSpreadPercent,
  useMaxTotal,
  useIsLoading,
} from "../state/store";
import { fetchSymbolInfo } from "../api/binanceClient";
import { TradingPair } from "../types";


export function useOrderbook(initialSymbol: TradingPair = "BTCUSDT") {
  const setSymbol = useSetSymbol();
  const symbol = useSymbol();
  const status = useStatus();

  useEffect(() => {
    if (status === "disconnected") {
      setSymbol(initialSymbol);
    }

    return () => {
      useOrderbookStore.getState().disconnect();
    };
  }, []);

  const { data: symbolInfo } = useQuery({
    queryKey: ["symbolInfo", symbol],
    queryFn: () => fetchSymbolInfo(symbol),
    staleTime: Infinity,
  });

  return {
    symbol,
    setSymbol,
    pricePrecision: symbolInfo?.pricePrecision ?? 2,
    quantityPrecision: symbolInfo?.quantityPrecision ?? 8,
  };
}


export function useOrderbookBids() {
  const bids = useBids();
  const maxTotal = useMaxTotal();
  const isLoading = useIsLoading();
  return { bids, maxTotal, isLoading };
}


export function useOrderbookAsks() {
  const asks = useAsks();
  const maxTotal = useMaxTotal();
  const isLoading = useIsLoading();
  return { asks, maxTotal, isLoading };
}


export function useOrderbookSpread() {
  const bestBid = useBestBid();
  const bestAsk = useBestAsk();
  const spread = useSpread();
  const spreadPercent = useSpreadPercent();
  const isLoading = useIsLoading();
  return { bestBid, bestAsk, spread, spreadPercent, isLoading };
}


export function useOrderbookStatus() {
  const status = useStatus();
  const error = useError();
  const isLoading = useIsLoading();
  return { status, error, isLoading };
}
