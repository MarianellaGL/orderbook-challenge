
const LOCALE = "en-US";
const QUANTITY_DECIMALS = 2;
const SPREAD_PERCENT_DECIMALS = 2;

export function formatPrice(price: number, precision: number): string {
  return price.toLocaleString(LOCALE, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatQuantity(quantity: number): string {
  return quantity.toLocaleString(LOCALE, {
    minimumFractionDigits: QUANTITY_DECIMALS,
    maximumFractionDigits: QUANTITY_DECIMALS,
  });
}

export function formatSpreadPercent(spread: number, bestBid: number): string {
  if (bestBid <= 0) return "0.00";
  return ((spread / bestBid) * 100).toLocaleString(LOCALE, {
    minimumFractionDigits: SPREAD_PERCENT_DECIMALS,
    maximumFractionDigits: SPREAD_PERCENT_DECIMALS,
  });
}

export function getPrecisionFromTickSize(tickSize: number): number {
  if (tickSize <= 0) return 2;
  return Math.round(-Math.log10(tickSize));
}
