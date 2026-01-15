import { OrderLevel } from "../types";
import { config } from "../../shared";

const MAX_LEVELS = config.orderbook.maxLevels;

export interface ReconcileState {
  bidsMap: Map<string, number>;
  asksMap: Map<string, number>;
  lastUpdateId: number;
}

export function applyDelta(
  map: Map<string, number>,
  updates: [string, string][]
): boolean {
  let changed = false;

  for (const [priceStr, quantityStr] of updates) {
    const quantity = parseFloat(quantityStr);
    const currentQuantity = map.get(priceStr);

    if (currentQuantity === quantity) {
      continue;
    }

    if (quantity === 0) {
      if (map.has(priceStr)) {
        map.delete(priceStr);
        changed = true;
      }
    } else {
      map.set(priceStr, quantity);
      changed = true;
    }
  }

  return changed;
}

export function mapToSortedArray(
  map: Map<string, number>,
  ascending: boolean
): OrderLevel[] {
  const entries = Array.from(map.entries())
    .map(([priceStr, quantity]) => ({
      price: parseFloat(priceStr),
      quantity,
      total: 0,
    }))
    .filter((entry) => entry.quantity > 0);

  entries.sort((a, b) => (ascending ? a.price - b.price : b.price - a.price));

  const limited = entries.slice(0, MAX_LEVELS);

  let cumulative = 0;
  for (const entry of limited) {
    cumulative += entry.quantity;
    entry.total = cumulative;
  }

  return limited;
}

export function initializeFromSnapshot(
  bids: [string, string][],
  asks: [string, string][]
): { bidsMap: Map<string, number>; asksMap: Map<string, number> } {
  const bidsMap = new Map<string, number>();
  const asksMap = new Map<string, number>();

  for (const [price, quantity] of bids) {
    const qty = parseFloat(quantity);
    if (qty > 0) {
      bidsMap.set(price, qty);
    }
  }

  for (const [price, quantity] of asks) {
    const qty = parseFloat(quantity);
    if (qty > 0) {
      asksMap.set(price, qty);
    }
  }

  return { bidsMap, asksMap };
}

export function shouldApplyDelta(
  deltaUpdateId: number,
  lastUpdateId: number
): boolean {
  return deltaUpdateId > lastUpdateId;
}

export function isValidFirstDelta(
  deltaFirstId: number,
  deltaLastId: number,
  snapshotUpdateId: number
): boolean {
  return deltaFirstId <= snapshotUpdateId + 1 && deltaLastId >= snapshotUpdateId + 1;
}
