"use client";

import { memo } from "react";
import { formatPrice } from "../../shared";

interface SpreadProps {
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: string;
  pricePrecision: number;
}


export const Spread = memo(function Spread({
  bestBid,
  bestAsk,
  spread,
  spreadPercent,
  pricePrecision,
}: SpreadProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4 sm:mb-6">
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">
            Best Bid
          </p>
          <p className="text-lg sm:text-2xl font-medium text-emerald-400 tabular-nums">
            {formatPrice(bestBid, pricePrecision)}
          </p>
        </div>
        <div className="text-center px-4 sm:px-6 py-2 bg-gray-800/50 rounded-full">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">
            Spread
          </p>
          <p className="text-base sm:text-lg font-medium tabular-nums">
            {formatPrice(spread, pricePrecision)}{" "}
            <span className="text-gray-500 text-xs sm:text-sm">({spreadPercent}%)</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">
            Best Ask
          </p>
          <p className="text-lg sm:text-2xl font-medium text-rose-400 tabular-nums">
            {formatPrice(bestAsk, pricePrecision)}
          </p>
        </div>
      </div>
    </div>
  );
});
