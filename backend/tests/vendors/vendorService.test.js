const { getVendorsByStation } = require('../../src/vendors/vendorService');

describe('vendorService - getVendorsByStation', () => {
  it('should return vendors matching a known station code', () => {
    const vendors = getVendorsByStation('NDLS');
    expect(Array.isArray(vendors)).toBe(true);
    expect(vendors.length).toBeGreaterThan(0);
    vendors.forEach((vendor) => {
      expect(vendor.stationCode).toBe('NDLS');
      expect(vendor).toHaveProperty('id');
      expect(vendor).toHaveProperty('name');
      expect(vendor).toHaveProperty('menu');
      expect(Array.isArray(vendor.menu)).toBe(true);
    });
  });

  it('should handle station code case-insensitively and trimmed', () => {
    const vendorsLower = getVendorsByStation('ndls');
    const vendorsPadded = getVendorsByStation('  NDLS  ');
    const vendorsExact = getVendorsByStation('NDLS');

    expect(vendorsLower).toEqual(vendorsExact);
    expect(vendorsPadded).toEqual(vendorsExact);
  });

  it('should return an empty array for unknown station or station with no vendors', () => {
    const vendorsUnknown = getVendorsByStation('UNKNOWN');
    expect(vendorsUnknown).toEqual([]);

    const vendorsEmpty = getVendorsByStation('ZZZ');
    expect(vendorsEmpty).toEqual([]);
  });

  it('should return vendors sorted by name in ascending order', () => {
    const vendors = getVendorsByStation('NDLS');
    const names = vendors.map((v) => v.name);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sortedNames);
  });

  it('should throw an error for missing, empty, or whitespace-only station code', () => {
    expect(() => getVendorsByStation()).toThrow('Station code is required');
    expect(() => getVendorsByStation('')).toThrow('Station code is required');
    expect(() => getVendorsByStation('   ')).toThrow('Station code is required');
    expect(() => getVendorsByStation(null)).toThrow('Station code is required');
  });

  it('should not contain any credential fields in vendor or menu objects', () => {
    const vendors = getVendorsByStation('NDLS');
    const forbiddenFields = ['password', 'hash', 'token', 'secret', 'username', 'salt'];

    vendors.forEach((vendor) => {
      forbiddenFields.forEach((field) => {
        expect(vendor).not.toHaveProperty(field);
      });

      vendor.menu.forEach((item) => {
        forbiddenFields.forEach((field) => {
          expect(item).not.toHaveProperty(field);
        });
      });
    });
  });
});
