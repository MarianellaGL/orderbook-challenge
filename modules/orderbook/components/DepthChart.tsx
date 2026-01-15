"use client";

import { memo, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { OrderLevel } from "../types";
import { formatPrice, formatQuantity, useBreakpoint } from "../../shared";

function formatCompactQuantity(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  if (value >= 1) return value.toFixed(2);
  return value.toPrecision(2);
}

function formatCompactPrice(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

interface DepthChartProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
  pricePrecision: number;
  quantityPrecision: number;
}



export const DepthChart = memo(function DepthChart({ bids, asks, pricePrecision, quantityPrecision }: DepthChartProps) {
  const { isMobile, isAtLeast } = useBreakpoint();

  const depthData = useMemo(() => [
    ...bids
      .slice()
      .reverse()
      .map((b) => ({ price: b.price, bids: b.total, asks: null })),
    ...asks.map((a) => ({ price: a.price, bids: null, asks: a.total })),
  ], [bids, asks]);

  const chartConfig = useMemo(() => ({
    fontSize: isMobile ? 8 : isAtLeast("md") ? 10 : 9,
    yAxisWidth: isMobile ? 35 : isAtLeast("md") ? 50 : 40,
    strokeWidth: isMobile ? 1 : 1.5,
    margin: isMobile
      ? { top: 5, right: 2, left: 0, bottom: 0 }
      : { top: 5, right: 5, left: 0, bottom: 0 },
  }), [isMobile, isAtLeast]);

  return (
    <div className="h-36 xs:h-44 sm:h-56 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={depthData} margin={chartConfig.margin}>
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
            tick={{ fill: "#6b7280", fontSize: chartConfig.fontSize }}
            tickFormatter={formatCompactPrice}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: chartConfig.fontSize }}
            width={chartConfig.yAxisWidth}
            tickFormatter={formatCompactQuantity}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "11px",
            }}
            labelFormatter={(v) => `Price: ${formatPrice(Number(v), pricePrecision)}`}
            formatter={(value, name) => [formatQuantity(Number(value), quantityPrecision), name === "bids" ? "Bids" : "Asks"]}
          />
          <Area
            type="stepAfter"
            dataKey="bids"
            stroke="#10b981"
            strokeWidth={chartConfig.strokeWidth}
            fill="url(#bidGradient)"
            connectNulls={false}
          />
          <Area
            type="stepAfter"
            dataKey="asks"
            stroke="#f43f5e"
            strokeWidth={chartConfig.strokeWidth}
            fill="url(#askGradient)"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
