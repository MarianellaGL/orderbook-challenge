import {
  applyDelta,
  mapToSortedArray,
  initializeFromSnapshot,
  shouldApplyDelta,
  isValidFirstDelta,
} from '../realtime/reconcile';

describe('Reconcile Module', () => {
  describe('applyDelta', () => {
    it('should add new price levels to the map', () => {
      const map = new Map<string, number>();
      const updates: [string, string][] = [
        ['100.00', '1.5'],
        ['101.00', '2.0'],
      ];

      const changed = applyDelta(map, updates);

      expect(changed).toBe(true);
      expect(map.get('100.00')).toBe(1.5);
      expect(map.get('101.00')).toBe(2.0);
    });

    it('should remove price levels when quantity is zero', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.5);
      map.set('101.00', 2.0);

      const updates: [string, string][] = [['100.00', '0']];
      const changed = applyDelta(map, updates);

      expect(changed).toBe(true);
      expect(map.has('100.00')).toBe(false);
      expect(map.get('101.00')).toBe(2.0);
    });

    it('should not trigger change when value is the same (deduplication)', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.5);

      const updates: [string, string][] = [['100.00', '1.5']];
      const changed = applyDelta(map, updates);

      expect(changed).toBe(false);
    });

    it('should update existing price levels', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.5);

      const updates: [string, string][] = [['100.00', '3.0']];
      const changed = applyDelta(map, updates);

      expect(changed).toBe(true);
      expect(map.get('100.00')).toBe(3.0);
    });
  });

  describe('mapToSortedArray', () => {
    it('should sort bids descending (highest first)', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.0);
      map.set('102.00', 2.0);
      map.set('101.00', 1.5);

      const result = mapToSortedArray(map, false);

      expect(result[0].price).toBe(102);
      expect(result[1].price).toBe(101);
      expect(result[2].price).toBe(100);
    });

    it('should sort asks ascending (lowest first)', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.0);
      map.set('102.00', 2.0);
      map.set('101.00', 1.5);

      const result = mapToSortedArray(map, true);

      expect(result[0].price).toBe(100);
      expect(result[1].price).toBe(101);
      expect(result[2].price).toBe(102);
    });

    it('should calculate cumulative totals', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.0);
      map.set('101.00', 2.0);
      map.set('102.00', 3.0);

      const result = mapToSortedArray(map, true);

      expect(result[0].total).toBe(1.0);
      expect(result[1].total).toBe(3.0);
      expect(result[2].total).toBe(6.0);
    });

    it('should filter out zero quantities', () => {
      const map = new Map<string, number>();
      map.set('100.00', 1.0);
      map.set('101.00', 0);
      map.set('102.00', 2.0);

      const result = mapToSortedArray(map, true);

      expect(result.length).toBe(2);
      expect(result.find(r => r.price === 101)).toBeUndefined();
    });

    it('should limit to MAX_LEVELS entries', () => {
      const map = new Map<string, number>();
      for (let i = 0; i < 20; i++) {
        map.set(`${100 + i}.00`, 1.0);
      }

      const result = mapToSortedArray(map, true);

      expect(result.length).toBe(10);
    });
  });

  describe('initializeFromSnapshot', () => {
    it('should create maps from bid/ask arrays', () => {
      const bids: [string, string][] = [
        ['100.00', '1.0'],
        ['99.00', '2.0'],
      ];
      const asks: [string, string][] = [
        ['101.00', '1.5'],
        ['102.00', '2.5'],
      ];

      const { bidsMap, asksMap } = initializeFromSnapshot(bids, asks);

      expect(bidsMap.get('100.00')).toBe(1.0);
      expect(bidsMap.get('99.00')).toBe(2.0);
      expect(asksMap.get('101.00')).toBe(1.5);
      expect(asksMap.get('102.00')).toBe(2.5);
    });

    it('should filter out zero quantities from snapshot', () => {
      const bids: [string, string][] = [
        ['100.00', '1.0'],
        ['99.00', '0'],
      ];
      const asks: [string, string][] = [];

      const { bidsMap } = initializeFromSnapshot(bids, asks);

      expect(bidsMap.size).toBe(1);
      expect(bidsMap.has('99.00')).toBe(false);
    });
  });

  describe('shouldApplyDelta', () => {
    it('should return true when delta is newer than last update', () => {
      expect(shouldApplyDelta(100, 99)).toBe(true);
    });

    it('should return false when delta is older or equal', () => {
      expect(shouldApplyDelta(99, 100)).toBe(false);
      expect(shouldApplyDelta(100, 100)).toBe(false);
    });
  });

  describe('isValidFirstDelta', () => {
    it('should validate first delta after snapshot', () => {
      expect(isValidFirstDelta(100, 105, 102)).toBe(true);
      expect(isValidFirstDelta(100, 101, 100)).toBe(true);
    });

    it('should reject invalid first delta', () => {
      expect(isValidFirstDelta(110, 115, 100)).toBe(false);
    });
  });
});
