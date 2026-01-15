import {
  formatPrice,
  formatQuantity,
  formatSpreadPercent,
  getPrecisionFromTickSize,
} from '../format';

describe('Format Utilities', () => {
  describe('formatPrice', () => {
    it('should format price with specified precision', () => {
      expect(formatPrice(1234.5678, 2)).toBe('1,234.57');
      expect(formatPrice(1234.5, 4)).toBe('1,234.5000');
    });

    it('should use US locale (comma thousands, dot decimals)', () => {
      expect(formatPrice(1000000.12, 2)).toBe('1,000,000.12');
    });

    it('should handle zero', () => {
      expect(formatPrice(0, 2)).toBe('0.00');
    });
  });

  describe('formatQuantity', () => {
    it('should format quantity with 2 decimal places', () => {
      expect(formatQuantity(1.23)).toBe('1.23');
    });

    it('should format large quantities with thousand separators', () => {
      expect(formatQuantity(1234.5678)).toBe('1,234.57');
    });
  });

  describe('formatSpreadPercent', () => {
    it('should calculate spread percentage with 2 decimals', () => {
      expect(formatSpreadPercent(10, 1000)).toBe('1.00');
      expect(formatSpreadPercent(5, 500)).toBe('1.00');
    });

    it('should return 0.00 when bestBid is zero', () => {
      expect(formatSpreadPercent(10, 0)).toBe('0.00');
    });

    it('should handle small spreads', () => {
      expect(formatSpreadPercent(0.01, 100)).toBe('0.01');
    });
  });

  describe('getPrecisionFromTickSize', () => {
    it('should calculate precision from tick size', () => {
      expect(getPrecisionFromTickSize(0.01)).toBe(2);
      expect(getPrecisionFromTickSize(0.001)).toBe(3);
      expect(getPrecisionFromTickSize(0.0001)).toBe(4);
      expect(Math.abs(getPrecisionFromTickSize(1))).toBe(0);
    });

    it('should return 2 for invalid tick size', () => {
      expect(getPrecisionFromTickSize(0)).toBe(2);
      expect(getPrecisionFromTickSize(-1)).toBe(2);
    });
  });
});
