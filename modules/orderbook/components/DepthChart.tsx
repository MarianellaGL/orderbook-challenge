"use client";

import { memo, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { OrderLevel } from "../types";
import { formatPrice, formatQuantity } from "../../shared";

interface DepthChartProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
  pricePrecision: number;
}



export const DepthChart = memo(function DepthChart({ bids, asks, pricePrecision }: DepthChartProps) {
  const depthData = useMemo(() => [
    ...bids
      .slice()
      .reverse()
      .map((b) => ({ price: b.price, bids: b.total, asks: null })),
    ...asks.map((a) => ({ price: a.price, bids: null, asks: a.total })),
  ], [bids, asks]);

  return (
    <div className="h-48 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={depthData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="price"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickFormatter={(v) => formatPrice(v, pricePrecision)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            width={50}
            tickFormatter={(v) => formatQuantity(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "11px",
            }}
            labelFormatter={(v) => `Price: ${formatPrice(Number(v), pricePrecision)}`}
            formatter={(value, name) => [formatQuantity(Number(value)), name === "bids" ? "Bids" : "Asks"]}
          />
          <Area
            type="stepAfter"
            dataKey="bids"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#bidGradient)"
            connectNulls={false}
          />
          <Area
            type="stepAfter"
            dataKey="asks"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#askGradient)"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
