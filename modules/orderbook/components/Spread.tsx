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
    <div className="flex items-center justify-center gap-2 xs:gap-4 sm:gap-8 mb-4 sm:mb-6 flex-wrap">
      <div className="text-center min-w-0">
        <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
          Best Bid
        </p>
        <p className="text-base xs:text-lg sm:text-2xl font-medium text-emerald-400 tabular-nums truncate">
          {formatPrice(bestBid, pricePrecision)}
        </p>
      </div>
      <div className="text-center px-2 xs:px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-800/50 rounded-full">
        <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
          Spread
        </p>
        <p className="text-sm xs:text-base sm:text-lg font-medium tabular-nums whitespace-nowrap">
          {formatPrice(spread, pricePrecision)}{" "}
          <span className="text-gray-500 text-[10px] xs:text-xs sm:text-sm">({spreadPercent}%)</span>
        </p>
      </div>
      <div className="text-center min-w-0">
        <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
          Best Ask
        </p>
        <p className="text-base xs:text-lg sm:text-2xl font-medium text-rose-400 tabular-nums truncate">
          {formatPrice(bestAsk, pricePrecision)}
        </p>
      </div>
    </div>
  );
});
