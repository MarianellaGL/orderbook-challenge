"use client";

import { memo } from "react";
import { OrderLevel } from "../types";
import { OrderRow } from "./OrderRow";

interface OrderBookSideProps {
  orders: OrderLevel[];
  maxTotal: number;
  type: "bid" | "ask";
  pricePrecision: number;
}


export const OrderBookSide = memo(function OrderBookSide({
  orders,
  maxTotal,
  type,
  pricePrecision,
}: OrderBookSideProps) {
  const isBid = type === "bid";

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-gray-800/50 overflow-hidden">
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-800/50">
        <h2
          className={`text-xs sm:text-sm font-medium ${
            isBid ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isBid ? "Bids" : "Asks"}
        </h2>
      </div>
      <div className="grid grid-cols-3 text-[10px] sm:text-xs text-gray-500 px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-800/30">
        <span>Price</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Total</span>
      </div>
      <div className="divide-y divide-gray-800/30">
        {orders.map((order) => (
          <OrderRow
            key={order.price}
            order={order}
            maxTotal={maxTotal}
            type={type}
            pricePrecision={pricePrecision}
          />
        ))}
      </div>
    </div>
  );
});
