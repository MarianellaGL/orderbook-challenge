"use client";

import { memo } from "react";
import { TradingPair, TRADING_PAIRS } from "../types";

interface AssetSelectorProps {
  selectedPair: TradingPair;
  onPairChange: (pair: TradingPair) => void;
}

export const AssetSelector = memo(function AssetSelector({
  selectedPair,
  onPairChange,
}: AssetSelectorProps) {
  return (
    <select
      value={selectedPair}
      onChange={(e) => onPairChange(e.target.value as TradingPair)}
      className="bg-gray-900 border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors hover:border-gray-700 focus:outline-none focus:border-gray-600 w-full sm:w-auto"
    >
      {TRADING_PAIRS.map((pair) => (
        <option key={pair.value} value={pair.value}>
          {pair.label}
        </option>
      ))}
    </select>
  );
});
