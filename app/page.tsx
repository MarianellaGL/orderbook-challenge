"use client";

import {
  useOrderbook,
  useOrderbookBids,
  useOrderbookAsks,
  useOrderbookSpread,
  useOrderbookStatus,
  useMaxTotal,
  useIsPaused,
  useVisibilityPause,
  OrderBookSide,
  Spread,
  AssetSelector,
  DepthChart,
} from "@/modules/orderbook";

export default function Home() {
  useVisibilityPause();

  const { symbol, setSymbol, pricePrecision } = useOrderbook();
  const isPaused = useIsPaused();

  const { bids, isLoading: bidsLoading } = useOrderbookBids();
  const { asks, isLoading: asksLoading } = useOrderbookAsks();
  const { bestBid, bestAsk, spread, spreadPercent } = useOrderbookSpread();
  const { status, error } = useOrderbookStatus();
  const maxTotal = useMaxTotal();

  const isLoading = bidsLoading || asksLoading;
  const hasData = bids.length > 0;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-3 xs:p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 mb-4 xs:mb-6 sm:mb-10">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-light tracking-tight">Market Depth</h1>
          <AssetSelector selectedPair={symbol} onPairChange={setSymbol} />
        </header>

        {isPaused && (
          <div className="mb-3 xs:mb-4 px-3 xs:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 text-xs xs:text-sm text-center">
            Paused - Switch back to resume updates
          </div>
        )}

        {status === "reconnecting" && !isPaused && hasData && (
          <div className="mb-3 xs:mb-4 px-3 xs:px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-400 text-xs xs:text-sm text-center">
            Reconnecting...
          </div>
        )}

        {error && !hasData && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center bg-red-950/50 border border-red-900 rounded-2xl px-8 py-6">
              <p className="text-red-400 font-medium mb-2">
                Failed to load orderbook
              </p>
              <p className="text-gray-500 text-sm">
                Please check your connection and try again
              </p>
            </div>
          </div>
        )}

        {!error && (
          <>
            <div className="bg-gray-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-gray-800/50 p-3 xs:p-4 sm:p-6 mb-4 xs:mb-6 sm:mb-8">
              {hasData ? (
                <>
                  <Spread
                    bestBid={bestBid}
                    bestAsk={bestAsk}
                    spread={spread}
                    spreadPercent={spreadPercent}
                    pricePrecision={pricePrecision}
                  />
                  <DepthChart
                    bids={bids}
                    asks={asks}
                    pricePrecision={pricePrecision}
                  />
                </>
              ) : (
                <div className="h-40 xs:h-48 sm:h-64 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
              {hasData ? (
                <>
                  <OrderBookSide
                    orders={bids}
                    maxTotal={maxTotal}
                    type="bid"
                    pricePrecision={pricePrecision}
                  />
                  <OrderBookSide
                    orders={asks}
                    maxTotal={maxTotal}
                    type="ask"
                    pricePrecision={pricePrecision}
                  />
                </>
              ) : (
                <>
                  <div className="bg-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-800/50 h-96 animate-pulse" />
                  <div className="bg-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-800/50 h-96 animate-pulse" />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
