"use client";

import { memo } from "react";
import { OrderLevel } from "../types";
import { formatPrice, formatQuantity } from "../../shared";

interface OrderRowProps {
  order: OrderLevel;
  maxTotal: number;
  type: "bid" | "ask";
  pricePrecision: number;
  quantityPrecision: number;
}


export const OrderRow = memo(
  function OrderRow({ order, maxTotal, type, pricePrecision, quantityPrecision }: OrderRowProps) {
    const isBid = type === "bid";
    const depthPercent = maxTotal > 0 ? order.total / maxTotal : 0;

    return (
      <div className="grid grid-cols-3 text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-3 relative group hover:bg-gray-800/30 transition-colors">
        <div
          className={`absolute inset-0 ${
            isBid ? "bg-emerald-500/10 origin-right" : "bg-rose-500/10 origin-left"
          } transition-transform`}
          style={{ transform: `scaleX(${depthPercent})` }}
        />
        <span className={`relative ${isBid ? "text-emerald-400" : "text-rose-400"}`}>
          {formatPrice(order.price, pricePrecision)}
        </span>
        <span className="relative text-right text-gray-300 tabular-nums">
          {formatQuantity(order.quantity, quantityPrecision)}
        </span>
        <span className="relative text-right text-gray-500 tabular-nums">
          {formatQuantity(order.total, quantityPrecision)}
        </span>
      </div>
    );
  },
  (prev, next) =>
    prev.order.price === next.order.price &&
    prev.order.quantity === next.order.quantity &&
    prev.order.total === next.order.total &&
    prev.maxTotal === next.maxTotal &&
    prev.type === next.type &&
    prev.pricePrecision === next.pricePrecision &&
    prev.quantityPrecision === next.quantityPrecision
);
