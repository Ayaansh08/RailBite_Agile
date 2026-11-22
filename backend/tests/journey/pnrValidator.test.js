const { isValidPnr } = require('../../src/journey/pnrValidator');

describe('RB-101: PNR Validation', () => {
  describe('Valid PNRs', () => {
    test('should accept a valid 10-digit numeric string', () => {
      expect(isValidPnr('1234567890')).toBe(true);
      expect(isValidPnr('9876543210')).toBe(true);
      expect(isValidPnr('0000000000')).toBe(true);
    });
  });

  describe('Invalid PNRs', () => {
    test('should reject strings with letters or symbols', () => {
      expect(isValidPnr('123456789A')).toBe(false);
      expect(isValidPnr('abcdefghij')).toBe(false);
      expect(isValidPnr('12345-6789')).toBe(false);
    });

    test('should reject strings with spaces', () => {
      expect(isValidPnr('12345 6789')).toBe(false);
      expect(isValidPnr(' 1234567890')).toBe(false);
      expect(isValidPnr('1234567890 ')).toBe(false);
      expect(isValidPnr(' 1234567890 ')).toBe(false);
    });

    test('should reject strings with length not equal to 10', () => {
      expect(isValidPnr('123456789')).toBe(false); // 9 digits
      expect(isValidPnr('12345678901')).toBe(false); // 11 digits
      expect(isValidPnr('')).toBe(false); // empty
    });

    test('should reject non-string types (null, undefined, numbers, objects, arrays)', () => {
      expect(isValidPnr(null)).toBe(false);
      expect(isValidPnr(undefined)).toBe(false);
      expect(isValidPnr(1234567890)).toBe(false); // non-string numbers
      expect(isValidPnr({})).toBe(false);
      expect(isValidPnr([])).toBe(false);
    });
  });
});
