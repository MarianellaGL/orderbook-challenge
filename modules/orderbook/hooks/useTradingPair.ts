"use client";

import { useState } from "react";
import { TradingPair, TRADING_PAIRS } from "../types";

export function useTradingPair(defaultPair: TradingPair = "BTCUSDT") {
  const [selectedPair, setSelectedPair] = useState<TradingPair>(defaultPair);

  return {
    selectedPair,
    setSelectedPair,
    tradingPairs: TRADING_PAIRS,
  };
}
